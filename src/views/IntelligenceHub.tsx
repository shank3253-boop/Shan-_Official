import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookText, Zap, BrainCircuit, Microscope, Globe, Calculator, Binary, Sparkles, ChevronRight, Info, FileText, ArrowLeft, Send, CheckCircle2, Loader2, BarChart3, TrendingUp, History, Flag, Map, Shield, Landmark, Target, PenTool, FileSearch, Moon, Megaphone, Database, Plus } from 'lucide-react';
import { generateFullGSAPaper, FullGSAPaper } from '../lib/gemini';
import { getSubjectiveVault, generateNewSubjectiveQuestion } from '../services/intelligenceService';
import { SubjectiveQuestion } from '../types';
import Markdown from 'react-markdown';

const GSA_NOTES = [
  {
    title: "Physical Sciences",
    icon: Microscope,
    color: "blue",
    content: [
      {
        subtitle: "Universe & Space",
        points: [
          "Universe → galaxies → solar systems",
          "Galaxy = system of stars",
          "Light Year = distance light travels in 1 year",
          "Earth revolves around Sun (365 days)",
          "Insight: Focus on Black Holes and Dark Matter for modern papers."
        ]
      },
      {
        subtitle: "Weather & Climate",
        points: [
          "Temperature, pressure, humidity",
          "Winds → caused by pressure differences",
          "Rainfall → condensation process",
          "Trend: High frequency of questions on El Niño and La Niña."
        ]
      },
      {
        subtitle: "Natural Disasters",
        points: [
          "Earthquake → tectonic plate movement",
          "Tsunami → underwater earthquake",
          "Cyclone → low-pressure system",
          "Exam Note: 2005 Earthquake vs 2022 Floods context is vital."
        ]
      },
      {
        subtitle: "Energy",
        points: [
          "Renewable: Solar, Wind, Tidal",
          "Non-renewable: Coal, Oil, Nuclear (cleaner but limited)",
          "LED = energy efficient (repeated 3+ times in past 10 years)"
        ]
      },
      {
        subtitle: "Atomic Structure",
        points: [
          "Proton (+), Electron (-), Neutron (0)",
          "Chemical bonding = sharing/transfer of electrons",
          "Note: Isotopes and their uses in medicine/agriculture (Repeated)."
        ]
      }
    ]
  },
  {
    title: "Biological Sciences",
    icon: BrainCircuit,
    color: "emerald",
    content: [
      {
        subtitle: "Cell Biology",
        points: [
          "Basic unit of life; Prokaryotic vs Eukaryotic",
          "Nucleus (Control), Mitochondria (Energy/ATP)",
          "Ribosomes (Protein Synthesis), Lysosomes (Cleanup)"
        ]
      },
      {
        subtitle: "Biomolecules",
        points: [
          "Proteins → growth, amino acids",
          "Carbohydrates → energy, glucose",
          "Lipids → storage, long-term energy",
          "Insight: Enzymes as biological catalysts (Recent trend)."
        ]
      },
      {
        subtitle: "Human Diseases",
        points: [
          "Malaria (Plasmodium), Dengue (Aedes Aegypti)",
          "Hepatitis → liver infection (Type A, B, C)",
          "Zoonotic diseases (COVID-19 context) are high priority."
        ]
      }
    ]
  },
  {
    title: "Environmental Science",
    icon: Globe,
    color: "amber",
    content: [
      {
        subtitle: "Pollution & Waste",
        points: [
          "Air: CO₂, NOx, SO₂ (Acid Rain)",
          "Water: Eutrophication + Industrial Runoff",
          "Plastics: Microplastics reaching food chains."
        ]
      },
      {
        subtitle: "Climate Change",
        points: [
          "Greenhouse gases: Capture heat in atmosphere",
          "Ozone depletion: CFCs breaking O₃ layer",
          "Global warming vs Global Boiling (Modern term)."
        ]
      }
    ]
  },
  {
    title: "Food Science",
    icon: Zap,
    color: "rose",
    content: [
      {
        subtitle: "Balanced Diet",
        points: [
          "Carbs (50-60%), Proteins (15-20%), Fats (20-30%)",
          "Vitamins (Fat soluble: A, D, E, K; Water soluble: B, C)",
          "Minerals: Iron (Blood), Calcium (Bones)."
        ]
      },
      {
        subtitle: "Food Preservation",
        points: [
          "Freezing (Stops growth), Pasteurization (Kills bacteria)",
          "Dehydration + Canning (Traditional)",
          "Irradiation (Modern high-tech preservation)."
        ]
      }
    ]
  },
  {
    title: "Information Technology",
    icon: Sparkles,
    color: "violet",
    content: [
      {
        subtitle: "Modern Computing",
        points: [
          "Hardware vs Software vs Firmware",
          "AI = machine intelligence (Generative AI trend)",
          "Cloud Computing + IoT (Internet of Things)."
        ]
      },
      {
        subtitle: "Networking & Security",
        points: [
          "LAN vs WAN vs VPN",
          "Cybersecurity: Encryption, Firewalls, Malware",
          "Note: Blockchain application in governance (2026 Prediction)."
        ]
      }
    ]
  },
  {
    title: "Ability Dimensions",
    icon: Binary,
    color: "slate",
    content: [
      {
        subtitle: "Quantitative Ability",
        points: [
          "Averages, Percentages, and Ratios (40% of Ability weight)",
          "Algebra: Basic equations + Age problems",
          "Geometry: Area, Volume, Perimeter concepts."
        ]
      },
      {
        subtitle: "Logical Reasoning",
        points: [
          "Coding-Decoding (Number-Letter shifts)",
          "Syllogisms (All A are B logic)",
          "Direction sense and Blood relations."
        ]
      },
      {
        subtitle: "Analytical Reasoning",
        points: [
          "Sequence & Arrangement (Seating puzzles)",
          "Pattern Recognition (Image/Number series)",
          "Data Interpretation: Tables/Pie charts."
        ]
      }
    ]
  }
];

const ABILITY_QUESTIONS = [
  {
    type: "Quantitative",
    question: "Find average of 10, 20, 30, 40",
    solution: "Sum = 10 + 20 + 30 + 40 = 100\nAverage = Sum / Count = 100 / 4 = 25",
    icon: Calculator
  },
  {
    type: "Percentage",
    question: "What is 20% of 150?",
    solution: "20% = 20/100\nValue = (20/100) × 150 = 0.2 × 150 = 30",
    icon: Zap
  },
  {
    type: "Ratio",
    question: "Ratio of 2:3, total = 50. Find both values.",
    solution: "Total parts = 2 + 3 = 5\n1 part = 50 / 5 = 10\nValue 1 = 2 × 10 = 20\nValue 2 = 3 × 10 = 30",
    icon: Binary
  }
];

