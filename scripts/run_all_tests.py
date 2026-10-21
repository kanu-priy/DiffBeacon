#!/usr/bin/env python
"""
DiffBeacon Test Runner Script
Executes backend pytest and frontend vitest test suites.
"""
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def run_command(cmd, cwd):
    print(f"\n[DiffBeacon] Running: {' '.join(cmd)} in {cwd}")
    res = subprocess.run(cmd, cwd=cwd)
    if res.returncode != 0:
        print(f"[DiffBeacon] Command failed with code {res.returncode}")
        sys.exit(res.returncode)


def main():
    print("=== Running Backend Pytest Suite ===")
    run_command(["pytest"], ROOT / "backend")

    print("\n=== Running Frontend Vitest Suite ===")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    run_command([npm_cmd, "test"], ROOT / "frontend")

    print("\n=== Verifying Frontend Production Build ===")
    run_command([npm_cmd, "run", "build"], ROOT / "frontend")

    print("\n==========================================")
    print("  ALL DIFFBEACON TESTS & BUILDS PASSED!   ")
    print("==========================================")


if __name__ == "__main__":
    main()
