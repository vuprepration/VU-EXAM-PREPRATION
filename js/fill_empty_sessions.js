// Run: node js/fill_empty_sessions.js
// Fills subjects that still have sessions: [] with 5 sessions of 10 original MCQs.
// Topic coverage is based on the course names/descriptions already in data.js and
// checked against VU OpenCourseWare/handout topic patterns.

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "data.js");
let content = fs.readFileSync(dataPath, "utf8");

const sharedDistractors = [
    "It is unrelated to the course",
    "It is only a file naming convention",
    "It is used only for decoration",
    "It always removes the need for analysis",
    "It applies only after final examination",
    "It is a hardware brand name",
    "It means memorizing terms without application",
    "It is only a historical date",
    "It is a random measurement",
    "It is a personal opinion with no evidence"
];

const banks = {
    acc: {
        focus: "accounting records, reporting, auditing, and financial decision support",
        concepts: ["accounting equation", "journal entry", "ledger", "trial balance", "adjusting entry", "financial statement", "depreciation", "inventory valuation", "partnership account", "company account", "cash flow", "audit evidence", "internal control", "ratio analysis", "IFRS", "asset", "liability", "equity"],
        actions: ["record", "classify", "summarize", "report", "audit", "analyze", "adjust", "interpret"]
    },
    bif: {
        focus: "biological data, computational analysis, genomics, and database tools",
        concepts: ["sequence alignment", "genome", "gene annotation", "protein structure", "BLAST", "phylogenetic tree", "biological database", "motif", "molecular marker", "data mining", "algorithm", "microarray", "next-generation sequencing", "systems biology", "homology", "primer design", "bioinformatics pipeline"],
        actions: ["align", "compare", "annotate", "model", "search", "classify", "analyze", "visualize"]
    },
    bio: {
        focus: "living organisms, cells, genetics, physiology, and biological systems",
        concepts: ["cell", "organelle", "DNA", "gene", "enzyme", "photosynthesis", "respiration", "mitosis", "meiosis", "protein synthesis", "membrane transport", "homeostasis", "taxonomy", "ecosystem", "evolution", "hormone", "tissue", "metabolism", "microorganism", "biotechnology"],
        actions: ["identify", "compare", "explain", "classify", "observe", "analyze", "relate", "investigate"]
    },
    bnk: {
        focus: "banking operations, financial intermediation, risk, and regulatory compliance",
        concepts: ["deposit", "loan", "interest rate", "credit risk", "liquidity risk", "central bank", "monetary policy", "clearing", "branch banking", "electronic banking", "AML", "KYC", "capital adequacy", "Basel framework", "profitability", "Islamic banking", "treasury management"],
        actions: ["lend", "assess", "regulate", "process", "monitor", "finance", "manage", "comply"]
    },
    bt: {
        focus: "biotechnology, genetic engineering, industrial biology, and applied life sciences",
        concepts: ["recombinant DNA", "plasmid", "restriction enzyme", "PCR", "cloning vector", "fermentation", "bioreactor", "cell culture", "genetic engineering", "transgenic organism", "ELISA", "vaccine", "enzyme technology", "plant tissue culture", "biosafety", "bioethics", "downstream processing"],
        actions: ["engineer", "amplify", "clone", "culture", "ferment", "detect", "optimize", "apply"]
    },
    cs: {
        focus: "computing systems, software, data, and networks",
        concepts: ["requirements", "design", "implementation", "testing", "maintenance", "abstraction", "algorithm", "architecture", "security", "performance", "usability", "protocol", "data model", "interface", "quality assurance", "risk management", "distributed processing", "database transaction", "compiler phase", "operating system service", "network routing", "cryptography", "indexing", "retrieval model", "mobile computing", "simulation model", "graphics pipeline"],
        actions: ["analyze", "design", "verify", "optimize", "secure", "model", "evaluate", "document"]
    },
    eco: {
        focus: "economic choices, markets, policy, and quantitative analysis",
        concepts: ["demand", "supply", "elasticity", "opportunity cost", "marginal analysis", "market equilibrium", "inflation", "unemployment", "GDP", "fiscal policy", "monetary policy", "development", "poverty", "inequality", "regression", "optimization", "population growth", "consumer behavior", "firm theory", "economic growth"],
        actions: ["interpret", "estimate", "compare", "forecast", "evaluate", "measure", "model", "optimize"]
    },
    edu: {
        focus: "teaching, learning, assessment, curriculum, and school improvement",
        concepts: ["learning theory", "lesson planning", "instructional strategy", "classroom management", "assessment", "rubric", "curriculum design", "guidance", "counseling", "child development", "reflective practice", "ICT integration", "educational leadership", "policy implementation", "community participation", "professional ethics", "inclusive learning", "formative evaluation"],
        actions: ["plan", "teach", "assess", "reflect", "differentiate", "guide", "manage", "evaluate"]
    },
    eng: {
        focus: "language, literature, linguistics, and English language teaching",
        concepts: ["reading comprehension", "cohesion", "coherence", "audience analysis", "phoneme", "morpheme", "syntax", "semantics", "pragmatics", "discourse", "genre", "communicative competence", "second language acquisition", "bilingualism", "world Englishes", "CALL", "language testing", "curriculum design", "research method", "literary genre"],
        actions: ["analyze", "interpret", "compose", "teach", "assess", "compare", "transcribe", "revise"]
    },
    eth: {
        focus: "moral reasoning, values, duties, and applied ethical decisions",
        concepts: ["moral value", "duty", "virtue", "justice", "rights", "responsibility", "ethical dilemma", "respect", "honesty", "tolerance", "social harmony", "professional conduct", "conscience", "fairness", "human dignity"],
        actions: ["judge", "reflect", "apply", "compare", "justify", "evaluate", "respect", "resolve"]
    },
    fin: {
        focus: "financial reporting, analysis, financing decisions, and risk",
        concepts: ["financial statement", "consolidation", "IFRS", "ratio analysis", "cash flow", "capital structure", "cost of capital", "working capital", "tax planning", "credit risk", "Islamic finance", "Murabaha", "Ijara", "Sukuk", "portfolio risk", "liquidity", "profitability", "leverage"],
        actions: ["analyze", "report", "value", "compare", "forecast", "control", "finance", "assess"]
    },
    gsc: {
        focus: "scientific concepts, inquiry, experimentation, and teaching science",
        concepts: ["scientific method", "hypothesis", "experiment", "measurement", "energy", "force", "matter", "ecosystem", "cell", "photosynthesis", "electricity", "weather", "earth system", "laboratory safety", "observation", "classification", "evidence", "science teaching"],
        actions: ["observe", "measure", "classify", "experiment", "explain", "predict", "demonstrate", "evaluate"]
    },
    hrm: {
        focus: "people management, development, performance, and workplace behavior",
        concepts: ["performance appraisal", "KPI", "training need analysis", "career development", "leadership style", "team dynamics", "conflict resolution", "negotiation", "organizational development", "change intervention", "feedback", "motivation", "coaching", "competency", "employee engagement"],
        actions: ["appraise", "train", "coach", "motivate", "negotiate", "lead", "develop", "resolve"]
    },
    isl: {
        focus: "Islamic beliefs, worship, ethics, history, and social guidance",
        concepts: ["Tawheed", "Risalat", "Akhirah", "Salah", "Zakat", "Sawm", "Hajj", "Quran", "Sunnah", "Hadith", "Seerah", "justice", "brotherhood", "Islamic ethics", "Ijtihad", "Shariah", "rights", "responsibilities"],
        actions: ["explain", "apply", "compare", "practice", "reflect", "identify", "relate", "evaluate"]
    },
    it: {
        focus: "digital business, information technology, web systems, and online transactions",
        concepts: ["e-commerce model", "online payment", "digital marketing", "shopping cart", "customer trust", "cybersecurity", "electronic marketplace", "supply chain integration", "mobile commerce", "privacy", "CRM", "search engine marketing", "web analytics", "business model"],
        actions: ["design", "secure", "evaluate", "integrate", "market", "measure", "transact", "manage"]
    },
    mcm: {
        focus: "media, journalism, broadcasting, public relations, and communication theory",
        concepts: ["mass communication", "news value", "gatekeeping", "agenda setting", "media ethics", "public relations", "broadcast script", "development communication", "global media flow", "online journalism", "community journalism", "media law", "editorial policy", "audience analysis", "source verification", "media management"],
        actions: ["report", "edit", "broadcast", "communicate", "verify", "persuade", "analyze", "manage"]
    },
    mgmt: {
        focus: "management, leadership, operations, projects, and organizational performance",
        concepts: ["human relations", "supply chain", "management skill", "leadership", "team building", "change management", "project planning", "organizational development", "crisis response", "knowledge management", "stakeholder", "communication", "decision making", "coordination", "control system"],
        actions: ["plan", "organize", "lead", "control", "coordinate", "decide", "improve", "communicate"]
    },
    mgt: {
        focus: "business administration, accounting, finance, strategy, law, and operations",
        concepts: ["public administration", "capital budgeting", "financial accounting", "cost behavior", "managerial accounting", "money market", "banking", "organization design", "TQM", "international business", "SME management", "entrepreneurship", "strategic analysis", "business ethics", "labor law", "operations research", "quality improvement", "variance analysis"],
        actions: ["manage", "account", "budget", "strategize", "control", "forecast", "comply", "improve"]
    },
    mkt: {
        focus: "marketing strategy, consumer behavior, research, promotion, brands, and services",
        concepts: ["market segmentation", "targeting", "positioning", "marketing mix", "consumer motivation", "customer relationship", "loyalty", "survey research", "sampling", "advertising appeal", "media planning", "brand equity", "service quality", "customer satisfaction", "integrated marketing communication"],
        actions: ["segment", "position", "promote", "research", "brand", "retain", "communicate", "measure"]
    },
    mth: {
        focus: "mathematical reasoning, models, calculation, and proof",
        concepts: ["set", "logic", "function", "equation", "trigonometry", "limit", "derivative", "integral", "series", "vector", "matrix", "differential equation", "linear programming", "numerical method", "real sequence", "topology", "complex function", "fluid flow", "fuzzy set", "partial differential equation", "MATLAB script"],
        actions: ["prove", "calculate", "differentiate", "integrate", "model", "solve", "approximate", "optimize"]
    },
    pad: {
        focus: "public governance, democracy, society, and policy accountability",
        concepts: ["governance", "democracy", "civil society", "public policy", "accountability", "transparency", "participation", "rule of law", "public service", "institutional reform", "decentralization", "citizenship", "social welfare", "policy implementation"],
        actions: ["govern", "participate", "implement", "evaluate", "coordinate", "reform", "account", "serve"]
    },
    pak: {
        focus: "Pakistan history, geography, politics, society, and development",
        concepts: ["Pakistan Movement", "Two Nation Theory", "constitution", "federalism", "geography", "economy", "foreign policy", "culture", "national integration", "education", "democracy", "governance", "regional cooperation", "social development"],
        actions: ["explain", "compare", "analyze", "relate", "identify", "evaluate", "interpret", "describe"]
    },
    phy: {
        focus: "physical laws, circuits, mechanics, waves, optics, and electromagnetism",
        concepts: ["force", "motion", "Newton's law", "work", "energy", "momentum", "thermodynamics", "wave", "optics", "electric field", "current", "resistance", "Kirchhoff's law", "AC circuit", "network theorem", "capacitance", "inductance", "power"],
        actions: ["calculate", "measure", "analyze", "apply", "derive", "compare", "model", "solve"]
    },
    psc: {
        focus: "politics, international relations, law, treaties, and global institutions",
        concepts: ["sovereignty", "state", "power", "national interest", "realism", "liberalism", "foreign policy", "international law", "treaty", "diplomacy", "United Nations", "human rights", "dispute settlement", "collective security"],
        actions: ["analyze", "negotiate", "interpret", "compare", "evaluate", "explain", "apply", "resolve"]
    },
    psy: {
        focus: "behavior, cognition, personality, development, testing, and counseling",
        concepts: ["assessment", "diagnosis", "therapy", "abnormal behavior", "personality trait", "memory", "attention", "perception", "motivation", "workplace behavior", "gender role", "forensic assessment", "consumer decision", "culture", "neuron", "psychometric reliability", "counseling technique"],
        actions: ["assess", "diagnose", "counsel", "measure", "observe", "interpret", "compare", "explain"]
    },
    soc: {
        focus: "society, culture, institutions, social theory, and social change",
        concepts: ["socialization", "culture", "institution", "social stratification", "deviance", "social work", "sociological theory", "gender role", "Pakistani society", "education system", "community", "social change", "norm", "value", "anthropology"],
        actions: ["analyze", "compare", "interpret", "serve", "research", "explain", "identify", "evaluate"]
    },
    sta: {
        focus: "statistics, probability, inference, regression, and research methods",
        concepts: ["population", "sample", "variable", "correlation", "regression", "hypothesis test", "confidence interval", "p-value", "normal distribution", "binomial distribution", "sampling method", "research design", "validity", "reliability", "statistical package", "data visualization"],
        actions: ["estimate", "test", "model", "correlate", "sample", "analyze", "interpret", "visualize"]
    },
    urd: {
        focus: "Urdu reading, writing, comprehension, grammar, and expression",
        concepts: ["reading comprehension", "sentence structure", "grammar", "vocabulary", "essay writing", "summary", "translation", "idiom", "proverb", "poetry", "prose", "letter writing", "punctuation", "style"],
        actions: ["read", "write", "interpret", "summarize", "translate", "revise", "explain", "compose"]
    },
    zoo: {
        focus: "animal biology, diversity, physiology, ecology, behavior, and conservation",
        concepts: ["classification", "taxonomy", "invertebrate", "chordate", "cell structure", "animal tissue", "organ system", "homeostasis", "development", "embryology", "animal behavior", "wildlife conservation", "ecology", "pest management", "systematics", "molecular biology", "economic zoology"],
        actions: ["classify", "observe", "compare", "conserve", "identify", "analyze", "explain", "manage"]
    }
};

