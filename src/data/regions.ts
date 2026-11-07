import type { Region } from '../types'

export const REGIONS: Region[] = [
  { id: 'head', name: 'Head', description: 'The cranium and facial skeleton, housing the brain and special sense organs.' },
  { id: 'neck', name: 'Neck', description: 'The cervical region linking the head to the trunk.' },
  { id: 'thorax', name: 'Thorax', description: 'The chest: thoracic cage, heart, lungs, great vessels and oesophagus.' },
  { id: 'back', name: 'Back (vertebral column)', description: 'The vertebral column and associated muscles, enclosing the spinal cord.' },
  { id: 'abdomen', name: 'Abdomen', description: 'The region between the thorax and pelvis containing most digestive organs.' },
  { id: 'pelvis', name: 'Pelvis', description: 'The bony pelvis and the pelvic viscera.' },
  { id: 'upper-limb', name: 'Upper limb', description: 'Shoulder, arm, forearm and hand.' },
  { id: 'lower-limb', name: 'Lower limb', description: 'Hip, thigh, leg, ankle and foot.' },
]

export const getRegion = (id: string) => REGIONS.find((r) => r.id === id)
