// Main Application State and Logic

const app = {
    // Current state
    currentView: 'home',
    currentSubject: null,
    currentSession: null,
    currentQuestionIndex: 0,
    userAnswers: {},  // Map of questionId -> selectedOptionIndex
    sessionStarted: false,
    testSubmitted: false,
    searchQuery: '',
    
    // Initialize the app
    init() {
        console.log("[v0] App initializing");
        themeManager.init();
        this.render();
        this.attachEventListeners();
    },
    
    // Show home view
    goHome() {
        console.log("[v0] Going to home view");
        this.currentView = 'home';
        this.currentSubject = null;
        this.currentSession = null;
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.sessionStarted = false;
        this.testSubmitted = false;
        this.searchQuery = '';
        this.render();
    },
    
    // Search subjects by query
    searchSubjects() {
        const input = document.getElementById('subject-search-input');
        if (!input) return;
        this.searchQuery = input.value.trim();
        console.log("[v0] Searching subjects:", this.searchQuery);
        this.render();
    },

    // Add a new subject by name
    addSubject() {
        const input = document.getElementById('new-subject-name');
        if (!input) return;
        const name = input.value.trim();
        if (!name) {
            alert('Please enter a subject name before adding.');
            return;
        }

        const baseId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        let id = baseId || `subject-${Date.now()}`;
        let counter = 1;
        while (getSubject(id)) {
            counter += 1;
            id = `${baseId}-${counter}`;
        }

        const newSubject = {
            id,
            name,
            description: `User-added subject: ${name}`,
            sessions: []
        };

        subjectsData.subjects.push(newSubject);
        input.value = '';
        this.searchQuery = '';
        this.render();
        console.log('[v0] Added new subject:', newSubject);
    },

    // Remove a subject by ID
    removeSubject(subjectId) {
        const subject = getSubject(subjectId);
        if (!subject) return;

        const confirmed = window.confirm(`Remove subject "${subject.name}"? This cannot be undone.`);
        if (!confirmed) return;

        subjectsData.subjects = subjectsData.subjects.filter(s => s.id !== subjectId);
        if (this.currentSubject?.id === subjectId) {
            this.goHome();
            return;
        }

        this.render();
        console.log('[v0] Removed subject:', subjectId);
    },
    
    // Select a subject
    selectSubject(subjectId) {
        console.log("[v0] Subject selected:", subjectId);
        this.currentSubject = getSubject(subjectId);
        this.currentView = 'sessions';
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.sessionStarted = false;
        this.testSubmitted = false;
        this.render();
    },
    
    // Start a session
    startSession(sessionId) {
        console.log("[v0] Session started:", sessionId);
        this.currentSession = getSession(this.currentSubject.id, sessionId);
        this.currentView = 'test';
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.sessionStarted = true;
        this.testSubmitted = false;
        this.render();
    },
    
    // Select an answer
    selectAnswer(optionIndex) {
        if (!this.sessionStarted || this.testSubmitted) return;
        
        const currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
        this.userAnswers[currentQuestion.id] = optionIndex;
        console.log("[v0] Answer selected for question", currentQuestion.id, ":", optionIndex);
        
        // Highlight the selected option
        this.updateQuestionDisplay();
    },
    
    // Move to next question
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentSession.questions.length - 1) {
            this.currentQuestionIndex++;
            console.log("[v0] Moving to next question:", this.currentQuestionIndex + 1);
            this.updateQuestionDisplay();
        }
    },
    
    // Move to previous question
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            console.log("[v0] Moving to previous question:", this.currentQuestionIndex + 1);
            this.updateQuestionDisplay();
        }
    },
    
    // Jump to specific question
    jumpToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.currentSession.questions.length) {
            this.currentQuestionIndex = questionIndex;
            console.log("[v0] Jumped to question:", questionIndex + 1);
            this.updateQuestionDisplay();
        }
    },
    
    // Update question display
    updateQuestionDisplay() {
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const questionCard = document.querySelector('.question-card');
        const currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
        
        // Update question text
        questionText.textContent = currentQuestion.text;
        if (questionCard) {
            questionCard.setAttribute('data-question-num', `Question ${this.currentQuestionIndex + 1}`);
        }
        
        // Clear and populate options
        optionsContainer.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            const isSelected = this.userAnswers[currentQuestion.id] === index;
            optionDiv.className = 'option';
            optionDiv.setAttribute('role', 'button');
            optionDiv.setAttribute('tabindex', '0');
            optionDiv.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
            
            if (isSelected) optionDiv.classList.add('selected');
            
            const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
            const letter = letters[index] || String(index + 1);

            optionDiv.innerHTML = `
                <input type="radio" name="option" id="option-${index}" value="${index}" ${isSelected ? 'checked' : ''} style="display:none;">
                <span class="option-letter">${letter}</span>
                <label for="option-${index}" class="option-text">${option}</label>
            `;
            
            optionDiv.addEventListener('click', () => {
                // Remove previous selection
                document.querySelectorAll('.option').forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-pressed', 'false');
                });
                optionDiv.classList.add('selected');
                optionDiv.setAttribute('aria-pressed', 'true');
                optionDiv.querySelector('input').checked = true;
                this.selectAnswer(index);
            });

            optionDiv.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    optionDiv.click();
                }
            });
            
            optionsContainer.appendChild(optionDiv);
        });
        
        // Update progress
        this.updateProgress();
        
        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const isLastQuestion = this.currentQuestionIndex === this.currentSession.questions.length - 1;
        nextBtn.style.display = isLastQuestion ? 'none' : 'block';
        submitBtn.style.display = isLastQuestion ? 'block' : 'none';
        
        // Scroll to top
        window.scrollTo(0, 0);
    },
    
    // Update progress bar and tracker
    updateProgress() {
        const currentQuestion = this.currentQuestionIndex + 1;
        const totalQuestions = this.currentSession.questions.length;
        
        // Update question counter
        document.getElementById('question-counter').textContent = `Question ${currentQuestion} of ${totalQuestions}`;
        const answeredCounter = document.getElementById('answered-counter');
        if (answeredCounter) {
            const answeredCount = this.currentSession.questions.filter(question => this.userAnswers[question.id] !== undefined).length;
            answeredCounter.textContent = `${answeredCount} answered`;
        }
        
        // Update progress bar
        const progressPercent = (currentQuestion / totalQuestions) * 100;
        document.getElementById('progress-fill').style.width = progressPercent + '%';
        
        // Update question tracker
        const trackerContainer = document.getElementById('tracker-container');
        trackerContainer.innerHTML = '';
        
        for (let i = 0; i < totalQuestions; i++) {
            const questionId = this.currentSession.questions[i].id;
            const dot = document.createElement('div');
            dot.className = 'tracker-dot';
            
            if (i === this.currentQuestionIndex) {
                dot.classList.add('current');
            }
            
            if (this.userAnswers[questionId] !== undefined) {
                dot.classList.add('answered');
            }
            
            dot.textContent = i + 1;
            dot.addEventListener('click', () => this.jumpToQuestion(i));
            
            trackerContainer.appendChild(dot);
        }
    },
    
    // Submit the test
    submitTest() {
        if (!this.sessionStarted || this.testSubmitted) return;
        
        console.log("[v0] Test submitted");
        this.testSubmitted = true;
        this.currentView = 'results';
        
        // Calculate score
        const score = this.calculateScore();
        console.log("[v0] Test score:", score);
        
        this.render();
    },
    
    // Calculate score
    calculateScore() {
        let correct = 0;
        this.currentSession.questions.forEach(question => {
            const userAnswer = this.userAnswers[question.id];
            if (userAnswer === question.correct) {
                correct++;
            }
        });
        return correct;
    },
    
    // Retake test
    retakeTest() {
        console.log("[v0] Retaking test");
        const sessionId = this.currentSession.id;
        this.startSession(sessionId);
    },
    
    // Render the current view
    render() {
        console.log("[v0] Rendering view:", this.currentView);
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        
        // Show current view
        const viewElement = document.getElementById(`${this.currentView}-view`);
        if (viewElement) {
            viewElement.classList.add('active');
        }
        
        // Render view-specific content
        switch (this.currentView) {
            case 'home':
                ui.renderHome();
                break;
            case 'sessions':
                ui.renderSessions();
                break;
            case 'test':
                ui.renderTest();
                break;
            case 'results':
                ui.renderResults();
                break;
        }
    },
    
    // Attach event listeners
    attachEventListeners() {
        // Event listeners are attached in UI rendering functions
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app.init();
    assistant.init();
});

