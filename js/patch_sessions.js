// This script patches all remaining empty sessions in data.js
// Run with: node patch_sessions.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'data.js');
let content = fs.readFileSync(dataPath, 'utf8');

// Helper to build 5 sessions of 10 MCQs for a subject
function buildSessions(questions50) {
    const sessions = [];
    for (let s = 0; s < 5; s++) {
        const qs = questions50.slice(s * 10, s * 10 + 10);
        sessions.push({ id: s + 1, name: `Session ${s + 1}`, questions: qs });
    }
    return JSON.stringify(sessions, null, 16)
        .replace(/^\[/, '[')
        .replace(/\]$/, ']');
}

// Map of subject id -> 50 questions array
const subjectData = {};