const PAST_PAPER_ANALYSIS = [
  {
    era: "1971 - 1990",
    theme: "Foundational Science",
    focus: "Heavy emphasis on classical physics, basic biology, and factual solar system questions. Ability section was secondary.",
    tags: ["Classical Physics", "Basic Bio", "Factual"]
  },
  {
    era: "1991 - 2005",
    theme: "Modernization",
    focus: "Shift towards environmental issues, IT basics, and more structured analytical logic in the Ability section.",
    tags: ["Information Tech", "Environment", "Logic"]
  },
  {
    era: "2006 - 2015",
    theme: "Conceptual Depth",
    focus: "Questions became more application-based. Natural disasters and climate change became permanent fixtures.",
    tags: ["Climate Risk", "Disasters", "Applied Science"]
  },
  {
    era: "2016 - 2026",
    theme: "The Digital & Green Pivot",
    focus: "Current era focuses on AI, Cybersecurity, Green Energy, and complex data interpretation (Ability).",
    tags: ["AI & Data", "Cybersecurity", "Green Energy"]
  }
];

const FREQUENT_TOPICS = [
  { topic: "Solar System & Space", frequency: "Very High", percentage: 95 },
  { topic: "Natural Disasters (Earthquakes/Tsunamis)", frequency: "High", percentage: 80 },
  { topic: "Biological Cell & Diseases", frequency: "High", percentage: 75 },
  { topic: "Energy (Renewable vs Non-renewable)", frequency: "Moderate", percentage: 65 },
  { topic: "Information Technology (AI/Networking)", frequency: "Rising", percentage: 90 },
  { topic: "Environmental Pollution & Climate Change", frequency: "Critical", percentage: 100 }
];

const PAK_AFFAIRS_NOTES = [
  {
    title: "Ideology of Pakistan",
    icon: BrainCircuit,
    color: "emerald",
    content: [
      {
        subtitle: "The Foundation",
        points: [
          "Ideology: Belief in separate identity based on religion & culture.",
          "Two-Nation Theory: Muslims and Hindus are distinct nations.",
          "Iqbal's Vision: Allahabad Address (1930) specified the goal.",
          "Jinnah's Leadership: Unity, Faith, Discipline as the pillars."
        ]
      },
      {
        subtitle: "Evolution & Reform",
        points: [
          "Roots: From Muhammad bin Qasim (712 AD) to Mughal peak.",
          "Revivalists: Sheikh Ahmad Sirhindi & Shah Waliullah.",
          "Educational Movements: Aligarh (Modern), Deoband (Traditional).",
          "Reformers: Syed Ahmad Shaheed (Jihad Movement)."
        ]
      }
    ]
  },
  {
    title: "Security & Politics",
    icon: Shield,
    color: "rose",
    content: [
      {
        subtitle: "Civil-Military Relations",
        points: [
          "History of military influence in Pakistani politics.",
          "Impact of weak democratic institutions on governance.",
          "The 'Hybrid' Governance model in modern analysis."
        ]
      },
      {
        subtitle: "National Security",
        points: [
          "Traditional: Border tensions with India & Afghanistan.",
          "Non-Traditional: Terrorism, Cyber threats, Climate risk.",
          "Nuclear Program: Deterrence vs Global safety concerns."
        ]
      }
    ]
  },
  {
    title: "Foreign Policy",
    icon: Globe,
    color: "blue",
    content: [
      {
        subtitle: "External Dynamics",
        points: [
          "India: 1948, 1965, 1971 wars; Kashmir as core issue.",
          "Afghanistan: Refugee crisis & impacts of the 'War on Terror'.",
          "China: Strategic DEP (CPEC) and the 'All-weather' bond."
        ]
      },
      {
        subtitle: "Global Standing",
        points: [
          "USA Relations: Post-9/11 alliance & economic security pacts.",
          "Muslim World: Role in OIC and Middle East economic ties.",
          "Regional: Challenges in SAARC vs opportunities in SCO/ECO."
        ]
      }
    ]
  },
  {
    title: "Critical Domestic Issues",
    icon: Zap,
    color: "amber",
    content: [
      {
        subtitle: "Economic Weakness",
        points: [
          "External Debt, Inflation, and IMF dependency cycles.",
          "Resource Mismanagement & Population growth pressures.",
          "Energy Crisis: Load shedding vs import dependence."
        ]
      },
      {
        subtitle: "Governance & Society",
        points: [
          "Water Crisis: Indus disputes & melting glaciers.",
          "Social: Poverty, Illiteracy, and the Health crisis.",
          "Constitution: 1973 document and the impact of amendments."
        ]
      }
    ]
  }
];

const PAK_AFFAIRS_ANALYSIS = [
  {
    era: "1947 - 1970",
    theme: "State Building",
    focus: "Constitution making, Refugee crisis, and Initial wars with India.",
    tags: ["State Survival", "Liaquat-Nehru", "1956/1962 Const"]
  },
  {
    era: "1971 - 2000",
    theme: "Political Shifts",
    focus: "Loss of East Pakistan, 1973 Constitution, Islamization, and Nuclear tests.",
    tags: ["1973 Constitution", "Jihad Era", "1998 Tests"]
  },
  {
    era: "2001 - 2026",
    theme: "The Modern Crisis",
    focus: "War on Terror, CPEC, Economic instability, and Hybrid Governance.",
    tags: ["CPEC", "FATF", "Hybrid Regime"]
  }
];

const PAK_AFFAIRS_FREQUENT = [
  { topic: "Two-Nation Theory / Aligarh", frequency: "Critical", percentage: 100 },
  { topic: "Civil-Military Relations", frequency: "Very High", percentage: 90 },
  { topic: "Kashmir Issue & India Relations", frequency: "High", percentage: 85 },
  { topic: "Economic Stability / IMF", frequency: "High", percentage: 80 },
  { topic: "Constitution (1973) & Amendments", frequency: "Moderate", percentage: 70 },
  { topic: "Foreign Policy (US/China)", frequency: "High", percentage: 88 }
];

