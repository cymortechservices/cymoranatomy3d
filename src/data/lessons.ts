import type { Lesson, Reference } from '../types'

const G: Reference = { title: "Gray's Anatomy for Students", source: 'Drake, Vogl & Mitchell (Elsevier)', note: 'Further reading; notes here are an original summary.' }
const M: Reference = { title: 'Clinically Oriented Anatomy', source: 'Moore, Dalley & Agur (Wolters Kluwer)' }
const GH: Reference = { title: 'Guyton and Hall Textbook of Medical Physiology', source: 'Hall & Hall (Elsevier)' }
const L: Reference = { title: "Langman's Medical Embryology", source: 'Sadler (Wolters Kluwer)' }
const P: Reference = { title: 'Histology: A Text and Atlas', source: 'Pawlina (Wolters Kluwer)' }

export const LESSONS: Lesson[] = [
  {
    id: 'heart-overview', title: 'The heart: chambers, surfaces and circulation', subject: 'anatomy', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'heart', difficulty: 'beginner',
    summary: 'The four chambers of the heart, how blood passes through them and how the heart sits in the thorax.',
    learning_objectives: ['Name the four chambers and what each receives and pumps.', 'Describe the position and surfaces of the heart.', 'Trace blood through the pulmonary and systemic circulations.'],
    sections: [
      { heading: 'Position and coverings', kind: 'text', body: ['The heart lies in the middle mediastinum, with about two thirds of its mass to the left of the midline. It is enclosed in the pericardium: a tough outer fibrous layer and an inner serous sac with parietal and visceral (epicardial) layers separated by a thin film of pericardial fluid.', 'The heart wall has three layers: epicardium (outer), myocardium (middle muscle) and endocardium (inner lining).'] },
      { heading: 'Characteristics of the chambers', kind: 'characteristics', body: ['Right atrium: receives the superior and inferior vena cavae and coronary sinus; has a rough anterior wall (pectinate muscles) and a smooth posterior part.', 'Right ventricle: forms most of the anterior surface; internal trabeculae carneae and papillary muscles; outflow part leads to the pulmonary trunk.', 'Left atrium: forms most of the base (posterior surface); receives the pulmonary veins.', 'Left ventricle: forms the apex and left border; thick, smooth-walled outflow part leads to the aorta.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Atria have thin walls because they move blood only a short distance into the ventricles at low pressure.', 'The right ventricle has a thinner wall than the left because pulmonary vascular resistance is much lower than systemic resistance.', 'The left ventricle has a thick, circular myocardium to generate the high pressure needed for the systemic circulation.'] },
      { heading: 'Functions', kind: 'functions', body: ['The right heart pumps deoxygenated blood to the lungs (pulmonary circulation).', 'The left heart pumps oxygenated blood to the body (systemic circulation).', 'The two sides pump in series, so over time they must pump the same volume.'] },
      { heading: 'Path of blood', kind: 'text', body: ['Body → superior/inferior vena cava → right atrium → tricuspid valve → right ventricle → pulmonary valve → pulmonary trunk → lungs → pulmonary veins → left atrium → mitral valve → left ventricle → aortic valve → aorta → body.'] },
    ],
    related_structure_ids: ['right-atrium', 'right-ventricle', 'left-atrium', 'left-ventricle', 'aorta', 'pulmonary-trunk'],
    exercises: [
      { question: 'Which chamber forms the apex of the heart?', answer: 'The left ventricle.' },
      { question: 'Which vessels enter the left atrium?', answer: 'The pulmonary veins (normally four).' },
      { question: 'Name the three layers of the heart wall.', answer: 'Endocardium, myocardium and epicardium.' },
    ],
    bundle_id: 'heart', references: [G, M],
  },
  {
    id: 'heart-valves', title: 'Heart valves and the conducting system', subject: 'anatomy', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'heart', difficulty: 'intermediate',
    summary: 'Atrioventricular and semilunar valves, how they close, and how the heartbeat is initiated and conducted.',
    learning_objectives: ['Distinguish atrioventricular from semilunar valves.', 'Explain the role of chordae tendineae and papillary muscles.', 'Trace the conduction pathway from the SA node.'],
    sections: [
      { heading: 'Atrioventricular valves', kind: 'characteristics', body: ['The tricuspid valve (right) has three cusps; the mitral (bicuspid) valve (left) has two. Their cusps are tethered by chordae tendineae to papillary muscles.'] },
      { heading: 'Semilunar valves', kind: 'characteristics', body: ['The pulmonary and aortic valves each have three pocket-like cusps and no chordae. Behind the aortic valve cusps are the aortic sinuses, from two of which the coronary arteries arise.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Papillary muscles contract with the ventricle and pull on the chordae, preventing cusps from prolapsing into the atrium under high ventricular pressure.', 'Semilunar cusps are shaped like pockets: back-pressure fills them and presses their edges together.'] },
      { heading: 'Conduction pathway', kind: 'functions', body: ['Sinoatrial (SA) node → atrial myocardium → atrioventricular (AV) node (conduction is delayed here, allowing the ventricles to fill) → bundle of His → right and left bundle branches → Purkinje fibres → ventricular myocardium.', 'The fibrous skeleton of the heart electrically insulates atria from ventricles, so the AV node and bundle are normally the only pathway between them.'] },
      { heading: 'Heart sounds', kind: 'text', body: ['The first heart sound ("lub") is produced mainly by closure of the AV valves at the start of ventricular systole; the second ("dub") by closure of the semilunar valves at the start of diastole.'] },
    ],
    related_structure_ids: ['tricuspid-valve', 'mitral-valve', 'aortic-valve', 'pulmonary-valve', 'sinoatrial-node'],
    exercises: [
      { question: 'Why do the semilunar valves not need chordae tendineae?', answer: 'Their pocket-shaped cusps are closed by back-pressure of blood and are not pushed back by a contracting chamber wall.' },
      { question: 'Why is conduction delayed at the AV node?', answer: 'It lets atrial contraction finish filling the ventricles before ventricular contraction begins.' },
    ],
    bundle_id: 'heart', references: [G, GH],
  },
  {
    id: 'great-vessels-circulation', title: 'Great vessels and the two circulations', subject: 'physiology', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'great-vessels', difficulty: 'beginner',
    summary: 'The vessels attached to the heart and the pulmonary and systemic circuits.',
    learning_objectives: ['Name the great vessels and their connections.', 'Compare the pulmonary and systemic circulations.', 'Explain why pulmonary veins carry oxygenated blood.'],
    sections: [
      { heading: 'Characteristics', kind: 'characteristics', body: ['Arteries carry blood away from the heart; veins carry blood towards it. Colour and oxygen content depend on the circuit, not on the vessel type.', 'Pulmonary trunk → right and left pulmonary arteries (deoxygenated). Pulmonary veins → left atrium (oxygenated). Aorta (oxygenated). Venae cavae (deoxygenated).'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['The aorta and other elastic arteries have abundant elastin: they expand in systole and recoil in diastole, which keeps blood moving during ventricular relaxation.', 'Veins have thinner walls and larger lumens, and many medium-sized veins have valves.'] },
      { heading: 'Functions', kind: 'functions', body: ['Pulmonary circulation: gas exchange at the alveolar capillaries.', 'Systemic circulation: delivery of oxygen and nutrients to tissues and return of carbon dioxide and wastes.'] },
    ],
    related_structure_ids: ['aorta', 'pulmonary-trunk', 'superior-vena-cava', 'inferior-vena-cava', 'pulmonary-veins'],
    exercises: [
      { question: 'Why are pulmonary veins an exception to the idea that veins carry deoxygenated blood?', answer: 'Veins are defined by direction of flow (towards the heart). Pulmonary veins return blood from the lungs, which has just been oxygenated.' },
    ],
    bundle_id: 'heart', references: [G, GH],
  },
  {
    id: 'cardiac-cycle', title: 'The cardiac cycle', subject: 'physiology', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'heart', difficulty: 'intermediate',
    summary: 'Phases of systole and diastole, valve behaviour and blood flow through the heart.',
    learning_objectives: ['Describe the phases of the cardiac cycle.', 'State when each valve opens and closes.', 'Define stroke volume, heart rate and cardiac output.'],
    sections: [
      { heading: 'Phases', kind: 'text', body: ['Ventricular filling: AV valves open; blood flows passively from atria into ventricles; atrial systole at the end tops up the filling.', 'Isovolumetric contraction: ventricles begin to contract; AV valves close; all valves are closed and volume stays constant while pressure rises.', 'Ejection: ventricular pressure exceeds aortic and pulmonary pressure; semilunar valves open and blood is ejected.', 'Isovolumetric relaxation: ventricles relax; semilunar valves close; all valves are closed while pressure falls until AV valves open again.'] },
      { heading: 'Functions and key relationships', kind: 'functions', body: ['Cardiac output = stroke volume × heart rate.', 'In a typical resting adult the cycle lasts roughly 0.8 s at 75 beats per minute, with ventricular systole lasting around a third to a half of the cycle (textbook values vary with heart rate).'] },
      { heading: 'Simplification used in this app', kind: 'text', body: ['The 3D animation is a teaching schematic. It slows the cycle and exaggerates chamber movement to make the phases visible; real chambers change volume rather than simply shrinking in size.'] },
    ],
    related_structure_ids: ['left-ventricle', 'right-ventricle', 'mitral-valve', 'aortic-valve'],
    exercises: [
      { question: 'During which phase are all four heart valves closed?', answer: 'Isovolumetric contraction and isovolumetric relaxation.' },
      { question: 'What is cardiac output if stroke volume is 70 mL and heart rate is 70 beats per minute?', answer: '70 × 70 = 4900 mL per minute (about 4.9 L/min).' },
    ],
    bundle_id: 'heart', references: [GH],
  },
  {
    id: 'bone-classification', title: 'Bone classification and the structure of a long bone', subject: 'anatomy', system_id: 'skeletal', difficulty: 'beginner',
    summary: 'Shapes of bones and the parts of a typical long bone.',
    learning_objectives: ['Classify bones by shape with an example of each.', 'Name the parts of a long bone.', 'Relate bone structure to function.'],
    sections: [
      { heading: 'Classification by shape', kind: 'characteristics', body: ['Long bones (humerus, femur): length greater than width. Short bones (carpals, tarsals). Flat bones (skull vault, sternum, scapula). Irregular bones (vertebrae). Sesamoid bones (patella), which develop within tendons.'] },
      { heading: 'Parts of a long bone', kind: 'characteristics', body: ['Diaphysis (shaft) with a medullary cavity; epiphyses (ends); metaphyses between them, adjacent to the growth plate (epiphyseal cartilage) in a growing bone.', 'The outer surface is covered by periosteum (except at articular surfaces, which are covered by hyaline cartilage); the medullary cavity is lined by endosteum.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Compact bone forms a thick cortex around the shaft and resists bending and torsion.', 'Spongy (cancellous) bone at the ends has trabeculae aligned with lines of stress, giving strength with less weight and housing red marrow.'] },
      { heading: 'Functions', kind: 'functions', body: ['Support, protection, leverage, mineral storage (calcium, phosphate) and haematopoiesis.'] },
    ],
    related_structure_ids: ['humerus', 'femur', 'patella', 'rib-cage'],
    exercises: [
      { question: 'What is a sesamoid bone?', answer: 'A bone that develops within a tendon; the patella is the largest example.' },
      { question: 'Which part of a long bone is the shaft?', answer: 'The diaphysis.' },
    ],
    bundle_id: 'skeleton', references: [G, M],
  },
  {
    id: 'axial-skeleton', title: 'The axial skeleton', subject: 'anatomy', system_id: 'skeletal', region_id: 'back', difficulty: 'beginner',
    summary: 'The skull, vertebral column and thoracic cage.',
    learning_objectives: ['List the regions of the vertebral column and their vertebra counts.', 'Name the types of ribs.', 'Describe the parts of the sternum.'],
    sections: [
      { heading: 'Vertebral column', kind: 'characteristics', body: ['7 cervical, 12 thoracic, 5 lumbar, 5 sacral (fused) and usually 4 coccygeal vertebrae. Primary curvatures (thoracic and sacral kyphoses) are present in the fetus; secondary curvatures (cervical and lumbar lordoses) develop after birth.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Vertebral bodies increase in size from cervical to lumbar regions as the load they carry increases.', 'Thoracic vertebrae have costal facets for ribs; lumbar vertebrae have large bodies and allow flexion and extension.'] },
      { heading: 'Thoracic cage', kind: 'characteristics', body: ['12 pairs of ribs: 7 true, 3 false, 2 floating. The sternum has a manubrium, body and xiphoid process; the sternal angle marks the level of the 2nd costal cartilage.'] },
      { heading: 'Functions', kind: 'functions', body: ['The axial skeleton supports the head and trunk, protects the brain, spinal cord and thoracic viscera, and provides attachment for muscles of respiration and posture.'] },
    ],
    related_structure_ids: ['skull', 'vertebral-column', 'rib-cage', 'sternum'],
    exercises: [
      { question: 'How many cervical vertebrae are there?', answer: 'Seven.' },
      { question: 'Which ribs are floating ribs?', answer: 'Ribs 11 and 12 (they do not attach to the sternum or to a costal cartilage of another rib).' },
    ],
    bundle_id: 'skeleton', references: [G, M],
  },
  {
    id: 'upper-limb-bones', title: 'Bones of the upper limb', subject: 'anatomy', system_id: 'skeletal', region_id: 'upper-limb', difficulty: 'intermediate',
    summary: 'Pectoral girdle, arm and forearm bones and their joints.',
    learning_objectives: ['Name the bones of the pectoral girdle and upper limb.', 'Identify the articulations at the shoulder and elbow.', 'Describe the clinically important features of the clavicle, humerus and distal radius.'],
    sections: [
      { heading: 'Characteristics', kind: 'characteristics', body: ['Pectoral girdle: clavicle and scapula. Arm: humerus. Forearm: radius (lateral) and ulna (medial). The sternoclavicular joint is the only bony articulation between the upper limb and the axial skeleton.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['The shoulder (glenohumeral) joint has a shallow socket and a large humeral head, giving great mobility but less stability, hence frequent dislocation.', 'The elbow\'s trochlear notch grips the trochlea, giving stable flexion and extension; the radius rotates around the ulna for pronation and supination.'] },
      { heading: 'Clinical relevance', kind: 'text', body: ['Clavicle fractures are common after falls onto the shoulder. Surgical neck of humerus fractures may damage the axillary nerve. Colles fracture is a distal radial fracture, usually after a fall onto an outstretched hand.'] },
    ],
    related_structure_ids: ['clavicle', 'scapula', 'humerus', 'radius', 'ulna'],
    exercises: [
      { question: 'Which forearm bone is lateral in the anatomical position?', answer: 'The radius.' },
      { question: 'Which nerve is at risk in a fracture of the surgical neck of the humerus?', answer: 'The axillary nerve.' },
    ],
    bundle_id: 'skeleton', references: [G, M],
  },
  {
    id: 'lower-limb-bones', title: 'Bones of the pelvis and lower limb', subject: 'anatomy', system_id: 'skeletal', region_id: 'lower-limb', difficulty: 'intermediate',
    summary: 'Hip bone, femur, patella, tibia and fibula.',
    learning_objectives: ['Name the three parts of the hip bone.', 'Name the main parts of the femur.', 'State the weight-bearing bone of the leg.'],
    sections: [
      { heading: 'Characteristics', kind: 'characteristics', body: ['Hip bone: ilium, ischium and pubis, joined in the acetabulum. Femur: head, neck, greater and lesser trochanters, shaft, condyles. Leg: tibia (medial, weight-bearing) and fibula (lateral).'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['The acetabulum is deep and the hip joint strongly stabilised by ligaments, which suits weight-bearing and locomotion.', 'The patella increases the mechanical advantage of quadriceps femoris.'] },
      { heading: 'Clinical relevance', kind: 'text', body: ['Femoral neck fractures can disrupt blood supply to the femoral head, causing avascular necrosis. The common fibular nerve is vulnerable around the neck of the fibula.'] },
    ],
    related_structure_ids: ['pelvis', 'femur', 'patella', 'tibia', 'fibula'],
    exercises: [
      { question: 'Which bone of the leg bears most of the body weight?', answer: 'The tibia.' },
    ],
    bundle_id: 'skeleton', references: [G, M],
  },
  {
    id: 'bone-histology', title: 'Bone tissue and cardiac muscle: histology essentials', subject: 'histology', system_id: 'skeletal', difficulty: 'intermediate',
    summary: 'Compact bone (osteons) and cardiac muscle: what you see and why.',
    learning_objectives: ['Identify an osteon and name its parts.', 'Describe the features of cardiac muscle in longitudinal section.'],
    sections: [
      { heading: 'Compact bone', kind: 'characteristics', body: ['The osteon (Haversian system) is a cylinder of concentric lamellae around a central (Haversian) canal containing vessels and nerves. Osteocytes sit in lacunae and communicate through canaliculi. Perforating (Volkmann) canals connect adjacent Haversian canals.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Concentric lamellae with collagen running in alternating directions make bone resistant to torsion. Canaliculi allow nutrient exchange across the calcified matrix.'] },
      { heading: 'Cardiac muscle', kind: 'characteristics', body: ['Branching, striated cells with one or two central nuclei, joined end to end at intercalated discs.'] },
      { heading: 'Functions', kind: 'functions', body: ['Bone supports and stores minerals; cardiac muscle contracts rhythmically and continuously to pump blood.'] },
    ],
    related_structure_ids: ['cardiac-muscle', 'femur'], exercises: [
      { question: 'What lies in the centre of an osteon?', answer: 'The central (Haversian) canal containing blood vessels and nerves.' },
      { question: 'What junctions in intercalated discs allow electrical coupling?', answer: 'Gap junctions.' },
    ], references: [P],
  },
  {
    id: 'embryo-early', title: 'Fertilisation to the three germ layers', subject: 'embryology', system_id: 'reproductive', difficulty: 'beginner',
    summary: 'Fertilisation, cleavage, implantation and gastrulation.',
    learning_objectives: ['Describe where fertilisation usually occurs.', 'Name the three germ layers and one derivative of each.', 'Define gastrulation.'],
    sections: [
      { heading: 'Key events', kind: 'text', body: ['Fertilisation usually occurs in the ampulla of the uterine tube, producing a zygote. Cleavage divides the zygote into blastomeres; a morula forms and then a blastocyst, which implants in the endometrium at the end of the first week.', 'During the third week, gastrulation converts the bilaminar embryonic disc (epiblast and hypoblast) into a trilaminar disc with ectoderm, mesoderm and endoderm.'] },
      { heading: 'Germ layer derivatives (examples)', kind: 'characteristics', body: ['Ectoderm: epidermis, nervous system (via neurulation). Mesoderm: muscle, bone, cardiovascular system, kidneys. Endoderm: epithelial lining of the gut and respiratory tract; liver and pancreas parenchyma.'] },
    ],
    related_structure_ids: [], exercises: [
      { question: 'What is gastrulation?', answer: 'The process that forms the three germ layers (ectoderm, mesoderm and endoderm) from the epiblast in week 3.' },
    ], references: [L],
  },
  {
    id: 'embryo-heart', title: 'Development of the heart', subject: 'embryology', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'heart', difficulty: 'advanced',
    summary: 'From the cardiac tube to a four-chambered heart.',
    learning_objectives: ['Describe the origin of the primitive heart tube.', 'Explain heart tube looping.', 'Name the septa that divide the heart.'],
    sections: [
      { heading: 'Key events', kind: 'text', body: ['The heart develops from splanchnic mesoderm (the cardiogenic area). Paired endocardial tubes fuse into a single heart tube, which begins to beat around the fourth week.', 'The tube loops (bulbus cordis and ventricle move ventrally and to the right), bringing the future chambers into positions resembling the adult heart.', 'Septation divides the atrium (septum primum and secundum), the atrioventricular canal (endocardial cushions), the ventricles (muscular and membranous interventricular septum) and the outflow tract (aorticopulmonary septum).'] },
      { heading: 'Clinical relevance', kind: 'text', body: ['Failure of septation causes atrial and ventricular septal defects, the most common congenital heart malformations. Abnormal outflow-tract septation can cause conditions such as persistent truncus arteriosus or transposition of the great arteries.'] },
    ],
    related_structure_ids: ['right-atrium', 'left-ventricle'], exercises: [
      { question: 'Which embryonic tissue gives rise to the heart tube?', answer: 'Splanchnic (lateral plate) mesoderm of the cardiogenic area.' },
    ], references: [L],
  },
  {
    id: 'embryo-fetal-circulation', title: 'Fetal circulation', subject: 'embryology', system_id: 'cardiovascular', region_id: 'thorax', organ_id: 'heart', difficulty: 'intermediate',
    summary: 'Shunts that bypass the fetal lungs and liver, and how they change at birth.',
    learning_objectives: ['Name the three fetal shunts.', 'Explain why the foramen ovale and ductus arteriosus are needed.', 'State what each becomes after birth.'],
    sections: [
      { heading: 'Characteristics', kind: 'characteristics', body: ['Oxygenated blood from the placenta travels in the umbilical vein; much of it bypasses the liver through the ductus venosus into the inferior vena cava.', 'In the right atrium, a large part of this blood crosses the foramen ovale into the left atrium. Blood that enters the pulmonary trunk largely bypasses the high-resistance fetal lungs through the ductus arteriosus into the aorta.'] },
      { heading: 'Adaptations', kind: 'adaptations', body: ['Fetal lungs are fluid-filled with high vascular resistance, so only a small fraction of right ventricular output goes to the lungs. The shunts divert blood to the systemic circulation.'] },
      { heading: 'Changes at birth', kind: 'functions', body: ['Lungs expand, pulmonary resistance falls and pulmonary blood flow rises; left atrial pressure exceeds right atrial pressure and the foramen ovale closes, leaving the fossa ovalis. The ductus arteriosus constricts and becomes the ligamentum arteriosum; the ductus venosus becomes the ligamentum venosum; the umbilical vein becomes the ligamentum teres of the liver.'] },
      { heading: 'Clinical relevance', kind: 'text', body: ['A patent ductus arteriosus or patent foramen ovale are persisting fetal shunts.'] },
    ],
    related_structure_ids: ['right-atrium', 'left-atrium', 'pulmonary-trunk', 'aorta'], exercises: [
      { question: 'What does the foramen ovale become in the adult?', answer: 'The fossa ovalis in the interatrial septum.' },
    ], references: [L],
  },
]

export const getLesson = (id: string) => LESSONS.find((l) => l.id === id)