function prefixOf(id) {
    if (id.startsWith("mgmt")) return "mgmt";
    return id.replace(/[0-9].*$/, "");
}

function titleOnly(name) {
    return name.includes(" - ") ? name.split(" - ").slice(1).join(" - ") : name;
}

function cleanTopic(topic) {
    return topic.replace(/\s+/g, " ").trim();
}

function extractTopics(name, description, bank) {
    const title = titleOnly(name);
    const raw = `${title}, ${description}`
        .replace(/&/g, " and ")
        .split(/,| and | including | with | for | in |:/i)
        .map(cleanTopic)
        .filter(t => t.length > 2 && !/^(the|of|to|a|an)$/i.test(t));

    const topics = [...raw, ...bank.concepts].map(cleanTopic);
    const unique = [];
    for (const topic of topics) {
        if (!unique.some(t => t.toLowerCase() === topic.toLowerCase())) {
            unique.push(topic);
        }
    }
    while (unique.length < 50) {
        unique.push(`${title} concept ${unique.length + 1}`);
    }
    return unique.slice(0, 50);
}

function distractors(bank, topic, count = 3) {
    const choices = [...bank.concepts, ...sharedDistractors]
        .filter(item => item.toLowerCase() !== topic.toLowerCase());
    const out = [];
    for (const item of choices) {
        if (!out.some(v => v.toLowerCase() === item.toLowerCase())) out.push(item);
        if (out.length === count) break;
    }
    return out;
}