// AI helper assistant
const assistant = {
    active: false,
    messages: [
        { role: 'assistant', text: 'Hello! I can help you solve MCQs step by step. Open a question, then ask for a hint, explanation, answer check, or study tip.' }
    ],
    elements: {},

    init() {
        this.elements.modal = document.getElementById('ai-agent-modal');
        this.elements.messages = document.getElementById('ai-agent-messages');
        this.elements.input = document.getElementById('ai-agent-input');
        this.elements.sendBtn = document.getElementById('ai-agent-send');
        this.elements.button = document.getElementById('ai-agent-button');

        if (this.elements.sendBtn) {
            this.elements.sendBtn.addEventListener('click', () => this.handleSend());
        }

        if (this.elements.input) {
            this.elements.input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.handleSend();
                }
            });
        }

        this.render();
    },

    toggle() {
        this.active = !this.active;
        this.render();

        if (this.active && this.elements.input) {
            this.elements.input.focus();
        }
    },

    quickAsk(text) {
        if (!this.active) {
            this.active = true;
        }
        this.handleSend(text);
    },

    handleSend(presetText = '') {
        const text = (presetText || this.elements.input?.value || '').trim();
        if (!text) return;

        this.addMessage('user', text);
        if (this.elements.input) {
            this.elements.input.value = '';
        }
        this.render();

        const response = this.getResponse(text);
        setTimeout(() => {
            this.addMessage('assistant', response);
            this.render();
        }, 250);
    },

    addMessage(role, text) {
        this.messages.push({ role, text });
        if (this.messages.length > 30) {
            this.messages.shift();
        }
    },

    render() {
        if (!this.elements.modal || !this.elements.messages) return;

        this.elements.modal.classList.toggle('active', this.active);
        this.elements.modal.setAttribute('aria-hidden', String(!this.active));

        this.elements.messages.innerHTML = this.messages.map(message => {
            const className = message.role === 'assistant' ? 'ai-agent-message assistant' : 'ai-agent-message user';
            return `<div class="${className}"><span>${this.formatMessage(message.text)}</span></div>`;
        }).join('');

        if (this.active) {
            this.elements.messages.scrollTop = this.elements.messages.scrollHeight;
        }
    },

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },

    formatMessage(text) {
        return this.escapeHtml(text).replace(/\n/g, '<br>');
    },

    getCurrentQuestion() {
        if (!app.currentSession || !app.currentSession.questions) return null;
        return app.currentSession.questions[app.currentQuestionIndex] || null;
    },

    getQuestionLabel(index) {
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        return letters[index] || String(index + 1);
    },

    getSelectedAnswer(question) {
        if (!question) return null;
        const selectedIndex = app.userAnswers[question.id];
        if (selectedIndex === undefined) return null;
        return {
            index: selectedIndex,
            label: this.getQuestionLabel(selectedIndex),
            text: question.options[selectedIndex]
        };
    },

    getCorrectAnswer(question) {
        if (!question) return null;
        return {
            index: question.correct,
            label: this.getQuestionLabel(question.correct),
            text: question.options[question.correct]
        };
    },

    getStudyContext() {
        const subject = app.currentSubject?.name || 'No subject selected';
        const session = app.currentSession?.name || 'No session selected';
        const question = this.getCurrentQuestion();
        const position = question && app.currentSession
            ? `Question ${app.currentQuestionIndex + 1} of ${app.currentSession.questions.length}`
            : 'No active question';

        return { subject, session, question, position };
    },

    getHint(question) {
        if (!question) {
            return 'Open a session and select a question first. Then I can give you a useful hint.';
        }

        const correct = this.getCorrectAnswer(question);
        const selected = this.getSelectedAnswer(question);
        const questionText = question.text.toLowerCase();
        const correctText = correct.text.toLowerCase();
        const directMatch = questionText.includes(correctText);

        let hint = `Hint for ${this.getStudyContext().position}:\n`;
        if (directMatch) {
            hint += 'Look for the option that directly matches the key concept mentioned in the question.';
        } else {
            hint += `Focus on the main idea in this question: ${question.text}`;
        }

        if (selected) {
            hint += `\n\nYou selected ${selected.label}. Before finalizing, compare it with the explanation.`;
        } else {
            hint += '\n\nTry eliminating options that are unrelated, too broad, or describing another concept.';
        }

        return hint;
    },

    explainQuestion(question, revealAnswer = false) {
        if (!question) {
            return 'Start a test question first, then ask me to explain it.';
        }

        const correct = this.getCorrectAnswer(question);
        const selected = this.getSelectedAnswer(question);
        const intro = `${this.getStudyContext().position} in ${app.currentSubject?.name || 'this subject'}:\n${question.text}`;
        const answerLine = revealAnswer
            ? `\n\nCorrect answer: ${correct.label}. ${correct.text}`
            : '\n\nI will explain the idea first. Ask "answer" if you want me to reveal the exact option.';
        const selectedLine = selected
            ? `\nYour selected option: ${selected.label}. ${selected.text}`
            : '\nYou have not selected an option yet.';

        return `${intro}${selectedLine}${answerLine}\n\nExplanation: ${question.explanation || 'The best option is the one that most directly answers the concept asked in the question.'}`;
    },

    checkAnswer() {
        const question = this.getCurrentQuestion();
        if (!question) {
            return 'Open a question first, choose an option, and then I can check your answer.';
        }

        const selected = this.getSelectedAnswer(question);
        const correct = this.getCorrectAnswer(question);

        if (!selected) {
            return 'You have not selected an answer yet. Pick one option first, or ask me for a hint.';
        }

        if (selected.index === correct.index) {
            return `Correct. You selected ${selected.label}. ${selected.text}\n\nWhy: ${question.explanation}`;
        }

        return `Not quite. You selected ${selected.label}. ${selected.text}\nCorrect answer: ${correct.label}. ${correct.text}\n\nWhy: ${question.explanation}`;
    },

    compareOptions() {
        const question = this.getCurrentQuestion();
        if (!question) {
            return 'Open a question first, then I can compare the options.';
        }

        const correct = this.getCorrectAnswer(question);
        const lines = question.options.map((option, index) => {
            const label = this.getQuestionLabel(index);
            const status = index === correct.index ? 'best match' : 'distractor';
            return `${label}. ${option} - ${status}`;
        });

        return `Option guide:\n${lines.join('\n')}\n\nReason: ${question.explanation}`;
    },

    getResultsHelp() {
        if (!app.currentSession) {
            return 'Complete a test first, then I can review your result.';
        }

        const total = app.currentSession.questions.length;
        const score = app.calculateScore();
        const wrong = app.currentSession.questions.filter(question => app.userAnswers[question.id] !== question.correct);
        const firstWrong = wrong.slice(0, 3).map(question => {
            const correct = this.getCorrectAnswer(question);
            return `Q${app.currentSession.questions.indexOf(question) + 1}: correct is ${correct.label}. ${correct.text}`;
        });

        if (wrong.length === 0) {
            return `Excellent work. You scored ${score}/${total}. Retake the session later to keep the concepts fresh.`;
        }

        return `You scored ${score}/${total}.\nReview these first:\n${firstWrong.join('\n')}\n\nTip: Retake the test and ask me for a hint before answering the questions you missed.`;
    },

    getStudyTip() {
        const context = this.getStudyContext();

        if (app.currentView === 'test' && context.question) {
            return `Study tip for this question:\n1. Read the last phrase of the question first.\n2. Identify the main keyword.\n3. Eliminate two unrelated options.\n4. Choose the option that best matches the explanation.\n\nCurrent focus: ${context.subject}, ${context.session}.`;
        }

        if (app.currentView === 'results') {
            return 'Study tip: Review only wrong answers first, write the correct concept in one sentence, then retake the same session after 10 minutes.';
        }

        return 'Study tip: Pick one subject, complete one 10-question session, then review explanations immediately. Short focused practice is better than rushing many sessions.';
    },

    getResponse(text) {
        const query = text.toLowerCase();
        const context = this.getStudyContext();

        if (query.includes('hint') || query.includes('clue')) {
            return this.getHint(context.question);
        }

        if (query.includes('check') || query.includes('my answer') || query.includes('selected')) {
            return this.checkAnswer();
        }

        if (query.includes('explain option') || query.includes('compare option') || query.includes('options')) {
            return this.compareOptions();
        }

        if (query.includes('explain') || query.includes('why') || query.includes('solve')) {
            const reveal = query.includes('answer') || query.includes('correct') || query.includes('solve');
            return this.explainQuestion(context.question, reveal);
        }

        if (query.includes('answer') || query.includes('correct option')) {
            return this.explainQuestion(context.question, true);
        }

        if (query.includes('study tip') || query.includes('tip') || query.includes('strategy')) {
            return this.getStudyTip();
        }

        if (query.includes('score') || query.includes('result') || query.includes('wrong')) {
            return this.getResultsHelp();
        }

        if (query.includes('where am i') || query.includes('current')) {
            return `Current context:\nSubject: ${context.subject}\nSession: ${context.session}\nPosition: ${context.position}`;
        }

        if (query.includes('search ') || query.includes('find ')) {
            const term = query.replace(/search |find /g, '').trim();
            if (term.length === 0) {
                return 'Please tell me what you want to search for. For example: search biology.';
            }
            const matches = getAllSubjects().filter(subject => subject.name.toLowerCase().includes(term) || subject.description.toLowerCase().includes(term));
            if (matches.length === 0) {
                return `I could not find any subjects matching "${term}". Try another keyword like biology, chemistry, or physics.`;
            }
            const visibleMatches = matches.slice(0, 8).map(subject => subject.name).join('\n- ');
            const remaining = matches.length > 8 ? `\n\n${matches.length - 8} more match this search. Narrow the keyword for a shorter list.` : '';
            return `I found these subjects:\n- ${visibleMatches}${remaining}\n\nClick any subject card to start.`;
        }

        if (query.includes('how') && query.includes('start')) {
            return 'To start, choose a subject from the list, then pick a session. You can also use the search bar above to find a subject quickly.';
        }

        if (query.includes('subject') || query.includes('subjects')) {
            const available = getAllSubjects().slice(0, 12).map(subject => subject.name).join(', ');
            return `Available subjects include: ${available}, and more. Use the search box or ask me "search physics" or "find accounting".`;
        }

        if (query.includes('session') || query.includes('test')) {
            if (app.currentSubject) {
                return `${app.currentSubject.name} has ${app.currentSubject.sessions.length} sessions. Each session contains ${app.currentSubject.sessions[0]?.questions.length || 10} MCQs. Select a session card to begin.`;
            }
            return 'Sessions are grouped by subject. Select a subject first, then choose a session to see the questions and start your MCQ test.';
        }

        if (query.includes('help') || query.includes('assist') || query.includes('support')) {
            return 'I can help with:\n- hint: get a clue without revealing the answer\n- explain: understand the current MCQ\n- check my answer: verify your selected option\n- answer: reveal the correct option with explanation\n- study tip: get a quick solving strategy';
        }

        if (query.includes('biology')) {
            return 'Biology helps you learn living systems. Try choosing Biology and then a session to practice MCQs related to cells, genetics, and ecology.';
        }

        if (query.includes('chemistry')) {
            return 'Chemistry covers elements, reactions, and atomic structure. Select Chemistry on the home page to begin reviewing key concepts.';
        }

        if (app.currentView === 'test' && context.question) {
            return 'I can help with this MCQ. Try asking: hint, explain, check my answer, compare options, or answer.';
        }

        return 'I am here to help. Ask me: search biology, how to start, hint, explain, check my answer, or study tip.';
    }
};

// Theme Manager
const themeManager = {
    init() {
        this.loadTheme();
        this.attachToggle();
    },

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.updateToggleIcon(true);
        } else {
            document.body.classList.remove('dark-mode');
            this.updateToggleIcon(false);
        }
    },

    attachToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggle());
        }
    },

    toggle() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        this.updateToggleIcon(isDarkMode);
        console.log(`[Theme] Switched to ${isDarkMode ? 'dark' : 'light'} mode`);
    },

    updateToggleIcon(isDarkMode) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const label = isDarkMode ? 'Switch to light mode' : 'Switch to dark mode';
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);

            const icon = themeToggle.querySelector('.theme-icon');
            if (icon) {
                icon.textContent = '';
            }
        }
    }
};
