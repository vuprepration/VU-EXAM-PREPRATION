# MCQ Learning Platform

A professional, responsive learning platform for students to take MCQ tests and get detailed results with answer reviews.

## Features

- **Subject Selection**: Browse and select from multiple subjects (Biology, Chemistry, Physics, etc.)
- **Session Management**: Each subject has 5 sessions with 10 MCQs per session
- **Interactive Test Interface**: 
  - Real-time progress tracking
  - Question tracker showing answered/unanswered questions
  - Navigation between questions
  - Progress bar
- **Results Dashboard**:
  - Score display with percentage
  - Performance feedback
  - Complete answer review with explanations
  - Ability to retake tests

## Project Structure

```
project/
├── index.html              # Main HTML file with all views
├── css/
│   └── styles.css         # Complete styling with design tokens
├── js/
│   ├── app.js             # Main application logic and state management
│   ├── ui.js              # UI rendering functions
│   └── data.js            # Subject and MCQ data
└── README.md              # This file
```

## Getting Started

1. **Open the website**: Open `index.html` in a web browser
2. **Select a Subject**: Click on any subject card to view available sessions
3. **Start a Session**: Click on a session to begin the MCQ test
4. **Answer Questions**: 
   - Click on an option to select it
   - Use Previous/Next buttons to navigate between questions
   - Use the question tracker to jump to specific questions
5. **Submit Test**: Click "Submit Test" on the last question to view results
6. **Review Results**: See your score, percentage, and detailed answer review with explanations
7. **Retake or Return**: Use the action buttons to retake the test or go back to subjects

## MCQ Data

The platform includes comprehensive MCQ data for five subjects:

### Biology
- 50 questions total
- 5 sessions of 10 questions each
- Topics: Cells, Organelles, Photosynthesis, Blood, Hormones, Genetics, Digestion, Muscles, Vitamins

### Chemistry  
- 50 questions total
- 5 sessions of 10 questions each
- Topics: Elements, Atomic structure, pH, Solutions, Chemical formulas, Isotopes, Reactions, Bonds

### Physics
- 50 questions total
- 5 sessions of 10 questions each
- Topics: Motion, Forces, Energy, Mechanics

### ENG201 - Business and Technical English
- **50 questions total** generated from handout content
- 5 sessions of 10 questions each
- Topics covered:
  - Introduction to Business & Technical Communication
  - Oral Communication and Presentations
  - Reader-Centered Writing
  - Audience Analysis
  - The Seven C's of Effective Communication
  - Planning and Composing Business Messages
  - Memos, Letters, Reports, and Proposals
  - Writing Direct Requests, Good-News, Bad-News, and Persuasive Messages
  - Visual Aids and Technical Writing
  - Listening, Interviewing, and Meeting Management
  - Language Review and Mechanics

### MGT503 - Principles of Management
- **50 questions total** generated from handout content
- 5 sessions of 10 questions each
- Topics covered:
  - Historical Overview of Management
  - Management in Ancient Civilizations (Egyptian Pyramids, Great Wall of China)
  - Adam Smith and Division of Labor
  - The Wealth of Nations and Productivity
  - Industrial Revolution and Management Theory
  - Scientific Management and Administrative Theory
  - Professional Management Era (1950+)
  - What is an Organization
  - POLCA Framework (Planning, Organizing, Leading, Controlling, Assurance)
  - Efficiency vs. Effectiveness
  - Modern Management Challenges

## How to Add Your MCQs

To add your own MCQs from handouts:

1. Open `js/data.js`
2. Follow the structure in the `subjectsData` object:

```javascript
{
    id: "subject-id",
    name: "Subject Name",
    description: "Brief description",
    sessions: [
        {
            id: 1,
            name: "Session 1",
            questions: [
                {
                    id: 1,
                    text: "Question text?",
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correct: 1,  // Index of correct answer (0-3)
                    explanation: "Explanation of why this is correct"
                },
                // ... more questions
            ]
        },
        // ... more sessions
    ]
}
```

3. Add as many subjects as needed - the platform supports unlimited subjects and sessions

## Customization

### Colors
Edit the design tokens in `css/styles.css` (`:root` section) to change:
- Primary color: `--primary: #2563eb`
- Accent color: `--accent: #10b981`
- Danger color: `--danger: #ef4444`
- Backgrounds and text colors

### Typography
- Font family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'`
- Font sizes are defined as CSS variables for easy customization

### Styling
All styling uses semantic HTML and is responsive for mobile, tablet, and desktop devices.

## Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Notes

- No external dependencies - pure vanilla HTML, CSS, and JavaScript
- Lightweight and fast loading
- All data stored in JSON format for easy management
- No database required

## Future Enhancements

Potential features to add:
- User accounts and progress tracking
- Timer for tests
- Difficulty levels
- Topic-based filtering
- Performance analytics
- Question bank randomization
- Mobile app version
