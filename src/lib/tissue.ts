/**
 * Maps a structure to the histology topic that describes its main tissue. Only structures where the mapping is
 * straightforward are listed; vessels and valves are deliberately omitted (their walls are composites).
 */
const MAP: Record<string, string> = {
  'cardiac-muscle': 'muscle',
  'left-ventricle': 'muscle',
  'right-ventricle': 'muscle',
  'left-atrium': 'muscle',
  'right-atrium': 'muscle',
  femur: 'bone', humerus: 'bone', radius: 'bone', ulna: 'bone', tibia: 'bone', fibula: 'bone', clavicle: 'bone',
  'rib-cage': 'bone', sternum: 'bone', skull: 'bone', pelvis: 'bone', scapula: 'bone', 'vertebral-column': 'bone',
}

export const histologyTopicFor = (structureId: string): string | undefined => MAP[structureId]
