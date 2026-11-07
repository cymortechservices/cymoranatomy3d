import type { HistologyTopic } from '../types'

/**
 * Histology topics. IMPORTANT: every image here is an original SCHEMATIC illustration drawn in code
 * (see components/histology/HistologySchematics.tsx). They are NOT microscope images.
 * To add a real photomicrograph: set image.kind = 'photomicrograph', image.url to a file you have the right
 * to use, and fill in credit, licence, magnification and stain. See docs/MODEL_SOURCING.md.
 * Label coordinates use the 400 x 300 viewBox of the schematic.
 */
const schematic = (labels: { x: number; y: number; text: string }[]) => ({
  kind: 'schematic' as const,
  credit: 'Original schematic by CymorTechServices',
  licence: 'MIT (same as this project)',
  magnification: 'Not applicable (schematic, not to scale)',
  stain: 'Not applicable (schematic)',
  labels,
})

export const HISTOLOGY: HistologyTopic[] = [
  {
    id: 'epithelial', name: 'Epithelial tissue', classification: 'Basic tissue: epithelium (shown: simple columnar epithelium)',
    cellular_characteristics: ['Cells are closely packed with little extracellular matrix.', 'Cells show polarity: apical, lateral and basal surfaces.', 'Rest on a basement membrane; the tissue itself has no blood vessels (avascular).', 'Classified by number of layers (simple, stratified) and cell shape (squamous, cuboidal, columnar).'],
    structural_adaptations: ['Tight junctions and desmosomes join cells to form a barrier and resist mechanical stress.', 'Simple squamous epithelium is thin, which favours diffusion (alveoli, capillaries).', 'Microvilli on absorptive columnar cells increase surface area (small intestine).', 'Stratified squamous keratinised epithelium resists abrasion (epidermis).'],
    functions: ['Protection', 'Absorption', 'Secretion', 'Selective barrier and transport', 'Sensation'],
    locations: ['Lining of the gut (simple columnar)', 'Alveoli and capillaries (simple squamous)', 'Epidermis (keratinised stratified squamous)', 'Kidney tubules (simple cuboidal)'],
    identification_features: ['Sheets of closely packed cells', 'Cells sitting on a pink basement membrane', 'A free (apical) surface facing a lumen or the exterior'],
    related_organs: ['Small intestine', 'Lung', 'Skin', 'Kidney'], related_structure_ids: [],
    image: schematic([
      { x: 200, y: 82, text: 'Apical surface' }, { x: 98, y: 145, text: 'Nucleus (basal)' }, { x: 290, y: 172, text: 'Basement membrane' }, { x: 200, y: 230, text: 'Lamina propria (connective tissue)' },
    ]),
    practice: [
      { question: 'Which feature distinguishes epithelium from connective tissue?', answer: 'Epithelium is cellular with little matrix, sits on a basement membrane and is avascular.' },
      { question: 'Why does the alveolar wall use simple squamous epithelium?', answer: 'A single thin layer of flat cells gives a short diffusion distance for gas exchange.' },
    ],
  },
  {
    id: 'connective', name: 'Connective tissue', classification: 'Basic tissue: connective tissue (shown: loose connective tissue)',
    cellular_characteristics: ['Cells are scattered in an abundant extracellular matrix of fibres and ground substance.', 'Fibroblasts produce collagen and elastic fibres.', 'Other cells include macrophages, mast cells and plasma cells.', 'Fibres: collagen (strength), elastic (recoil), reticular (supporting mesh).'],
    structural_adaptations: ['Loose connective tissue has a loose fibre arrangement, flexible and rich in cells and vessels: suits support of epithelia.', 'Dense regular connective tissue has parallel collagen bundles, resisting tension in one direction (tendons).'],
    functions: ['Support and binding', 'Defence', 'Storage (adipose)', 'Transport (blood is a specialised connective tissue)'],
    locations: ['Beneath epithelia (lamina propria)', 'Around organs and vessels', 'Tendons and ligaments (dense regular)', 'Dermis (dense irregular)'],
    identification_features: ['Few cells scattered in a pink fibre-rich matrix', 'Wavy collagen fibres', 'Spindle-shaped fibroblast nuclei'],
    related_organs: ['Skin', 'Gut wall', 'Tendons'], related_structure_ids: [],
    image: schematic([
      { x: 110, y: 90, text: 'Collagen fibres' }, { x: 255, y: 140, text: 'Fibroblast' }, { x: 305, y: 220, text: 'Capillary' }, { x: 90, y: 230, text: 'Ground substance' },
    ]),
    practice: [
      { question: 'Which cell produces collagen in connective tissue?', answer: 'The fibroblast.' },
      { question: 'Why are tendons made of dense regular connective tissue?', answer: 'Parallel collagen bundles resist strong tension in one direction.' },
    ],
  },
  {
    id: 'muscle', name: 'Muscle tissue', classification: 'Basic tissue: muscle (shown: skeletal, cardiac and smooth muscle)',
    cellular_characteristics: ['Skeletal: long, multinucleated, striated fibres with peripheral nuclei.', 'Cardiac: branched, striated cells with one or two central nuclei and intercalated discs.', 'Smooth: spindle-shaped cells with a single central nucleus, no striations.'],
    structural_adaptations: ['Skeletal fibres are multinucleate and sarcomeres are in register, giving powerful voluntary contraction.', 'Intercalated discs (desmosomes and gap junctions) bind cardiac cells mechanically and electrically.', 'Smooth muscle cells can contract slowly and be sustained, suited to hollow organs.'],
    functions: ['Movement', 'Posture', 'Pumping blood (cardiac)', 'Moving substances through hollow organs (smooth)'],
    locations: ['Skeletal muscles attached to bone', 'Wall of the heart (cardiac)', 'Walls of the gut, vessels and uterus (smooth)'],
    identification_features: ['Striations in skeletal and cardiac muscle', 'Peripheral nuclei: skeletal', 'Intercalated discs: cardiac', 'Spindle cells without striations: smooth'],
    related_organs: ['Heart', 'Stomach', 'Biceps brachii'], related_structure_ids: ['cardiac-muscle'],
    image: schematic([
      { x: 70, y: 17, text: 'Skeletal: peripheral nuclei' }, { x: 210, y: 124, text: 'Cardiac: intercalated disc' }, { x: 100, y: 255, text: 'Smooth: spindle cell' },
    ]),
    practice: [
      { question: 'Which muscle type has intercalated discs?', answer: 'Cardiac muscle.' },
      { question: 'Where are the nuclei in skeletal muscle fibres?', answer: 'At the periphery, just under the sarcolemma.' },
    ],
  },
  {
    id: 'nervous', name: 'Nervous tissue', classification: 'Basic tissue: nervous tissue (shown: myelinated multipolar neuron)',
    cellular_characteristics: ['Neurons: soma, dendrites and a single axon.', 'Glial cells support neurons: astrocytes, oligodendrocytes, microglia, ependymal cells (CNS) and Schwann and satellite cells (PNS).', 'Myelin from oligodendrocytes (CNS) or Schwann cells (PNS) insulates axons; gaps are nodes of Ranvier.'],
    structural_adaptations: ['Dendrites increase receptive surface area.', 'Long axons carry impulses over distance.', 'Myelin and nodes of Ranvier allow fast saltatory conduction.'],
    functions: ['Receiving, integrating and transmitting signals', 'Coordination of body functions'],
    locations: ['Brain', 'Spinal cord', 'Peripheral nerves and ganglia'],
    identification_features: ['Large neuronal cell bodies with a prominent nucleolus', 'Neuropil (a network of processes)', 'Small, dark glial nuclei'],
    related_organs: ['Brain', 'Spinal cord', 'Peripheral nerves'], related_structure_ids: [],
    image: schematic([
      { x: 130, y: 170, text: 'Cell body (soma)' }, { x: 150, y: 150, text: 'Nucleus' }, { x: 70, y: 90, text: 'Dendrites' }, { x: 225, y: 140, text: 'Myelin sheath' }, { x: 312, y: 150, text: 'Node of Ranvier' }, { x: 186, y: 150, text: 'Axon' },
    ]),
    practice: [
      { question: 'Which cells myelinate axons in the peripheral nervous system?', answer: 'Schwann cells.' },
      { question: 'What are the gaps in the myelin sheath called?', answer: 'Nodes of Ranvier.' },
    ],
  },
  {
    id: 'blood', name: 'Blood', classification: 'Specialised connective tissue (shown: peripheral blood elements)',
    cellular_characteristics: ['Erythrocytes: anucleate biconcave discs in mature mammals.', 'Leukocytes: neutrophils (multilobed nucleus), lymphocytes (large round nucleus, thin rim of cytoplasm), monocytes, eosinophils, basophils.', 'Platelets: small cell fragments from megakaryocytes.', 'The liquid matrix is plasma.'],
    structural_adaptations: ['The biconcave shape of red cells increases surface area for gas exchange and allows flexibility in capillaries.', 'Lack of a nucleus provides more room for haemoglobin.'],
    functions: ['Gas transport', 'Defence', 'Haemostasis', 'Transport of nutrients, hormones and wastes'],
    locations: ['Circulates in the heart and blood vessels', 'Formed in red bone marrow'],
    identification_features: ['Pink anucleate discs with a central pale area (red cells)', 'Nucleated white cells with distinct nuclear shapes', 'Tiny purple granular fragments (platelets)'],
    related_organs: ['Heart', 'Bone marrow', 'Spleen'], related_structure_ids: ['left-ventricle'],
    image: schematic([
      { x: 110, y: 95, text: 'Erythrocyte' }, { x: 255, y: 90, text: 'Neutrophil' }, { x: 100, y: 220, text: 'Lymphocyte' }, { x: 300, y: 215, text: 'Platelets' },
    ]),
    practice: [
      { question: 'Why are mature red blood cells biconcave?', answer: 'The shape increases surface area for gas exchange and allows the cell to deform in capillaries.' },
      { question: 'Which cell has a multilobed nucleus?', answer: 'The neutrophil.' },
    ],
  },
  {
    id: 'cartilage', name: 'Cartilage', classification: 'Specialised connective tissue (shown: hyaline cartilage)',
    cellular_characteristics: ['Chondrocytes lie in lacunae within a firm matrix of type II collagen and proteoglycans.', 'Chondroblasts produce matrix at the periphery.', 'Cells may appear in isogenous groups after division.', 'Avascular: nutrients diffuse through the matrix from the perichondrium.'],
    structural_adaptations: ['The proteoglycan matrix binds water, making cartilage firm yet resilient to compression.', 'Being avascular and surrounded by perichondrium, it grows by appositional and interstitial growth.'],
    functions: ['Support', 'Smooth articular surfaces', 'Models for endochondral bone growth'],
    locations: ['Articular surfaces', 'Costal cartilages', 'Trachea and larynx', 'Growth plates'],
    identification_features: ['Glassy, homogeneous matrix', 'Chondrocytes in lacunae, often in pairs or groups', 'Perichondrium (except articular cartilage)'],
    related_organs: ['Trachea', 'Ribs', 'Joints'], related_structure_ids: ['rib-cage'],
    image: schematic([
      { x: 200, y: 40, text: 'Perichondrium' }, { x: 110, y: 150, text: 'Chondrocyte in lacuna' }, { x: 270, y: 195, text: 'Isogenous group' }, { x: 320, y: 120, text: 'Matrix' },
    ]),
    practice: [
      { question: 'Why does cartilage heal slowly?', answer: 'It is avascular, so nutrients reach cells only by diffusion.' },
    ],
  },
  {
    id: 'bone', name: 'Bone tissue', classification: 'Specialised connective tissue (shown: compact bone osteon)',
    cellular_characteristics: ['Osteoblasts form matrix; osteocytes maintain it from lacunae; osteoclasts resorb bone.', 'Matrix: type I collagen with hydroxyapatite mineral.', 'Osteons (Haversian systems) are the structural unit of compact bone.'],
    structural_adaptations: ['Concentric lamellae with differing collagen orientation resist torsion.', 'Canaliculi connect lacunae and the central canal so osteocytes obtain nutrients despite the calcified matrix.', 'Remodelling lets bone adapt to mechanical load.'],
    functions: ['Support', 'Protection', 'Mineral storage', 'Haematopoiesis (marrow)'],
    locations: ['Shafts of long bones (compact bone)', 'Epiphyses (spongy bone)'],
    identification_features: ['Concentric rings around a central canal', 'Small dark osteocyte lacunae between rings', 'Interstitial lamellae between osteons'],
    related_organs: ['Femur', 'Humerus', 'Skull'], related_structure_ids: ['femur', 'humerus'],
    image: schematic([
      { x: 200, y: 150, text: 'Central (Haversian) canal' }, { x: 244, y: 106, text: 'Concentric lamellae' }, { x: 156, y: 106, text: 'Osteocyte in lacuna' }, { x: 340, y: 255, text: 'Interstitial lamellae' },
    ]),
    practice: [
      { question: 'What occupies the central canal of an osteon?', answer: 'Blood vessels and nerves.' },
      { question: 'What is the function of canaliculi?', answer: 'They connect lacunae so osteocytes can exchange nutrients and wastes.' },
    ],
  },
]

export const getHistology = (id: string) => HISTOLOGY.find((h) => h.id === id)