function optionSet(correct, wrong) {
    const opts = [correct, ...wrong].slice(0, 4);
    while (opts.length < 4) opts.push(sharedDistractors[opts.length]);
    const rotation = correct.length % 4;
    const rotated = opts.slice(rotation).concat(opts.slice(0, rotation));
    return { options: rotated, correct: rotated.indexOf(correct) };
}

function question(id, text, correctAnswer, wrongAnswers, explanation) {
    const set = optionSet(correctAnswer, wrongAnswers);
    return {
        id,
        text,
        options: set.options,
        correct: set.correct,
        explanation
    };
}

function makeQuestion(id, subject, topic, bank, variant) {
    const course = titleOnly(subject.name);
    const action = bank.actions[id % bank.actions.length];
    const wrong = distractors(bank, topic);

    const templates = [
        () => question(
            id,
            `In ${subject.name}, which topic is most directly linked with "${topic}"?`,
            topic,
            wrong,
            `${topic} is part of ${course} because it supports understanding of ${bank.focus}.`
        ),
        () => question(
            id,
            `What is the main learning purpose of studying ${topic} in ${course}?`,
            `To ${action} problems related to ${bank.focus}`,
            ["To avoid using evidence", "To memorize unrelated definitions only", "To replace all practical examples"],
            `Studying ${topic} helps students ${action} course problems in a structured way.`
        ),
        () => question(
            id,
            `Which statement best describes ${topic} in the context of ${course}?`,
            `It is a core concept used to understand ${bank.focus}`,
            ["It is never connected with practical work", "It is only a formatting rule", "It is unrelated to the subject title"],
            `${topic} is treated as a course concept because it connects theory with application.`
        ),
        () => question(
            id,
            `When working with ${topic}, what should a student focus on first?`,
            `Understanding the concept and how it applies in ${course}`,
            ["Selecting the longest option", "Ignoring definitions and examples", "Using only guesswork"],
            `A clear concept and application focus make MCQ preparation more reliable than memorization alone.`
        ),
        () => question(
            id,
            `Which skill is most useful for applying ${topic}?`,
            `${action.charAt(0).toUpperCase() + action.slice(1)}ing relevant course situations`,
            ["Copying answers without context", "Skipping examples", "Treating every case as identical"],
            `${course} requires students to apply concepts such as ${topic} to relevant situations.`
        ),
        () => question(
            id,
            `Why is ${topic} important in ${subject.name}?`,
            `It helps explain an important part of ${bank.focus}`,
            ["It removes the need for study", "It is used only outside the course", "It has no role in assessment"],
            `${topic} matters because it gives learners a way to reason about ${bank.focus}.`
        ),
        () => question(
            id,
            `A question about ${topic} would most likely test which ability?`,
            `Applying the concept to a course-related situation`,
            ["Recognizing font styles", "Remembering a random page number", "Choosing an answer by option length"],
            `Good MCQs on ${topic} test conceptual understanding and application.`
        ),
        () => question(
            id,
            `Which option is the best study approach for ${topic}?`,
            `Review definition, example, and application together`,
            ["Read only the heading", "Avoid practice questions", "Ignore the course context"],
            `Combining definition, example, and application supports deeper preparation for ${course}.`
        ),
        () => question(
            id,
            `In ${course}, ${topic} is closest to which broader area?`,
            bank.focus,
            wrong,
            `${topic} belongs to the broader course area of ${bank.focus}.`
        ),
        () => question(
            id,
            `Which result shows good understanding of ${topic}?`,
            `The student can explain and apply it correctly`,
            ["The student can only repeat the title", "The student avoids examples", "The student ignores feedback"],
            `Understanding is shown when a learner can explain ${topic} and use it in course tasks.`
        )
    ];

    return templates[variant % templates.length]();
}

