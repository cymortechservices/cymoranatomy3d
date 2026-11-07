"""
Z-Anatomy -> web GLB exporter (run with Blender's Python: `python -I export_zanatomy.py <Startup.blend> <out_dir>`).

Reads the CC BY-SA 4.0 Z-Anatomy Blender atlas, and for each body-system bundle:
  * evaluates every geometry object (applies modifiers, converts curves such as vessels/nerves to meshes),
  * bakes world transforms so all bundles share one body coordinate frame,
  * decimates to a per-bundle triangle budget (collapse decimation, per-object floor),
  * applies a documented CYMOR colour palette (source materials are shader node groups with no portable colour),
  * exports Draco-compressed GLB with one named node per source object, and writes a JSON manifest.
Nothing is invented: every node is an object that exists in the source file.
"""
import bpy, json, re, sys, os, time, math

SRC, OUT = sys.argv[-2], sys.argv[-1]
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=SRC)
dg = bpy.context.evaluated_depsgraph_get()

def chain(o):
    c = []
    while o.parent:
        o = o.parent
        c.append(o.name)
    return c

SIDE = {'l': 'left', 'r': 'right'}
def clean(name):
    base, side = name, None
    m = re.match(r'^(.*)\.(l|r)$', name)
    if m: base, side = m.group(1), SIDE[m.group(2)]
    base = re.sub(r'\.(g|j|i)$', '', base)
    return base.strip(), side

def slug(name, side):
    s = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
    s = s or 'unnamed'
    return f'{s}-{side}' if side else s

def hexlin(h):
    h = h.lstrip('#'); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1.0)

def color_for(bundle, name, mat):
    n, m = name.lower(), (mat or '').lower()
    if bundle in ('skeleton', 'joints'):
        if 'cartilage' in m or 'cartilage' in n or 'disc' in n or 'meniscus' in n: return '#9CCFD4'
        if 'ligament' in m or 'ligament' in n or 'capsule' in n or 'membrane' in n: return '#EFE6C8'
        return '#E9DDC3'
    if bundle == 'muscles':
        if 'fascia' in n or 'fascia' in m or 'aponeurosis' in n or 'tendon' in n or 'retinacul' in n: return '#E8D6B8'
        return '#B4403A'
    if bundle in ('heart', 'vessels'):
        if 'valve' in n or 'leaflet' in n or 'chordae' in n: return '#E7DDBF'
        if 'pulmonary' in n and 'vein' in n: return '#D8434B'
        if 'pulmonary' in n and ('artery' in n or 'trunk' in n): return '#4F78D8'
        if 'vein' in n or 'vena' in n or 'sinus' in n or 'atrium' in n and 'right' in n: return '#3F6FCB'
        if 'artery' in n or 'aort' in n or 'carotid' in n or 'subclavian' in n or 'iliac' in n or 'trunk' in n: return '#D8434B'
        if 'ventricle' in n or 'atrium' in n or 'papillary' in n or 'septum' in n: return '#BF4A4A'
        return '#C9565A'
    if bundle in ('cns', 'pns', 'sensory'):
        if bundle == 'sensory':
            if 'cornea' in n or 'lens' in n or 'vitreous' in n: return '#DCEBF2'
            if 'sclera' in n or 'eyeball' in n: return '#F5F2EA'
            if 'bone' in n or 'ossic' in n or 'malleus' in n or 'incus' in n or 'stapes' in n: return '#E9DDC3'
            return '#E8B8A8'
        if bundle == 'cns': return '#E7B7A8' if 'cerebell' not in n else '#D9A599'
        return '#F0D060'
    return {'respiratory': '#E3A1A6', 'digestive': '#D98C7C', 'urinary': '#C9645A', 'reproductive': '#D79BA0',
            'endocrine': '#E7B24B', 'lymphatic': '#7FCB8C'}.get(bundle, '#D0D0D0')

def special(bundle, name):
    n = name.lower()
    if bundle == 'respiratory' and ('trachea' in n or 'bronch' in n or 'larynx' in n or 'epiglottis' in n or 'cartilage' in n): return '#CFE2EE'
    if bundle == 'digestive':
        if 'liver' in n: return '#8B3A2F'
        if 'gallbladder' in n or 'bile' in n: return '#5E8C3A'
        if 'pancreas' in n: return '#E0B070'
        if 'tooth' in n or 'teeth' in n or 'molar' in n or 'incisor' in n or 'canine' in n or 'premolar' in n: return '#F6F1E3'
        if 'tongue' in n: return '#D4767A'
    if bundle == 'urinary' and ('ureter' in n or 'bladder' in n or 'urethra' in n): return '#E0A56B'
    return None

