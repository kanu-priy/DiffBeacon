import hashlib
import os
import zipfile
from pathlib import Path
from typing import Dict, List, Tuple
from django.conf import settings


class IngestionSecurityError(Exception):
    """Raised when an uploaded archive violates security boundaries."""
    pass


class SafeArchiveExtractor:
    """
    Safely extracts and classifies ZIP archives with ZipSlip protection,
    file-count limits, and size bounds.
    """

    def __init__(
        self,
        max_archive_bytes: int = None,
        max_uncompressed_bytes: int = None,
        max_files: int = None,
    ):
        self.max_archive_bytes = max_archive_bytes or getattr(
            settings, "MAX_ARCHIVE_SIZE_BYTES", 25 * 1024 * 1024
        )
        self.max_uncompressed_bytes = max_uncompressed_bytes or getattr(
            settings, "MAX_UNCOMPRESSED_SIZE_BYTES", 100 * 1024 * 1024
        )
        self.max_files = max_files or getattr(settings, "MAX_FILE_COUNT", 1000)

    def compute_sha256(self, file_path: str) -> str:
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def compute_bytes_sha256(self, data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    def classify_file(self, relative_path: str) -> Tuple[str, str]:
        """
        Classifies file into (classification, language).
        """
        norm_path = relative_path.replace("\\", "/").lower()
        ext = os.path.splitext(norm_path)[1]

        # Ignore virtualenvs, git, cache
        if any(
            part in norm_path.split("/")
            for part in (".venv", "venv", "__pycache__", ".git", "node_modules")
        ):
            return "skipped", "ignored"

        is_test = any(t in norm_path for t in ("tests/", "test_", "_test.", ".test.", ".spec."))

        if "migrations/" in norm_path:
            return "migration", "python" if ext == ".py" else ext[1:]

        # Check multi-language registry for all Tier 1 and Tier 2 languages
        try:
            from apps.code_index.multi_parser import MultiLanguageParserService
            lang = MultiLanguageParserService.identify_language(norm_path)
            if lang:
                if is_test:
                    return "test", lang
                if lang in ("json", "yaml", "toml"):
                    return "config", lang
                return "source", lang
        except Exception:
            pass

        if is_test:
            return "test", "python" if ext == ".py" else ext[1:]
        elif ext == ".py":
            return "source", "python"
        elif ext in (".json", ".yaml", ".yml", ".toml", ".ini", ".env", ".xml", ".properties"):
            return "config", ext[1:]
        elif ext in (".md", ".rst", ".txt"):
            return "doc", ext[1:]
        else:
            return "skipped", "unsupported"

    def extract_zip(
        self, zip_source, target_directory: str
    ) -> List[Dict[str, any]]:
        """
        Extracts ZIP source (file path or file-like object) into target directory safely.
        """
        target_path = Path(target_directory).resolve()
        target_path.mkdir(parents=True, exist_ok=True)
        canonical_target = os.path.realpath(str(target_path)) + os.path.sep

        manifest = []
        total_uncompressed = 0
        file_count = 0

        with zipfile.ZipFile(zip_source, "r") as archive:
            entries = archive.infolist()
            if len(entries) > self.max_files:
                raise IngestionSecurityError(
                    f"Archive contains {len(entries)} entries, exceeding safety limit of {self.max_files}."
                )

            for entry in entries:
                if entry.is_dir():
                    continue

                file_count += 1
                if file_count > self.max_files:
                    raise IngestionSecurityError(
                        f"Archive exceeds maximum file count of {self.max_files}."
                    )

                total_uncompressed += entry.file_size
                if total_uncompressed > self.max_uncompressed_bytes:
                    raise IngestionSecurityError(
                        f"Uncompressed archive size exceeds limit of {self.max_uncompressed_bytes / (1024*1024):.1f} MB."
                    )

                # ZipSlip Protection: Ensure destination path is strictly within canonical_target
                dest_file_path = os.path.realpath(
                    os.path.join(target_path, entry.filename)
                )
                if not dest_file_path.startswith(canonical_target):
                    raise IngestionSecurityError(
                        f"Path traversal detected in archive entry: {entry.filename}"
                    )

                # Ensure parent dirs exist
                os.makedirs(os.path.dirname(dest_file_path), exist_ok=True)

                # Extract file contents safely
                with archive.open(entry) as src, open(dest_file_path, "wb") as dst:
                    for chunk in iter(lambda: src.read(65536), b""):
                        dst.write(chunk)

                # File classification and metadata
                rel_path = os.path.relpath(dest_file_path, target_path).replace(
                    "\\", "/"
                )
                classification, language = self.classify_file(rel_path)
                file_hash = self.compute_sha256(dest_file_path)

                # Count lines if text
                line_count = 0
                parse_status = "parsed"
                if classification in ("source", "test", "migration", "config", "doc"):
                    try:
                        with open(dest_file_path, "r", encoding="utf-8", errors="replace") as f:
                            lines = f.readlines()
                            line_count = len(lines)
                    except Exception as e:
                        parse_status = "skipped"

                manifest.append(
                    {
                        "relative_path": rel_path,
                        "content_hash": file_hash,
                        "language": language,
                        "file_classification": classification,
                        "line_count": line_count,
                        "parse_status": parse_status,
                        "absolute_path": dest_file_path,
                    }
                )

        return manifest

    def scan_directory(self, source_directory: str) -> List[Dict[str, any]]:
        """
        Scans an existing directory (such as fixtures) and creates a file manifest.
        """
        source_path = Path(source_directory).resolve()
        manifest = []

        for root, dirs, files in os.walk(source_path):
            # Ignore cache, git, venvs
            dirs[:] = [
                d
                for d in dirs
                if d not in ("__pycache__", ".venv", "venv", ".git", "node_modules")
            ]
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, source_path).replace("\\", "/")
                classification, language = self.classify_file(rel_path)
                file_hash = self.compute_sha256(abs_path)

                line_count = 0
                parse_status = "parsed"
                if classification in ("source", "test", "migration", "config", "doc"):
                    try:
                        with open(abs_path, "r", encoding="utf-8", errors="replace") as f:
                            lines = f.readlines()
                            line_count = len(lines)
                    except Exception:
                        parse_status = "skipped"

                manifest.append(
                    {
                        "relative_path": rel_path,
                        "content_hash": file_hash,
                        "language": language,
                        "file_classification": classification,
                        "line_count": line_count,
                        "parse_status": parse_status,
                        "absolute_path": abs_path,
                    }
                )

        return manifest
