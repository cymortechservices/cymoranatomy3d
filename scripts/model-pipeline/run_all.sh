#!/usr/bin/env bash
# Rebuilds public/models/zanatomy/ from the Z-Anatomy repository. See docs/MODEL_SOURCING.md.
# Needs: git, python3.11 with `pip install bpy numpy` (Blender as a module), and network access to github.com.
set -euo pipefail
WORK="${1:-/tmp/zanatomy-build}"; OUT="$(pwd)/public/models/zanatomy"
mkdir -p "$WORK"; cd "$WORK"
[ -d repo ] || GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/Z-Anatomy/Models-of-human-anatomy repo
unzip -o -q repo/Z-Anatomy.zip 'Z-Anatomy/Startup.blend' -d ex
cd - >/dev/null
rm -f "$OUT"/*.glb "$OUT"/*.json
python3.11 -I scripts/model-pipeline/export_zanatomy.py "$WORK/ex/Z-Anatomy/Startup.blend" "$OUT"   # use the interpreter that has bpy
python3 scripts/model-pipeline/enrich_manifests.py "$WORK/repo/TA2.csv" "$OUT"
python3 scripts/model-pipeline/build_catalogue.py
