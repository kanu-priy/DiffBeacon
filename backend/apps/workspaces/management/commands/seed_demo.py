import os
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from apps.workspaces.models import Workspace
from apps.snapshots.models import SourceSnapshot, SourceFile
from apps.analysis.models import AnalysisRun
from apps.ingestion.archiver import SafeArchiveExtractor
from apps.analysis.engine import AnalysisPipelineEngine


class Command(BaseCommand):
    help = "Seeds the BeaconWorks API fixture project and runs the initial 12-stage analysis."

    def handle(self, *args, **options):
        fixtures_base = Path(settings.FIXTURES_DIR) / "base"
        fixtures_head = Path(settings.FIXTURES_DIR) / "head"

        if not fixtures_base.exists() or not fixtures_head.exists():
            self.stderr.write(self.style.ERROR(f"Fixtures not found at {settings.FIXTURES_DIR}"))
            return

        self.stdout.write("Initializing BeaconWorks API demo workspace...")
        workspace, created = Workspace.objects.get_or_create(
            slug="beaconworks-api-demo",
            defaults={
                "name": "BeaconWorks API (Demo)",
                "description": "Fictional enterprise employee & payroll service demonstrating change-impact intelligence.",
                "is_demo": True,
            },
        )

        extractor = SafeArchiveExtractor()

        # Ingest Base
        self.stdout.write("Ingesting Base Snapshot (v1.0-baseline)...")
        base_manifest = extractor.scan_directory(str(fixtures_base))
        base_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label="v1.0-baseline",
            storage_path=str(fixtures_base),
            file_count=len(base_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in base_manifest),
            ingestion_status="ready",
        )
        for m in base_manifest:
            SourceFile.objects.create(
                snapshot=base_snap,
                relative_path=m["relative_path"],
                content_hash=m["content_hash"],
                language=m["language"],
                file_classification=m["file_classification"],
                line_count=m["line_count"],
                parse_status=m["parse_status"],
            )

        # Ingest Head
        self.stdout.write("Ingesting Head Snapshot (v1.1-department-update)...")
        head_manifest = extractor.scan_directory(str(fixtures_head))
        head_snap = SourceSnapshot.objects.create(
            workspace=workspace,
            label="v1.1-department-update",
            storage_path=str(fixtures_head),
            file_count=len(head_manifest),
            total_bytes=sum(os.path.getsize(m["absolute_path"]) for m in head_manifest),
            ingestion_status="ready",
        )
        for m in head_manifest:
            SourceFile.objects.create(
                snapshot=head_snap,
                relative_path=m["relative_path"],
                content_hash=m["content_hash"],
                language=m["language"],
                file_classification=m["file_classification"],
                line_count=m["line_count"],
                parse_status=m["parse_status"],
            )

        # Create & Run Analysis
        self.stdout.write("Executing 12-stage analysis pipeline...")
        analysis = AnalysisRun.objects.create(
            workspace=workspace,
            base_snapshot=base_snap,
            head_snapshot=head_snap,
            status="queued",
            ai_provider_name=getattr(settings, "LLM_PROVIDER", "mock"),
        )

        engine = AnalysisPipelineEngine()
        completed = engine.run_analysis(str(analysis.id))

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully completed analysis {completed.id}!\n"
                f"Deltas: {completed.deltas.count()} | Contracts: {completed.contracts.count()} | "
                f"Unknowns: {completed.unknowns.count()} | Scenarios: {completed.scenarios.count()}"
            )
        )
