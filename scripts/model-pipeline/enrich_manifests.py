"""Adds Terminologia Anatomica (Latin) names from Z-Anatomy's TA2.csv to each bundle manifest where the English
name matches exactly (case-insensitive). No guessing: unmatched meshes simply have no Latin name.
usage: python3 enrich_manifests.py <TA2.csv> <models_dir>"""
import csv, json, sys, glob, os, re
ta2, d = sys.argv[1], sys.argv[2]
latin = {}
with open(ta2, encoding='utf-8-sig') as f:
    for row in csv.reader(f, delimiter=';'):
        if len(row) >= 3 and row[0].strip('"').split(';')[0] != 'TA2ID':
            en, la = row[1].strip().strip('"'), row[2].strip().strip('"')
            if en: latin.setdefault(en.lower(), la)
        elif row and ';' in row[0]:
            parts = row[0].strip('"').split(';')
            if len(parts) >= 3 and parts[0].isdigit(): latin.setdefault(parts[1].strip().lower(), parts[2].strip())
tot = hit = 0
for p in sorted(glob.glob(os.path.join(d, '*.json'))):
    if os.path.basename(p).startswith('_') or os.path.basename(p) in ('catalogue.json', 'verification.json'): continue
    m = json.load(open(p))
    for r in m['meshes']:
        tot += 1
        la = latin.get(r['name'].lower())
        if la: r['latin'] = la; hit += 1
    json.dump(m, open(p, 'w'), separators=(',', ':'))
print('meshes', tot, 'with Latin name', hit)