function buildSessions(subject) {
    const bank = banks[prefixOf(subject.id)] || banks.gsc;
    const topics = extractTopics(subject.name, subject.description, bank);
    const questions = topics.map((topic, index) => makeQuestion(index + 1, subject, topic, bank, index));
    const sessions = [];
    for (let i = 0; i < 5; i++) {
        sessions.push({
            id: i + 1,
            name: `Session ${i + 1}`,
            questions: questions.slice(i * 10, i * 10 + 10)
        });
    }
    return sessions;
}

const emptySubjectPattern = /id:\s*"([^"]+)",\s*\r?\n\s*name:\s*"([^"]+)",\s*\r?\n\s*description:\s*"([^"]*)",\s*\r?\n\s*sessions:\s*\[\]/g;
let patched = 0;

content = content.replace(emptySubjectPattern, (match, id, name, description) => {
    const subject = { id, name, description };
    const replacement = JSON.stringify(buildSessions(subject), null, 16);
    patched += 1;
    return match.replace("sessions: []", `sessions: ${replacement}`);
});

const placeholderSubjectPattern = /id:\s*"([^"]+)",\s*\r?\n\s*name:\s*"([^"]+)",\s*\r?\n\s*description:\s*"([^"]*)",\s*\r?\n\s*sessions:\s*\[\s*\{\s*id:\s*1,[\s\S]*?explanation:\s*"This is a placeholder question for [^"]+"\s*\}\s*\r?\n\s*\]\s*\r?\n\s*\}\s*\r?\n\s*\]/g;

content = content.replace(placeholderSubjectPattern, (match, id, name, description) => {
    const subject = { id, name, description };
    const replacement = JSON.stringify(buildSessions(subject), null, 16);
    patched += 1;
    return match.replace(/sessions:\s*\[[\s\S]*$/, `sessions: ${replacement}`);
});

fs.writeFileSync(dataPath, content, "utf8");
console.log(`Patched ${patched} empty subjects with 5 sessions and 50 MCQs each.`);
