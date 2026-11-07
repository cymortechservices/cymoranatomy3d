import type { Organ } from '../types'

/** "Organ" here means organ-level unit: an organ or a named group of bones. */
export const ORGANS: Organ[] = [
  { id: 'heart', name: 'Heart', system_id: 'cardiovascular', region_id: 'thorax', description: 'A four-chambered muscular pump lying in the middle mediastinum, enclosed in the pericardium.', structure_ids: ['right-atrium', 'right-ventricle', 'left-atrium', 'left-ventricle', 'tricuspid-valve', 'mitral-valve', 'aortic-valve', 'pulmonary-valve', 'sinoatrial-node', 'coronary-arteries', 'cardiac-muscle'] },
  { id: 'great-vessels', name: 'Great vessels', system_id: 'cardiovascular', region_id: 'thorax', description: 'The large arteries and veins that connect directly to the heart.', structure_ids: ['aorta', 'pulmonary-trunk', 'superior-vena-cava', 'inferior-vena-cava', 'pulmonary-veins'] },
  { id: 'skull-unit', name: 'Skull', system_id: 'skeletal', region_id: 'head', description: 'The cranium (protecting the brain) and the facial skeleton, including the mandible.', structure_ids: ['skull'] },
  { id: 'vertebral-column-unit', name: 'Vertebral column', system_id: 'skeletal', region_id: 'back', description: 'A flexible column of vertebrae that supports the trunk and encloses the spinal cord.', structure_ids: ['vertebral-column'] },
  { id: 'thoracic-cage-unit', name: 'Thoracic cage', system_id: 'skeletal', region_id: 'thorax', description: 'The ribs, costal cartilages, thoracic vertebrae and sternum.', structure_ids: ['rib-cage', 'sternum'] },
  { id: 'pectoral-girdle-unit', name: 'Pectoral girdle and upper limb', system_id: 'skeletal', region_id: 'upper-limb', description: 'The clavicle and scapula, which connect the upper limb to the axial skeleton, and the bones of the arm and forearm.', structure_ids: ['clavicle', 'scapula', 'humerus', 'radius', 'ulna'] },
  { id: 'pelvic-girdle-unit', name: 'Pelvic girdle and lower limb', system_id: 'skeletal', region_id: 'lower-limb', description: 'The hip bones, which connect the lower limb to the axial skeleton, and the bones of the thigh and leg.', structure_ids: ['pelvis', 'femur', 'patella', 'tibia', 'fibula'] },
]

export const getOrgan = (id: string) => ORGANS.find((o) => o.id === id)
