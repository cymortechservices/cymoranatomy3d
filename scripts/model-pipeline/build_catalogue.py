"""Builds src/data/atlas.catalogue.json from the exported bundles (sizes, checksums, bounds, counts)."""
import json, glob, os, hashlib, sys
d = sys.argv[1] if len(sys.argv) > 1 else 'public/models/zanatomy'
out = sys.argv[2] if len(sys.argv) > 2 else 'src/data/atlas.catalogue.json'
rep = json.load(open(os.path.join(d, '_report.json')))
cat = []
for p in sorted(glob.glob(os.path.join(d, '*.json'))):
    b = os.path.basename(p)
    if b.startswith('_') or b in ('catalogue.json', 'verification.json'): continue
    m = json.load(open(p))
    glb = os.path.join(d, m['file'])
    boxes = [r['bbox'] for r in m['meshes'] if r.get('bbox')]
    lo = [min(b[0][i] for b in boxes) for i in range(3)]; hi = [max(b[1][i] for b in boxes) for i in range(3)]
    cat.append(dict(id=m['bundle'], title=m['title'], system=m['system'], file=m['file'], manifest=b, bytes=os.path.getsize(glb),
        manifest_bytes=os.path.getsize(p), sha256=hashlib.sha256(open(glb, 'rb').read()).hexdigest(), mesh_count=len(m['meshes']),
        tris_source=m['tris_source'], tris_out=m['tris_out'], decimation_ratio=m['decimation_ratio'], bbox=[lo, hi],
        latin_names=sum(1 for r in m['meshes'] if r.get('latin'))))
order = ['skeleton', 'joints', 'muscles', 'fasciae', 'heart', 'vessels', 'respiratory', 'digestive', 'urinary', 'reproductive', 'endocrine', 'lymphatic', 'cns', 'pns', 'sensory']
cat.sort(key=lambda c: order.index(c['id']))
json.dump(dict(skipped=rep['skipped'], bundles=cat), open(out, 'w'), indent=1)
print(len(cat), 'bundles', sum(c['mesh_count'] for c in cat), 'meshes', sum(c['bytes'] for c in cat) // 1024, 'KiB')
