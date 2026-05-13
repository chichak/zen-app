// ============================================================
// LES 7 PRINCIPES — Données structurées
// ============================================================

const PRINCIPLES = [
  {
    id: 1,
    name: 'Neuroplasticité',
    glyph: '◐',
    tagline: 'Le cerveau se recâble par la répétition',
    description: 'Le cerveau se recâble en fonction de ce que tu répètes. Plus tu répètes un comportement ou une pensée, plus ça devient automatique.',
    practice: {
      title: 'Pratique : Répétition consciente',
      steps: [
        'Choisis UNE pensée ou comportement à renforcer aujourd\'hui',
        'Écris-le clairement dans ton journal',
        'Répète-le mentalement 5 fois avec présence',
        'Identifie une occasion concrète de l\'appliquer aujourd\'hui'
      ]
    },
    duration: 5
  },
  {
    id: 2,
    name: 'Système nerveux autonome',
    glyph: '∿',
    tagline: 'Activer le parasympathique pour récupérer',
    description: 'Deux niveaux : le sympathique (survie, stress) et le parasympathique (repos, récupération). Si tu es chroniquement en stress, tu ne peux pas récupérer. Active consciemment le parasympathique.',
    practice: {
      title: 'Pratique : Respiration 4-7-8',
      steps: [
        'Inspire par le nez pendant 4 secondes',
        'Retiens ta respiration pendant 7 secondes',
        'Expire lentement par la bouche pendant 8 secondes',
        'Répète 4 cycles pour activer le parasympathique'
      ]
    },
    duration: 4,
    hasTimer: true,
    timerType: 'breathing'
  },
  {
    id: 3,
    name: 'Champ électromagnétique du cœur',
    glyph: '♡',
    tagline: 'Le cœur influence le cerveau',
    description: 'Le champ du cœur est 5 000 fois plus puissant que celui du cerveau. Le cœur influence plus le cerveau que l\'inverse. Régule ton cœur : respiration, parler lentement, bouger lentement, méditation.',
    practice: {
      title: 'Pratique : Cohérence cardiaque (5-5)',
      steps: [
        'Pose une main sur ton cœur',
        'Inspire pendant 5 secondes',
        'Expire pendant 5 secondes',
        'Ressens une émotion de gratitude ou de paix pendant la pratique',
        'Continue pendant 5 minutes'
      ]
    },
    duration: 5,
    hasTimer: true,
    timerType: 'coherence'
  },
  {
    id: 4,
    name: 'Répétition mentale',
    glyph: '◈',
    tagline: 'Visualiser active les mêmes zones que faire',
    description: 'Quand tu imagines une action, ton cerveau active les mêmes zones que lorsque tu la fais. Une visualisation de 10 minutes peut aider à encoder une nouvelle réalité pleine de succès.',
    practice: {
      title: 'Pratique : Visualisation immersive',
      steps: [
        'Ferme les yeux dans un endroit calme',
        'Visualise un objectif comme déjà accompli',
        'Engage tous tes sens : vue, son, toucher, émotion',
        'Ressens la gratitude comme si c\'était maintenant',
        'Reste dans cet état pendant 10 minutes'
      ]
    },
    duration: 10,
    hasTimer: true,
    timerType: 'visualization'
  },
  {
    id: 5,
    name: 'Cerveau subconscient',
    glyph: '☉',
    tagline: '85% de tes actions sont automatiques',
    description: '85% de tes actions sont guidées par ton subconscient. Le corps garde le score de tout ce que tu as vécu. Arrête d\'essayer de changer consciemment — utilise méditation et répétition de nouveaux patterns.',
    practice: {
      title: 'Pratique : Méditation d\'observation',
      steps: [
        'Assieds-toi en silence pendant 10 minutes',
        'Observe tes pensées sans les juger',
        'Note les patterns récurrents qui apparaissent',
        'Identifie une croyance limitante à transformer',
        'Remplace-la par sa version élevée'
      ]
    },
    duration: 10,
    hasTimer: true,
    timerType: 'meditation'
  },
  {
    id: 6,
    name: 'Système d\'activation réticulaire',
    glyph: '✦',
    tagline: 'Tu vois ce que tu crois',
    description: 'Le subconscient peut traiter 11 millions d\'informations par seconde, le conscient seulement 40. La réalité est filtrée selon ton identité et tes croyances. Change l\'identité, change la réalité perçue.',
    practice: {
      title: 'Pratique : Reprogrammation du filtre',
      steps: [
        'Écris 3 nouvelles croyances sur qui tu deviens',
        'Lis-les à voix haute avec conviction',
        'Cherche activement 3 preuves dans ta journée',
        'Note ce que tu remarques que tu n\'avais pas vu avant'
      ]
    },
    duration: 5
  },
  {
    id: 7,
    name: 'Neurogenèse',
    glyph: '✺',
    tagline: 'Créer de nouveaux neurones chaque jour',
    description: 'Le cerveau crée environ 100 nouveaux neurones par jour dans l\'hippocampe. La méditation et l\'exercice physique favorisent ce processus.',
    practice: {
      title: 'Pratique : Mouvement conscient',
      steps: [
        'Bouge ton corps pendant au moins 20 minutes',
        'Marche, étirements, yoga, ou cardio léger',
        'Reste pleinement présent dans les sensations',
        'Combine avec une méditation de 5 minutes',
        'Hydrate-toi bien après'
      ]
    },
    duration: 25
  }
];

// Helper : récupérer un principe par ID
function getPrinciple(id) {
  return PRINCIPLES.find(p => p.id === id);
}