_mats = {}
def material(hexcol, name):
    key = hexcol
    if key not in _mats:
        m = bpy.data.materials.new('cymor-' + hexcol.lstrip('#'))
        m.use_nodes = True
        bsdf = m.node_tree.nodes.get('Principled BSDF')
        bsdf.inputs['Base Color'].default_value = hexlin(hexcol)
        bsdf.inputs['Roughness'].default_value = 0.62
        bsdf.inputs['Metallic'].default_value = 0.0
        _mats[key] = m
    return _mats[key]

C = lambda n: bpy.data.collections[n]
SK, JO, MU, CV, LY, NE, VI = '1: Skeletal system', '3: Joints', '4: Muscular system', '5: Cardiovascular system', '6: Lymphoid organs', '7: Nervous system & Sense organs', '8: Visceral systems'
def has(*names): return lambda ch: any(x in ch for x in names)
HEART = has('Heart.g', 'Arteries of heart.g', 'Cardiac veins.g')
BUNDLES = [
    dict(id='skeleton', title='Skeletal system', system='skeletal', coll=SK, test=lambda ch: True, budget=350000),
    dict(id='joints', title='Joints, ligaments and articular structures', system='skeletal', coll=JO, test=lambda ch: True, budget=100000),
    dict(id='muscles', title='Muscular system', system='muscular', coll=MU, test=lambda ch: 'Fasciae.g' not in ch, budget=330000),
    dict(id='fasciae', title='Fasciae (deep and superficial)', system='muscular', coll=MU, test=has('Fasciae.g'), budget=70000),
    dict(id='heart', title='Heart, valves and coronary vessels', system='cardiovascular', coll=CV, test=HEART, budget=140000),
    dict(id='vessels', title='Arteries and veins', system='cardiovascular', coll=CV, test=lambda ch: not HEART(ch), budget=160000),
    dict(id='respiratory', title='Respiratory system', system='respiratory', coll=VI, test=has('Respiratory system.g'), budget=130000),
    dict(id='digestive', title='Digestive system', system='digestive', coll=VI, test=has('Digestive system.g'), budget=120000),
    dict(id='urinary', title='Urinary system', system='urinary', coll=VI, test=has('Urinary system.g'), budget=60000),
    dict(id='reproductive', title='Genital system (male)', system='reproductive', coll=VI, test=has('Genital systems.g'), budget=60000),
    dict(id='endocrine', title='Endocrine glands', system='endocrine', coll=VI, test=has('Endocrine glands.g'), budget=40000),
    dict(id='lymphatic', title='Lymphoid organs and lymph nodes', system='lymphatic', coll=LY, test=lambda ch: True, budget=80000),
    dict(id='cns', title='Central nervous system', system='nervous', coll=NE, test=has('Central nervous system.g'), budget=250000),
    dict(id='pns', title='Peripheral nervous system', system='nervous', coll=NE, test=has('Peripheral nervous system.g'), budget=150000),
    dict(id='sensory', title='Sense organs (eye and ear)', system='sensory', coll=NE, test=has('Sense organs.g'), budget=120000),
]
# Z-Anatomy's License.txt lists third-party models embedded in the atlas under licences that are NOT compatible with
# redistributing this library under CC BY-SA 4.0 (non-commercial) or whose licence is not stated. They are quarantined.
QUARANTINE = [
    (r'^(kidney|renal pelvis)(\.|$)', 'Kidney model by Lissie Cowley is CC BY-NC 4.0 (non-commercial); not compatible with open redistribution'),
    (r'^(cochlea|vestibule)\.(l|r)$', 'Inner-ear model by University of Dundee is CC BY-NC-SA 4.0 (non-commercial, share-alike)'),
    (r'^white matter of (telencephalon|spinal cord)', 'White-matter model from University of Washington: licence not stated in the Z-Anatomy repository'),
]
ONLY = set(os.environ.get('ONLY', '').split(',')) - {''}
FLOOR = 150
report = []
skipped = []
tmp = bpy.data.collections.new('cymor-tmp'); bpy.context.scene.collection.children.link(tmp)

