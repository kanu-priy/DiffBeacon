import io
import os
import tempfile
import zipfile
import pytest
from apps.ingestion.archiver import SafeArchiveExtractor, IngestionSecurityError


def test_classify_files():
    extractor = SafeArchiveExtractor()
    assert extractor.classify_file("api/views.py") == ("source", "python")
    assert extractor.classify_file("tests/test_api.py") == ("test", "python")
    assert extractor.classify_file("migrations/0001_initial.py") == ("migration", "python")
    assert extractor.classify_file("config/settings.json") == ("config", "json")
    assert extractor.classify_file(".venv/lib/python3.11/site-packages/pkg.py") == ("skipped", "ignored")


def test_safe_zip_extraction():
    extractor = SafeArchiveExtractor()
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w") as zf:
        zf.writestr("module/app.py", "def hello(): return 'world'\n")
        zf.writestr("tests/test_app.py", "def test_hello(): pass\n")

    buffer.seek(0)
    with tempfile.TemporaryDirectory() as tmpdir:
        manifest = extractor.extract_zip(buffer, tmpdir)
        assert len(manifest) == 2
        paths = [m["relative_path"] for m in manifest]
        assert "module/app.py" in paths
        assert "tests/test_app.py" in paths


def test_zip_slip_rejection():
    extractor = SafeArchiveExtractor()
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w") as zf:
        # Malicious traversal path
        zf.writestr("../../etc/passwd", "root:x:0:0:::")

    buffer.seek(0)
    with tempfile.TemporaryDirectory() as tmpdir:
        with pytest.raises(IngestionSecurityError) as exc_info:
            extractor.extract_zip(buffer, tmpdir)
        assert "Path traversal detected" in str(exc_info.value)


def test_file_count_limit_rejection():
    extractor = SafeArchiveExtractor(max_files=5)
    buffer = io.BytesIO()

    with zipfile.ZipFile(buffer, "w") as zf:
        for i in range(10):
            zf.writestr(f"file_{i}.py", "x = 1\n")

    buffer.seek(0)
    with tempfile.TemporaryDirectory() as tmpdir:
        with pytest.raises(IngestionSecurityError) as exc_info:
            extractor.extract_zip(buffer, tmpdir)
        assert "exceeding safety limit" in str(exc_info.value) or "exceeds maximum file count" in str(exc_info.value)
