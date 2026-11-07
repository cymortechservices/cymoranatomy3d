import type { PhysiologyAnimation } from '../types'

export const ANIMATIONS: PhysiologyAnimation[] = [
  {
    id: 'cardiac-cycle', title: 'The cardiac cycle (3D)', system_id: 'cardiovascular', kind: 'cardiac', duration_s: 8,
    summary: 'A 3D teaching schematic of one heartbeat: atrial systole, isovolumetric contraction, ejection, isovolumetric relaxation and filling.',
    steps: [
      { at: 0, title: 'Atrial systole', description: 'The atria contract and top up ventricular filling. AV valves are open; the aortic and pulmonary valves are closed.' },
      { at: 0.12, title: 'Isovolumetric contraction', description: 'The ventricles begin to contract. The AV valves close (first heart sound) but pressure has not yet exceeded that in the aorta and pulmonary trunk, so all four valves are closed.' },
      { at: 0.17, title: 'Ventricular ejection', description: 'Ventricular pressure exceeds arterial pressure. The aortic and pulmonary valves open and blood is ejected into the aorta and pulmonary trunk.' },
      { at: 0.5, title: 'Isovolumetric relaxation', description: 'The ventricles relax and the semilunar valves close (second heart sound). All valves are closed while pressure falls.' },
      { at: 0.57, title: 'Ventricular filling', description: 'Ventricular pressure falls below atrial pressure. The AV valves open and blood flows from the atria into the ventricles.' },
    ],
    structure_ids: ['left-ventricle', 'right-ventricle', 'left-atrium', 'right-atrium', 'mitral-valve', 'tricuspid-valve', 'aortic-valve', 'pulmonary-valve'],
    simplifications: ['Timings are proportional and the loop is slowed for teaching (at 1x one cycle takes 8 s).', 'Chambers change size in the model; real chambers change volume with a more complex wall motion.', 'Valve open/closed state is indicated by colour (green = open, red = closed), not by animated cusps.'],
  },
  {
    id: 'circulation', title: 'Pulmonary and systemic circulation', system_id: 'cardiovascular', kind: 'circulation', duration_s: 12,
    summary: 'Simplified flow diagram showing blood moving around the two circuits in series.',
    steps: [
      { at: 0, title: 'Systemic arteries', description: 'The left ventricle ejects oxygenated blood into the aorta, which distributes it through arteries to the body.' },
      { at: 0.207, title: 'Systemic capillaries', description: 'Oxygen and nutrients leave the blood and carbon dioxide enters it at the tissue capillaries.' },
      { at: 0.268, title: 'Systemic veins', description: 'Deoxygenated blood returns through veins to the superior and inferior venae cavae and the right atrium.' },
      { at: 0.51, title: 'Pulmonary arteries', description: 'The right ventricle pumps blood through the pulmonary trunk and arteries to the lungs.' },
      { at: 0.701, title: 'Pulmonary capillaries', description: 'Gas exchange: carbon dioxide leaves the blood and oxygen enters it across the alveolar wall.' },
      { at: 0.763, title: 'Pulmonary veins', description: 'Oxygenated blood returns via the pulmonary veins to the left atrium.' },
    ],
    structure_ids: ['aorta', 'pulmonary-trunk', 'superior-vena-cava', 'inferior-vena-cava', 'pulmonary-veins'],
    simplifications: ['Vessel sizes, speeds and capillary beds are not to scale.', 'The two circuits are drawn side by side; in reality both sides of the heart beat simultaneously.', 'Dots show direction of flow only; they do not represent real velocity.'],
  },
  {
    id: 'breathing', title: 'Breathing: diaphragm and thorax', system_id: 'respiratory', kind: 'breathing', duration_s: 6,
    summary: 'Side-view schematic of quiet breathing: diaphragm and ribs change thoracic volume.',
    steps: [
      { at: 0, title: 'Inspiration', description: 'The diaphragm contracts and flattens; external intercostal muscles lift the ribs. Thoracic volume rises, intrapleural and alveolar pressure fall, and air flows in.' },
      { at: 0.4, title: 'Expiration', description: 'In quiet breathing expiration is passive. The diaphragm relaxes and returns to its dome shape; the ribs descend; the lungs recoil and air flows out.' },
    ],
    structure_ids: ['rib-cage', 'sternum'],
    simplifications: ['Lung and diaphragm shapes are heavily simplified.', 'Only the antero-posterior change is drawn; the transverse expansion of the lower ribs is not shown.', 'Forced breathing, which recruits accessory muscles, is not shown.'],
  },
  {
    id: 'elbow', title: 'Elbow flexion and extension', system_id: 'muscular', kind: 'joint', duration_s: 8,
    summary: 'The elbow as a hinge joint: biceps brachii shortens to flex, triceps brachii shortens to extend.',
    steps: [
      { at: 0, title: 'Flexion', description: 'Biceps brachii (agonist) contracts and shortens; triceps brachii (antagonist) relaxes. The forearm moves towards the arm around the hinge axis of the elbow.' },
      { at: 0.5, title: 'Extension', description: 'Triceps brachii contracts and shortens; biceps relaxes and lengthens. The forearm returns to the extended position.' },
    ],
    structure_ids: ['humerus', 'radius', 'ulna'],
    simplifications: ['Only a single hinge axis is drawn; pronation and supination at the radio-ulnar joints are not shown.', 'Muscle bulk is shown as a simple bulge; sarcomere-level contraction is not animated.'],
  },
  {
    id: 'peristalsis', title: 'Peristalsis', system_id: 'digestive', kind: 'peristalsis', duration_s: 8,
    summary: 'A wave of coordinated contraction behind a bolus and relaxation ahead of it moves contents along the gut.',
    steps: [
      { at: 0, title: 'Bolus enters', description: 'Stretch of the wall by the bolus triggers a reflex in the enteric nervous system.' },
      { at: 0.3, title: 'Contraction behind, relaxation ahead', description: 'Circular muscle contracts behind the bolus while longitudinal muscle ahead contracts and circular muscle relaxes, widening the lumen.' },
      { at: 0.7, title: 'Bolus propelled', description: 'The wave of contraction pushes the bolus forward along the tube.' },
    ],
    structure_ids: [],
    simplifications: ['Shows a generic tube, not a specific part of the gut.', 'Real peristalsis involves a coordinated interplay of nerves, hormones and pacemaker cells, which is not shown.'],
  },
]

export const getAnimation = (id: string) => ANIMATIONS.find((a) => a.id === id)