for B in BUNDLES:
    if ONLY and B['id'] not in ONLY: continue
    t0 = time.time()
    items = []
    for o in list(C(B['coll']).all_objects):
        if o.type not in ('MESH', 'CURVE'): continue
        if o.type == 'MESH' and not o.data.polygons: continue
        ch = chain(o)
        if not B['test'](ch): continue
        if o.name.endswith('.g'): continue  # 3D text labels of group names (e.g. 'Skeletal system.g'), not anatomy
        q = next((why for pat, why in QUARANTINE if re.match(pat, o.name, re.I)), None)
        if q:
            skipped.append(dict(bundle=B['id'], source_object=o.name, reason='licence: ' + q)); continue
        if not re.search(r'[A-Za-z]', o.name):
            skipped.append(dict(bundle=B['id'], source_object=o.name, reason='unreadable source name (cannot be identified, so not imported)')); continue
        if os.environ.get('TRACE'): print('EVAL', o.name, flush=True)
        ev = o.evaluated_get(dg)
        me = bpy.data.meshes.new_from_object(ev, depsgraph=dg)
        if not me.polygons:
            bpy.data.meshes.remove(me); continue
        me.transform(ev.matrix_world)
        tris = sum(len(p.vertices) - 2 for p in me.polygons)
        items.append((o, ch, me, tris, o.name))
    total = sum(i[3] for i in items)
    ratio = min(1.0, B['budget'] / max(1, total))
    ids, used, objs, rows, objmap = {}, set(), [], [], {}
    made = {}
    for o, ch, me, tris, oname in items:
        name, side = clean(oname)
        base = slug(name, side); i = base; k = 2
        while i in used: i = f'{base}-{k}'; k += 1
        used.add(i); ids[oname] = i
    # free the slug names if they collide with existing Blender objects (case: 'eye', 'iris' ...)
    for o, ch, me, tris, oname in items:
        clash = bpy.data.objects.get(ids[oname])
        if clash is not None and clash is not o: clash.name = clash.name + '.src'
        if o.name == ids[oname]: o.name = o.name + '.src'
    for o, ch, me, tris, oname in items:
        if oname != o.name: pass
    for o, ch, me, tris, oname in items:
        i = ids[oname]; name, side = clean(oname)
        matname = o.material_slots[0].material.name if o.material_slots and o.material_slots[0].material else ''
        hexcol = special(B['id'], name) or color_for(B['id'], name, matname)
        me.materials.clear(); me.materials.append(material(hexcol, matname))
        me.shade_smooth()
        me.name = i
        ob = bpy.data.objects.new(i, me); tmp.objects.link(ob)
        want = max(min(tris, FLOOR), int(tris * ratio))
        if want < tris:
            md = ob.modifiers.new('dec', 'DECIMATE'); md.decimate_type = 'COLLAPSE'; md.ratio = max(0.005, want / tris); md.use_collapse_triangulate = True
        objs.append(ob); made[i] = ob
        objmap[oname] = (i, name, side, ch, tris, matname, hexcol)
    bpy.context.view_layer.update()
    # parents + bounds from evaluated output
    dg2 = bpy.context.evaluated_depsgraph_get()
    out_tris_total = 0
    for o, ch, me, tris, oname in items:
        i, name, side, chn, tris0, matname, hexcol = objmap[oname]
        ob = made[i]; ev = ob.evaluated_get(dg2)
        em = ev.to_mesh()
        otris = sum(len(p.vertices) - 2 for p in em.polygons); out_tris_total += otris
        xs = [v.co.x for v in em.vertices]; ys = [v.co.y for v in em.vertices]; zs = [v.co.z for v in em.vertices]
        bb = [[min(xs), min(zs), -max(ys)], [max(xs), max(zs), -min(ys)]] if xs else None  # Blender Z-up -> glTF Y-up
        ev.to_mesh_clear()
        parent = None; path = []
        for a in chn:
            if a in ids and parent is None: parent = ids[a]
            if a.endswith('.g') or a in ids: path.append(clean(a)[0])
        rows.append(dict(id=i, name=name, side=side, parent=parent, group_path=list(reversed(path)), source_object=oname,
                         source_material=matname, color=hexcol, tris_source=tris0, tris_out=otris, bbox=bb))
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objs: ob.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    path = os.path.join(OUT, f"{B['id']}.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True,
        export_normals=True, export_texcoords=False, export_materials='EXPORT', export_cameras=False, export_lights=False,
        export_extras=False, export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
        export_draco_position_quantization=14, export_draco_normal_quantization=10)
    man = dict(bundle=B['id'], title=B['title'], system=B['system'], file=f"{B['id']}.glb", bytes=os.path.getsize(path),
               tris_source=total, tris_out=out_tris_total, decimation_ratio=round(ratio, 4), meshes=rows)
    json.dump(man, open(os.path.join(OUT, f"{B['id']}.json"), 'w'), separators=(',', ':'))
    report.append((B['id'], len(rows), total, out_tris_total, os.path.getsize(path), round(time.time() - t0, 1)))
    print('BUNDLE', report[-1], flush=True)
    for ob in objs: bpy.data.objects.remove(ob)
    for o, ch, me, tris, oname in items:
        if me.users == 0: bpy.data.meshes.remove(me)
json.dump(dict(report=report, skipped=skipped), open(os.path.join(OUT, '_report.json'), 'w'), indent=1)