const PAK_STRATEGY = [
  {
    title: "Answer Writing Framework",
    points: [
      "Introduction (Define context)",
      "Thesis Statement (Your core argument)",
      "Main Body (5-7 Headings with sub-points)",
      "Critical Analysis (The 'Why' and 'How')",
      "Current Relevance (Link to year 2026/27)",
      "Conclusion (Synthesis of points)"
    ]
  },
  {
    title: "Topper Hacks",
    points: [
      "Use Flowcharts for Civil-Military relations.",
      "Quote 1973 Constitution Articles where relevant.",
      "Draw sketch maps for Foreign Policy issues.",
      "Use bullet points for Economic solutions."
    ]
  }
];

const PAK_EXPECTED_QUESTIONS = [
  "Critically analyze Two-Nation Theory in modern context.",
  "Civil-military relations in Pakistan: Challenges & Prospect.",
  "Pakistan’s economic crisis: Root causes & Structural solutions.",
  "Kashmir issue: Future prospects in changing global dynamics.",
  "Role of Judiciary in the political evolution of Pakistan.",
  "Pakistan’s Foreign Policy challenges in a multi-polar world."
];

const SUBJECT_CONFIG: Record<string, any> = {
  GSA: {
    label: "SCIENCE & ABILITY",
    notes: GSA_NOTES,
    analysis: PAST_PAPER_ANALYSIS,
    frequent: FREQUENT_TOPICS,
    hasAbility: true,
    hasMock: true
  },
  PAK: {
    label: "Pakistan Affairs",
    notes: PAK_AFFAIRS_NOTES,
    analysis: PAK_AFFAIRS_ANALYSIS,
    frequent: PAK_AFFAIRS_FREQUENT,
    strategy: PAK_STRATEGY,
    questions: PAK_EXPECTED_QUESTIONS,
    outlines: [
      {
        question: "Critically analyze Two-Nation Theory in modern context.",
        outline: [
          "I. Introduction: Origins of Two-Nation Theory (Jinnah/Iqbal).",
          "II. Post-1971 Analysis: Impact of the fall of Dhaka.",
          "III. Modern Identity: Muslims vs Hindus as distinct socio-political units.",
          "IV. Challenges: Rise of Extremism vs Original Ideology.",
          "V. Conclusion: Sovereignty as a means to safeguard minority rights."
        ]
      },
      {
        question: "Pakistan’s economic crisis: Root causes & Structural solutions.",
        outline: [
          "I. Introduction: Current macro-economic indicators.",
          "II. Root Causes: Debt servicing, Import dependence, Circular debt.",
          "III. The IMF factor: Sovereignty vs Economic survival.",
          "IV. Structural Reforms: Expanding the tax net, Industrialization.",
          "V. Conclusion: Need for long-term economic charter."
        ]
      }
    ],
    hasStrategy: true
  },
  ESSAY: {
    label: "English Essay",
    notes: [
      {
        title: "Essay Dimensions",
        icon: PenTool,
        color: "blue",
        content: [
          {
            subtitle: "Global & Domestic Issues",
            points: [
              "Governance Crisis in Pakistan [Past Paper 2024]",
              "Climate Change: Global Boiling Era [Predicted]",
              "Artificial Intelligence: Threat or Opportunity? [High Yield]",
              "Democracy vs Authoritarianism [Trending]"
            ]
          },
          {
            subtitle: "Literary & Abstract",
            points: [
              "Life is continuous struggle. [Classic]",
              "Truth is a rare commodity. [Analytical]",
              "Gender Equality: Fact or Fiction? [Most Repeated]"
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1971-2010", theme: "Historical/Literary", focus: "Topics were philosophical or related to history.", tags: ["Literature", "History"] },
      { era: "2011-2026", theme: "Issue-Based", focus: "Shift to governance, economy, and global digital shifts.", tags: ["Governance", "Economy", "Digital"] }
    ],
    frequent: [
      { topic: "Education System Reforms", frequency: "Critical", percentage: 95 },
      { topic: "Economy & IMF dependency", frequency: "Very High", percentage: 90 },
      { topic: "Climate Change & Resilience", frequency: "High", percentage: 85 }
    ],
    strategy: [
      {
        title: "Essay Blueprint",
        points: [
          "Introduction (Outline based)",
          "Thesis Statement (Clear & Concise)",
          "Background/History",
          "Current Situation (Statistics)",
          "Critical Analysis (SWOT)",
          "Conclusion (Positive Outlook)"
        ]
      }
    ],
    questions: [
      "Governance in Pakistan: Challenges and way forward.",
      "Global Warming is a real threat to human civilization.",
      "The role of AI in the future of education.",
      "Democracy cannot flourish without economic stability."
    ],
    outlines: [
      {
        question: "Governance in Pakistan: Challenges and way forward.",
        outline: [
          "I. Introduction: Defining Governance and its state in Pakistan.",
          "II. Thesis: Structural flaws vs Political will.",
          "III. Historical context: Bureaucratic inertia.",
          "IV. Challenges: Corruption, Lack of Accountability, Weak Rule of Law.",
          "V. Socio-Economic impact of Poor Governance.",
          "VI. Way Forward: Institutional reforms, Digital Governance, Educational uplift.",
          "VII. Conclusion."
        ]
      }
    ],
    hasStrategy: true
  },
  PRECIS: {
    label: "Precis & Comp",
    notes: [
      {
        title: "Composition Mastery",
        icon: FileSearch,
        color: "slate",
        content: [
          {
            subtitle: "The Precis Rule",
            points: [
              "Always 1/3rd of the original length. [Past Paper Rule]",
              "One-Third summary with a suitable title.",
              "Avoid using first-person ('I', 'We')."
            ]
          },
          {
            subtitle: "Vocabulary & Grammar",
            points: [
              "Idioms & Phrasal Verbs [High Yield]",
              "Punctuation & Prepositions [Most Repeated]",
              "Analogies & Sentence correction."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "2016-2026", theme: "Analytical Comprehension", focus: "Shift towards complex philosophical passages for summary.", tags: ["Precis", "Vocabulary"] }
    ],
    frequent: [
      { topic: "Precis Writing", frequency: "Critical", percentage: 100 },
      { topic: "Sentence Correction", frequency: "High", percentage: 85 }
    ],
    hasStrategy: false
  },
  ISLAMIAT: {
    label: "Islamic Studies",
    notes: [
      {
        title: "Dawah & Governance",
        icon: Moon,
        color: "emerald",
        content: [
          {
            subtitle: "Islamic State",
            points: [
              "Concept of Sovereignty in Islam. [Past Paper]",
              "Economic System: Zakat & Ushr. [High Yield]",
              "Governance: Shura & Accountability. [Predicted]"
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1971-2026", theme: "Modern Application", focus: "Questions shifted from basic rituals to modern governance challenges.", tags: ["Governance", "Modernity"] }
    ],
    frequent: [
      { topic: "Governance in Islam", frequency: "Critical", percentage: 98 },
      { topic: "Human Rights in Islam", frequency: "High", percentage: 85 }
    ],
    hasStrategy: false
  },
  CA: {
    label: "Current Affairs",
    notes: [
      {
        title: "Global Geopolitics",
        icon: Megaphone,
        color: "rose",
        content: [
          {
            subtitle: "Global Shifts",
            points: [
              "Multi-polar world: Rise of China & Russia. [2026 Prediction]",
              "Middle East: Normalization vs Conflict. [Trending]",
              "Climate Geopolitics: Green energy wars. [High Yield]"
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "2000-2026", theme: "Regional Security", focus: "Shift from US-centric policy to regional integration (CPEC/BRICS).", tags: ["CPEC", "BRICS", "Regionalism"] }
    ],
    frequent: [
      { topic: "CPEC & BRI", frequency: "Critical", percentage: 100 },
      { topic: "South Asian Geopolitics", frequency: "Very High", percentage: 90 }
    ],
    hasStrategy: false
  },
  POL_SCIENCE: {
    label: "Political Science",
    notes: [
      {
        title: "Political Philosophy",
        icon: Landmark,
        color: "blue",
        content: [
          {
            subtitle: "Western Thinkers",
            points: [
              "Plato's Ideal State & Justice. [Recurring]",
              "Aristotle: Classification of Constitutions. [High Yield]",
              "Machiavelli: The Prince & Power Politics. [Modern Relevance]"
            ]
          },
          {
            subtitle: "Muslim Thinkers",
            points: [
              "Al-Farabi: The Virtuous City. [Past Paper]",
              "Ibn Khaldun: Asabiyyah & Rise/Fall of States. [Critical]",
              "Allama Iqbal: Concept of Khudi & State."
            ]
          }
        ]
      },
      {
        title: "State & Constitution",
        icon: Shield,
        color: "slate",
        content: [
          {
            subtitle: "Global Systems",
            points: [
              "Presidential vs Parliamentary (USA vs UK).",
              "Federation vs Unitary systems.",
              "The role of Judiciary and Rule of Law."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1971-2026", theme: "Comparative Theory", focus: "Evolution from pure philosophy to comparative constitutional analysis.", tags: ["Constitution", "Philosophy"] }
    ],
    frequent: [
      { topic: "Ibn Khaldun - Asabiyyah", frequency: "Critical", percentage: 95 },
      { topic: "Western Thinkers Comparison", frequency: "High", percentage: 88 }
    ],
    hasStrategy: false
  },
  IR: {
    label: "IR",
    notes: [
      {
        title: "IR Theory",
        icon: Globe,
        color: "violet",
        content: [
          {
            subtitle: "Theoretical Frameworks",
            points: [
              "Realism vs Idealism vs Constructivism.",
              "Neo-Realism: Power Balance & Survival.",
              "The Liberal Peace Theory and Global Trade."
            ]
          }
        ]
      },
      {
        title: "Modern Diplomacy",
        icon: Target,
        color: "rose",
        content: [
          {
            subtitle: "Cold War & Beyond",
            points: [
              "Bipolarity to Unipolarity to Multi-polarity.",
              "Information Warfare & Strategic Depth.",
              "The role of Non-State Actors."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1980-2026", theme: "Global Hegemony", focus: "Transition from Cold War proxy analysis to Cyber & Economic warfare.", tags: ["Hegemony", "Cyber War"] }
    ],
    frequent: [
      { topic: "Realism vs Idealism", frequency: "Critical", percentage: 100 },
      { topic: "The Rise of China", frequency: "Very High", percentage: 92 }
    ],
    hasStrategy: false
  },
  CRIMINOLOGY: {
    label: "Criminology",
    notes: [
      {
        title: "Theories of Crime",
        icon: FileSearch,
        color: "slate",
        content: [
          {
            subtitle: "Classical & Biological",
            points: [
              "Lombroso: The Born Criminal Theory.",
              "Rational Choice Theory: Crime as a decision.",
              "Sociological: Strain Theory & Social Control."
            ]
          }
        ]
      },
      {
        title: "Juvenile Delinquency",
        icon: Shield,
        color: "blue",
        content: [
          {
            subtitle: "Juvenile Justice",
            points: [
              "Juvenile Justice System Act (JJSA) Pakistan.",
              "Restorative Justice vs Punitive Justice.",
              "Rehabilitation techniques."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "2016-2026", theme: "White Collar & Cyber", focus: "Increasing focus on Money Laundering, Cybercrime, and FATF context.", tags: ["Cybercrime", "FATF"] }
    ],
    frequent: [
      { topic: "Biological Theories", frequency: "High", percentage: 85 },
      { topic: "Juvenile Justice Act", frequency: "Critical", percentage: 98 }
    ],
    hasStrategy: false
  },
  GENDER: {
    label: "Gender Studies",
    notes: [
      {
        title: "Introduction & Foundations",
        icon: BrainCircuit,
        color: "blue",
        content: [
          {
            subtitle: "Gender Studies Basics",
            points: [
              "Difference between Gender and Women Studies.",
              "Multi-disciplinary nature & Autonomy vs Integration debate.",
              "Current status of Gender Studies in Pakistan academia."
            ]
          },
          {
            subtitle: "Social Construction of Gender",
            points: [
              "Historicizing Constructionism & Queer Theory (Sex as socially determined).",
              "Masculinities and Femininity constructs.",
              "Nature versus Culture debate in gender development."
            ]
          }
        ]
      },
      {
        title: "Theories & Movements",
        icon: Zap,
        color: "amber",
        content: [
          {
            subtitle: "Feminist Theories",
            points: [
              "Liberal, Radical, Marxist/Socialist Feminism.",
              "Psychoanalytical, Postmodern, and Men's Feminism.",
              "Practical application of theories in modern policy."
            ]
          },
          {
            subtitle: "Feminist Movements",
            points: [
              "First, Second, and Third Waves of Feminism (West).",
              "History of Feminist Movements in Pakistan.",
              "Impact of UN Conferences on Women's rights."
            ]
          }
        ]
      },
      {
        title: "Gender & Development",
        icon: Globe,
        color: "emerald",
        content: [
          {
            subtitle: "Development Approaches",
            points: [
              "WID (Women in Development), WAD (Women and Development), GAD (Gender and Development).",
              "Gender analysis of Modernization & Dependency theories.",
              "Critique of Structural Adjustment Policies (SAPs) & Globalization."
            ]
          },
          {
            subtitle: "Socio-Economic Status in Pakistan",
            points: [
              "Women's Health, Education, and employment status.",
              "Gender gaps in the labor force and informal economy.",
              "Impact of Colonial and Capitalistic perspectives."
            ]
          }
        ]
      },
      {
        title: "Governance & Law",
        icon: Landmark,
        color: "rose",
        content: [
          {
            subtitle: "Political Participation",
            points: [
              "Suffragist Movement history.",
              "Women as Voters, Candidates, and Representatives.",
              "Impact of the Political Quota system in Pakistan."
            ]
          },
          {
            subtitle: "Legal Framework",
            points: [
              "Constitutional protections and Gender-specific laws.",
              "Women's legal status in family and criminal law.",
              "Implementation challenges of pro-women legislation."
            ]
          }
        ]
      },
      {
        title: "Violence & Case Studies",
        icon: Shield,
        color: "slate",
        content: [
          {
            subtitle: "Gender Based Violence (GBV)",
            points: [
              "Defining GBV: Structural and Direct forms of violence.",
              "Theories of Violence against Women.",
              "National and Global strategies to eliminate GBV."
            ]
          },
          {
            subtitle: "Critical Case Studies",
            points: [
              "Mukhtaran Mai: Resistance against tribal injustice.",
              "Malala Yousafzai: Advocacy for girls' education.",
              "Sharmeen Obaid-Chinoy: Highlighting social issues through media."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "2016-2026", theme: "Development & Rights", focus: "Focus on glass ceilings, domestic violence laws, and UN Sustainable Goals.", tags: ["Development", "Laws"] }
    ],
    frequent: [
      { topic: "Waves of Feminism", frequency: "Critical", percentage: 100 },
      { topic: "Women and Development (GAD/WID/WAD)", frequency: "Very High", percentage: 92 },
      { topic: "Gender Based Violence & National Laws", frequency: "High", percentage: 85 },
      { topic: "Social Construction of Gender", frequency: "High", percentage: 80 },
      { topic: "Political Quota & Impact", frequency: "Moderate", percentage: 70 }
    ],
    hasStrategy: false
  },
  US_HISTORY: {
    label: "US History",
    notes: [
      {
        title: "Foundation & Growth",
        icon: Landmark,
        color: "blue",
        content: [
          {
            subtitle: "Revolutionary Era",
            points: [
              "War of Independence: Causes & Consequences.",
              "Federalist vs Anti-Federalist debates.",
              "Westward Expansion & Manifest Destiny."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1971-2026", theme: "Global Superpower", focus: "Shift from internal civil rights to US role as global policeman and digital leader.", tags: ["Civil Rights", "Superpower"] }
    ],
    frequent: [
      { topic: "Westward Expansion", frequency: "High", percentage: 80 },
      { topic: "The Great Depression", frequency: "High", percentage: 75 }
    ],
    hasStrategy: false
  },
  SOCIOLOGY: {
    label: "Sociology",
    notes: [
      {
        title: "Sociological Theory",
        icon: BrainCircuit,
        color: "rose",
        content: [
          {
            subtitle: "The Big Three",
            points: [
              "Durkheim: Social Facts and Integration.",
              "Karl Marx: Class Conflict & Capitalism.",
              "Max Weber: Bureaucracy & Rationalization."
            ]
          }
        ]
      }
    ],
    analysis: [
      { era: "1971-2026", theme: "Social Change", focus: "Evolution from basic group studies to complex urbanization and digital socialization.", tags: ["Urbanization", "Digital Social"] }
    ],
    frequent: [
      { topic: "Marxist Theory", frequency: "Critical", percentage: 95 },
      { topic: "Social Stratification", frequency: "Very High", percentage: 90 }
    ],
    hasStrategy: false
  }
};

export default function IntelligenceHub() {
  const [activeSubject, setActiveSubject] = useState<string>('GSA');
  const [activeTab, setActiveTab] = useState<'notes' | 'ability' | 'trends' | 'mock' | 'analysis' | 'strategy' | 'vault'>('notes');
  const [mockPaper, setMockPaper] = useState<FullGSAPaper | null>(null);
  const [isGeneratingPaper, setIsGeneratingPaper] = useState(false);

  const [vaultQuestions, setVaultQuestions] = useState<SubjectiveQuestion[]>([]);
  const [isLoadingVault, setIsLoadingVault] = useState(false);
  const [isGeneratingVault, setIsGeneratingVault] = useState(false);

  const handleGeneratePaper = async () => {
    setIsGeneratingPaper(true);
    try {
      const paper = await generateFullGSAPaper();
      setMockPaper(paper);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingPaper(false);
    }
  };

  const loadVault = async () => {
    setIsLoadingVault(true);
    try {
      const q = await getSubjectiveVault();
      setVaultQuestions(q);
    } catch (error) {
      console.error("Failed to load vault:", error);
    } finally {
      setIsLoadingVault(false);
    }
  };

  const handleGenerateVaultQuestion = async () => {
    setIsGeneratingVault(true);
    try {
      const sub = SUBJECT_CONFIG[activeSubject].label;
      await generateNewSubjectiveQuestion(sub);
      await loadVault();
    } catch (error) {
      console.error("Failed to generate question:", error);
    } finally {
      setIsGeneratingVault(false);
    }
  };

  useEffect(() => {
    loadVault();
  }, []);

  const config = SUBJECT_CONFIG[activeSubject];
  const currentNotes = config.notes;
  const currentAnalysis = config.analysis;
  const currentFrequent = config.frequent;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="max-w-md">
          <h1 className="text-4xl font-serif text-[#141414] mb-4">Intelligence <span className="text-[#5A5A40]">Hub</span></h1>
          <p className="text-sm text-[#14141460] leading-relaxed">
            Condensed syllabus domains, extracted trends, and cross-subject mapping for CSS candidates. 
            <span className="block mt-2 font-black text-[#5A5A40] text-[10px] uppercase tracking-tighter">Verified Pattern: 1971–2026</span>
          </p>
        </div>

        <div className="flex flex-col gap-6 w-full xl:w-auto">
          <div className="flex flex-wrap gap-2 justify-start xl:justify-end">
            {Object.keys(SUBJECT_CONFIG).map(sub => (
              <button
                key={sub}
                onClick={() => {
                  setActiveSubject(sub);
                  setActiveTab('notes');
                }}
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all ${
                  activeSubject === sub 
                    ? 'bg-[#141414] text-white shadow-xl scale-105' 
                    : 'bg-white border border-[#14141410] text-[#14141440] hover:text-[#141414]'
                }`}
              >
                {SUBJECT_CONFIG[sub].label}
              </button>
            ))}
          </div>

          <div className="flex bg-white p-1.5 rounded-2xl border border-[#14141410] shadow-sm flex-wrap gap-2">
            {[
              { id: 'notes', label: 'Syllabus Notes', icon: BookText },
              config.hasAbility && { id: 'ability', label: 'Ability Bank', icon: BrainCircuit },
              config.hasStrategy && { id: 'strategy', label: 'Answer Framing', icon: Target },
              { id: 'trends', label: 'Trend Engine', icon: Sparkles },
              { id: 'analysis', label: 'Evolutionary Analysis', icon: BarChart3 },
              { id: 'vault', label: 'Subjective Vault', icon: Database },
              config.hasMock && { id: 'mock', label: '100-Mark Mock', icon: FileText },
            ].filter(Boolean).map((tab: any) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-[#5A5A40] text-white shadow-lg' 
                    : 'text-[#14141440] hover:text-[#141414]'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {currentNotes.map((category, idx) => (
              <div key={idx} className="bg-white rounded-[2.5rem] border border-[#14141405] overflow-hidden shadow-sm flex flex-col">
                <div className={`p-8 bg-${category.color}-50 border-b border-${category.color}-100 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <category.icon className={`text-${category.color}-600`} size={24} />
                    <h2 className={`text-xl font-serif font-bold text-${category.color}-900`}>{category.title}</h2>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest text-${category.color}-600/50 bg-${category.color}-100 px-2 py-1 rounded`}>Master Layer</span>
                </div>
                
                <div className="p-8 space-y-8 flex-1">
                  {category.content.map((section, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#14141440]">{section.subtitle}</h3>
                      <ul className="space-y-3">
                        {section.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex gap-3 text-sm text-[#14141480] leading-relaxed">
                            <span className={`w-1.5 h-1.5 rounded-full bg-${category.color}-400 mt-1.5 shrink-0`} />
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'strategy' && config.hasStrategy && (
          <motion.div
            key="strategy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {config.strategy.map((strat: any, idx: number) => (
                <div key={idx} className="bg-white p-10 rounded-[3rem] border border-[#14141405] shadow-sm">
                  <h3 className="text-2xl font-serif font-bold text-[#141414] mb-8 flex items-center gap-3">
                    <Target className="text-[#5A5A40]" /> {strat.title}
                  </h3>
                  <div className="space-y-4">
                    {strat.points.map((pt: any, pIdx: number) => (
                      <div key={pIdx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-xs font-black text-[#5A5A40] shadow-sm">
                          {pIdx + 1}
                        </div>
                        <p className="text-sm font-bold text-[#141414]">{pt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#141414] text-white p-12 rounded-[4rem]">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="text-[#5A5A40]" />
                <h2 className="text-2xl font-serif font-bold">2026/27 High Probability Questions & Outlines</h2>
              </div>
              <div className="space-y-6">
                {config.questions.map((q: any, idx: number) => (
                  <div key={idx} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <p className="text-xl font-serif text-white/90 leading-tight">
                        <span className="text-[#5A5A40] font-black mr-3">Q{idx + 1}.</span> {q}
                      </p>
                      <span className="text-[10px] font-black uppercase text-[#5A5A40] bg-white/10 px-3 py-1.5 rounded-full">High Yield</span>
                    </div>
                    
                    {config.outlines?.find((o: any) => o.question === q) && (
                      <div className="pl-8 border-l border-white/10 space-y-3">
                        <h4 className="text-[10px] font-black uppercase text-[#5A5A40] tracking-widest mb-4">Strategic Answer Outline</h4>
                        {config.outlines.find((o: any) => o.question === q).outline.map((step: string, sIdx: number) => (
                          <div key={sIdx} className="text-sm text-white/50 hover:text-white/80 transition-colors">
                            {step}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'vault' && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-serif font-bold text-[#141414]">Subjective Question <span className="text-[#5A5A40]">Vault</span></h2>
                <p className="text-[#14141460]">AI-engineered 20-mark questions with strategic analysis and 2026-27 trends.</p>
              </div>
              <button
                onClick={handleGenerateVaultQuestion}
                disabled={isGeneratingVault}
                className={`flex items-center gap-2 px-8 py-4 rounded-3xl font-bold transition-all shadow-xl ${
                  isGeneratingVault 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#141414] text-white hover:bg-[#5A5A40] hover:scale-105 active:scale-95'
                }`}
              >
                {isGeneratingVault ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Generate Forecast Question
              </button>
            </div>

            {isLoadingVault && vaultQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#5A5A40]" size={48} />
                <p className="text-[#14141460] font-black animate-pulse">Accessing Secure Vault...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {vaultQuestions
                  .filter(q => q.subject.toLowerCase().includes(SUBJECT_CONFIG[activeSubject].label.toLowerCase()))
                  .map((q) => (
                  <div key={q.id} className="bg-white rounded-[4rem] border border-[#14141405] shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl transition-all duration-500">
                    <div className="p-12 border-b border-[#14141405] bg-gray-50/50">
                      <div className="flex items-center justify-between mb-8">
                        <span className="px-4 py-1.5 bg-white rounded-full text-[10px] font-black uppercase text-[#5A5A40] border border-[#14141405] shadow-sm">
                          {q.topic}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-[#14141440]">Marks: {q.marks}</span>
                          <span className={`w-2 h-2 rounded-full ${q.priorityScore > 0.8 ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`} />
                        </div>
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-[#141414] leading-tight mb-6">{q.question}</h3>
                      {q.pastPaperReference && (
                        <p className="text-xs font-black text-[#5A5A40] flex items-center gap-2 bg-white/50 w-fit px-3 py-1.5 rounded-lg border border-[#14141405]">
                          <History size={14} /> Pattern Reference: {q.pastPaperReference}
                        </p>
                      )}
                    </div>

                    <div className="p-12 space-y-12 flex-1">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#14141440] flex items-center gap-2">
                          <Target size={14} className="text-[#5A5A40]" /> 2026/27 Case Study
                        </h4>
                        <div className="p-8 bg-[#5A5A4005] rounded-[2.5rem] border border-[#5A5A4010] text-[#14141480] text-sm leading-relaxed relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Microscope size={40} />
                          </div>
                          {q.caseStudy}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                            <Globe size={14} /> Global Analysis
                          </h4>
                          <p className="text-sm text-[#14141480] leading-relaxed italic border-l-2 border-emerald-100 pl-4">
                            {q.globalAnalysis}
                          </p>
                        </div>
                        <div className="space-y-5">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#5A5A40] flex items-center gap-2">
                            <Flag size={14} /> Pakistan Perspective
                          </h4>
                          <p className="text-sm text-[#14141480] leading-relaxed italic border-l-2 border-[#5A5A4020] pl-4">
                            {q.pakistanAnalysis}
                          </p>
                        </div>
                      </div>

                      {q.references && q.references.length > 0 && (
                        <div className="space-y-6 pt-10 border-t border-[#14141405]">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#14141440] flex items-center gap-2">
                            <BookText size={14} /> Potential References
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.references.map((ref, rIdx) => (
                              <div key={rIdx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-1 transition-all hover:bg-white hover:shadow-md">
                                <span className="text-[8px] font-black uppercase text-[#5A5A40] opacity-50">{ref.type}</span>
                                <p className="text-xs text-[#141414] font-bold">{ref.content}</p>
                                {ref.source && <span className="text-[9px] text-[#14141440] italic">Source: {ref.source}</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {vaultQuestions.filter(q => q.subject.toLowerCase().includes(SUBJECT_CONFIG[activeSubject].label.toLowerCase())).length === 0 && !isLoadingVault && (
                  <div className="lg:col-span-2 py-20 bg-white rounded-[4rem] border border-dashed border-[#14141410] flex flex-col items-center justify-center gap-6">
                    <div className="p-6 bg-gray-50 rounded-full text-gray-300">
                      <Database size={48} />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-serif font-bold text-[#141414]">Vault is Empty for {activeSubject}</h3>
                      <p className="text-sm text-[#14141440]">Click generate to trigger the AI forecaster.</p>
                    </div>
                    <button
                      onClick={handleGenerateVaultQuestion}
                      className="px-8 py-4 bg-[#141414] text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-[#5A5A40] transition-all"
                    >
                      <Plus size={18} /> Generate First Forecast Question
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ability' && (
          <motion.div
            key="ability"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {ABILITY_QUESTIONS.map((q, idx) => (
              <div key={idx} className="bg-white p-10 rounded-[2.5rem] border border-[#14141405] shadow-sm group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-[#5A5A4010] text-[#5A5A40] rounded-2xl group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
                    <q.icon size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#14141440]">{q.type} Pattern</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#141414] mb-8 leading-tight">Q: {q.question}</h3>
                <div className="bg-gray-50/80 rounded-3xl p-8 border border-gray-100">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-[#14141440] mb-4 flex items-center gap-2">
                    <BrainCircuit size={12} /> Master Solution
                  </h4>
                  <pre className="text-sm font-mono text-[#5A5A40] whitespace-pre-wrap leading-relaxed">
                    {q.solution}
                  </pre>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'trends' && (
          <motion.div
            key="trends"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-[#141414] text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                <Sparkles className="absolute top-[-10%] right-[-10%] w-60 h-60 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10">
                  <h2 className="text-3xl font-serif font-bold mb-8">High-Probability Topics (2026+)</h2>
                  <div className="flex flex-wrap gap-4">
                    {(activeSubject === 'GSA' 
                      ? ['Artificial Intelligence', 'Climate Change', 'Renewable Energy', 'Cyber Security', 'Human Diseases']
                      : activeSubject === 'ESSAY'
                      ? ['Governance of Pakistan', 'Global Boiling Resilience', 'Digital Democracy', 'IMF Dependency']
                      : ['Two-Nation Theory Context', 'Modern Kashmir Geopolitics', 'Economic Debt & IMF', 'Hybrid Governance', 'Urban Resilience']
                    ).map(topic => (
                      <span key={topic} className="px-5 py-2.5 bg-white/10 rounded-full text-xs font-bold border border-white/10 hover:bg-white/20 transition-all cursor-default">
                        {topic}
                      </span>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-white/5 rounded-2xl border border-white/5 border-l-4 border-l-[#5A5A40]">
                    <p className="text-sm text-white/60 leading-relaxed italic">
                      {activeSubject === 'GSA' 
                        ? '"Recent trends indicate a massive shift towards technical and AI-related governance questions in GSA papers."'
                        : '"Examiners are moving beyond historical rote learning, focusing on critical arguments regarding civil-military balance and economic sovereignty."'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-[#14141405] shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-8">
                  <Info className="text-[#5A5A40]" size={24} />
                  <h2 className="text-2xl font-serif font-bold text-[#141414]">Trend Analysis Report</h2>
                </div>
                <div className="space-y-6">
                  {(activeSubject === 'GSA' ? [
                    { label: 'Old Papers (1971-2015)', val: 'Strictly factual and static.', color: 'gray' },
                    { label: 'Modern Papers (2016-2025)', val: 'Conceptual + Analytical focus.', color: 'amber' },
                    { label: 'Upcoming Trend (2026+)', val: 'AI, Climate Geopolitics, Urban Resilience.', color: 'rose' }
                  ] : [
                    { label: 'Old Papers (1947-2010)', val: 'Ideology and War history focus.', color: 'gray' },
                    { label: 'Modern Papers (2011-2024)', val: 'Constitutional shifts & Terror dynamics.', color: 'amber' },
                    { label: 'Upcoming Trend (2025+)', val: 'Economic Diplomacy & Political Polarization.', color: 'rose' }
                  ]).map((item, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 bg-${item.color}-500`} />
                      <div>
                        <h4 className="text-xs font-black uppercase text-[#14141440] mb-1">{item.label}</h4>
                        <p className="font-bold text-[#141414]">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className={`p-12 rounded-[4rem] text-center relative overflow-hidden ${activeSubject === 'GSA' ? 'bg-[#5A5A40]' : 'bg-[#143D3D]'} text-white`}>
               <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                 <h2 className="text-4xl font-serif font-bold">
                   {activeSubject === 'GSA' ? '1971-2026 Past Paper Insights' : 'Post-1947 Historical Intelligence'}
                 </h2>
                 <p className="text-white/70 leading-relaxed">
                   {activeSubject === 'GSA' 
                     ? 'Analysis of 55 years of CSS papers reveals that GSA consists of 40% Biological Sciences, 30% Physical Sciences, 20% Environmental Science, and 10% IT.'
                     : 'Trend mapping of Pakistan Affairs papers shows a decisive move towards Foreign Policy (35%) and Economic Sovereignty (25%) over pure historical descriptive questions.'
                   }
                 </p>
                 <button className="px-8 py-4 bg-white text-[#5A5A40] rounded-2xl font-bold hover:bg-gray-100 transition-all shadow-xl">
                   Download Advanced Pattern Report
                 </button>
               </div>
               <div className="absolute left-[-5%] top-[-10%] opacity-10">
                 {activeSubject === 'GSA' ? <Globe size={300} /> : <Map size={300} />}
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'analysis' && (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <History className="text-[#5A5A40]" size={24} />
                  <h2 className="text-2xl font-serif font-bold text-[#141414]">Thematic Evolution ({activeSubject === 'GSA' ? '1971–2026' : 'Post-1947 Analysis'})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {currentAnalysis.map((item, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-[#14141405] shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={80} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#5A5A40] mb-2 block">{item.era}</span>
                      <h3 className="text-xl font-bold text-[#141414] mb-3">{item.theme}</h3>
                      <p className="text-sm text-[#14141460] leading-relaxed mb-6">{item.focus}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag, j) => (
                          <span key={j} className="text-[9px] font-bold text-[#14141440] bg-gray-100 px-2 py-1 rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="text-[#5A5A40]" size={24} />
                  <h2 className="text-2xl font-serif font-bold text-[#141414]">Frequency Heatmap</h2>
                </div>
                <div className="bg-white p-8 rounded-[3rem] border border-[#14141405] shadow-sm space-y-6">
                  {currentFrequent.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-[#141414]">{item.topic}</span>
                        <span className="text-[10px] font-black uppercase text-[#5A5A40]">{item.frequency}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full bg-[#5A5A40]"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <p className="text-xs text-[#14141440] italic leading-relaxed">
                      *Percentages represent the probability of topic appearance based on clustering of 55 years of FPSC data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#141414] text-white p-12 rounded-[4rem] flex flex-col md:flex-row items-center gap-10">
              <div className="p-6 bg-white/10 rounded-[2.5rem]">
                <Sparkles size={48} className="text-[#5A5A40]" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-serif font-bold">2027 Pattern Prediction</h3>
                <p className="text-white/60 leading-relaxed max-w-2xl">
                  Our algorithm identifies a 92% correlation between global climate policy shifts and CSS Environmental Science questions. Expect a heavy focus on "Urban Heat Islands" and "Carbon Credits" in the next GSA paper.
                </p>
              </div>
              <button className="px-8 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold whitespace-nowrap hover:bg-[#6A6A50] transition-all">
                Access Predictive Archive
              </button>
            </div>
          </motion.div>
        )}

        {activeTab === 'mock' && (
          <motion.div
            key="mock"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {!mockPaper ? (
              <div className="bg-white p-20 rounded-[3rem] border border-[#14141405] shadow-sm text-center space-y-6">
                 <div className="w-20 h-20 bg-[#5A5A4010] text-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={40} />
                 </div>
                 <h2 className="text-3xl font-serif font-bold text-[#141414]">Elite 100-Mark GSA Mock</h2>
                 <p className="text-[#14141460] max-w-xl mx-auto">
                    Generate a full practice paper following the 2026-27 CSS pattern. Includes 20 MCQs, 40 Marks General Science, and 40 Marks Analytical Ability questions.
                 </p>
                 <button 
                   onClick={handleGeneratePaper}
                   disabled={isGeneratingPaper}
                   className="px-10 py-5 bg-[#141414] text-white rounded-[2rem] font-bold shadow-2xl flex items-center gap-3 mx-auto hover:bg-gray-800 transition-all disabled:opacity-50"
                 >
                   {isGeneratingPaper ? (
                     <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating Pattern...
                     </>
                   ) : (
                     <>
                        <Sparkles size={20} />
                        Generate Full Mock Paper
                     </>
                   )}
                 </button>
              </div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-serif font-bold">Mock Exam: General Science & Ability (100 Marks)</h2>
                  <button 
                    onClick={() => setMockPaper(null)}
                    className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#141414] transition-colors"
                  >
                    Reset & Regenerate
                  </button>
                </div>

                {/* Section A: MCQs */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#141414] text-white rounded-lg text-xs font-black">20 MARKS</span>
                    <h3 className="text-xl font-serif font-bold">Section-A: Multiple Choice Questions</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockPaper.mcqs.map((q, i) => (
                      <div key={i} className="p-6 bg-white rounded-3xl border border-[#14141405] shadow-sm">
                        <p className="text-sm font-bold text-[#141414] mb-4">Q{i+1}: {q.question}</p>
                        <div className="space-y-2">
                           {q.options.map((opt, j) => (
                             <div key={j} className={`text-xs p-2 rounded-lg border ${opt === q.answer ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                               {opt}
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section B: Science */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#141414] text-white rounded-lg text-xs font-black">40 MARKS</span>
                    <h3 className="text-xl font-serif font-bold">Section-B: General Science (Subjective)</h3>
                  </div>
                  <div className="space-y-4">
                    {mockPaper.scienceQuestions.map((q, i) => (
                      <div key={i} className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
                        <p className="text-lg font-serif font-bold text-blue-900 mb-6">Question {i+1}: {q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <h4 className="text-[10px] font-black uppercase text-blue-800/40">Global Perspective</h4>
                              <p className="text-sm text-blue-900/70 italic leading-relaxed">{q.globalAnalysis}</p>
                           </div>
                           <div className="space-y-2">
                              <h4 className="text-[10px] font-black uppercase text-blue-800/40">Pakistan Perspective</h4>
                              <p className="text-sm text-blue-900/70 italic leading-relaxed">{q.pakistanAnalysis}</p>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section C: Ability */}
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                    <span className="p-2 bg-[#141414] text-white rounded-lg text-xs font-black">40 MARKS</span>
                    <h3 className="text-xl font-serif font-bold">Section-C: Ability (Analytical & Quantitative)</h3>
                  </div>
                  <div className="space-y-4">
                    {mockPaper.abilityQuestions.map((q, i) => (
                      <div key={i} className="p-8 bg-amber-50/50 rounded-[2.5rem] border border-amber-100">
                        <p className="text-lg font-serif font-bold text-amber-900 mb-6">Question {i+1}: {q.question}</p>
                        <div className="p-6 bg-white rounded-3xl border border-amber-100/50">
                           <h4 className="text-[10px] font-black uppercase text-amber-800/40 mb-3">Master Solution Logic</h4>
                           <div className="prose prose-sm prose-amber max-w-none">
                              <Markdown>{q.caseStudy}</Markdown>
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
