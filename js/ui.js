// UI Rendering Functions

const ui = {
    // Render home view
    renderHome() {
        console.log("[v0] Rendering home view");
        const subjectsGrid = document.getElementById('subjects-grid');
        subjectsGrid.innerHTML = '';

        const searchInput = document.getElementById('subject-search-input');
        if (searchInput) {
            searchInput.value = app.searchQuery || '';
        }
        
        const query = app.searchQuery && app.searchQuery.toLowerCase();
        const subjects = getAllSubjects().filter(subject => {
            if (!query) return true;
            return subject.name.toLowerCase().includes(query) || subject.description.toLowerCase().includes(query);
        });

        if (subjects.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'no-results-message';
            emptyMessage.textContent = 'No subjects found. Try another search term.';
            subjectsGrid.appendChild(emptyMessage);
            return;
        }

        const divisions = [
            { id: 'cs', title: 'Computer Science', prefixes: ['cs'] },
            { id: 'biology', title: 'Biology & Life Sciences', prefixes: ['biology', 'bio', 'bif', 'bt', 'zoo'] },
            { id: 'education', title: 'Education', prefixes: ['edu'] },
            { id: 'english', title: 'English & Linguistics', prefixes: ['eng', 'urd'] },
            { id: 'business', title: 'Business & Management', prefixes: ['mgt', 'mgmt', 'hrm', 'mkt'] },
            { id: 'finance', title: 'Accounting, Banking & Finance', prefixes: ['acc', 'bnk', 'fin'] },
            { id: 'economics', title: 'Economics', prefixes: ['eco'] },
            { id: 'math', title: 'Mathematics & Statistics', prefixes: ['mth', 'sta'] },
            { id: 'science', title: 'Physical & General Sciences', prefixes: ['che', 'gsc', 'phy'] },
            { id: 'social', title: 'Social Sciences & Communication', prefixes: ['mcm', 'pad', 'pak', 'psc', 'psy', 'soc'] },
            { id: 'ethics', title: 'Islamic Studies & Ethics', prefixes: ['isl', 'eth'] },
            { id: 'technology', title: 'Information Technology', prefixes: ['it'] }
        ];

        const getSubjectPrefix = (subject) => subject.id.match(/^[a-z]+/)?.[0] || 'other';
        const groupedSubjects = divisions.map(division => ({
            ...division,
            subjects: subjects.filter(subject => division.prefixes.includes(getSubjectPrefix(subject)))
        })).filter(division => division.subjects.length > 0);

        const otherSubjects = subjects.filter(subject => {
            const prefix = getSubjectPrefix(subject);
            return !divisions.some(division => division.prefixes.includes(prefix));
        });

        if (otherSubjects.length > 0) {
            groupedSubjects.push({
                id: 'other',
                title: 'Other Subjects',
                prefixes: ['other'],
                subjects: otherSubjects
            });
        }

        const renderSubjectCard = (subject, target) => {
            const card = document.createElement('div');
            card.className = 'subject-card';
            const courseCode = subject.name.includes(' - ') ? subject.name.split(' - ')[0] : 'Course';
            const subjectTitle = subject.name.includes(' - ') ? subject.name.split(' - ').slice(1).join(' - ') : subject.name;
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', `Open ${subject.name}`);
            card.innerHTML = `
                <div class="subject-card-top">
                    <span class="subject-code">${courseCode}</span>
                    <span class="subject-action">Study</span>
                </div>
                <h3>${subjectTitle}</h3>
                <p>${subject.description}</p>
            `;
            card.addEventListener('click', () => {
                app.selectSubject(subject.id);
            });
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    app.selectSubject(subject.id);
                }
            });
            target.appendChild(card);
        };

        groupedSubjects.forEach(division => {
            const section = document.createElement('section');
            section.className = 'subject-division';
            section.id = `division-${division.id}`;

            const header = document.createElement('div');
            header.className = 'division-header';
            header.innerHTML = `
                <div>
                    <p class="division-kicker">${division.prefixes.map(prefix => prefix.toUpperCase()).join(' / ')}</p>
                    <h3>${division.title}</h3>
                </div>
                <span class="division-count">${division.subjects.length} Subjects</span>
            `;

            const divisionGrid = document.createElement('div');
            divisionGrid.className = 'division-grid';

            division.subjects.forEach(subject => renderSubjectCard(subject, divisionGrid));

            section.appendChild(header);
            section.appendChild(divisionGrid);
            subjectsGrid.appendChild(section);
        });
    },
    
    // Render sessions view
    renderSessions() {
        console.log("[v0] Rendering sessions view");
        if (!app.currentSubject) {
            app.goHome();
            return;
        }
        
        // Update title
        document.getElementById('sessions-title').textContent = app.currentSubject.name;
        
        // Render sessions
        const sessionsList = document.getElementById('sessions-list');
        sessionsList.innerHTML = '';
        
        app.currentSubject.sessions.forEach(session => {
            const card = document.createElement('div');
            const isFinalSession = session.id === 5;
            const isLocked = !app.isSessionUnlocked(app.currentSubject.id, session.id);
            const isCompleted = app.isSessionCompleted(app.currentSubject.id, session.id);
            const sessionBadge = isFinalSession ? 'Final' : `Session ${session.id}`;
            const statusContent = isLocked
                ? `<span class="session-lock-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                        <rect x="5" y="11" width="14" height="10" rx="2" />
                    </svg>
                </span>`
                : isCompleted ? 'Completed' : 'Start';
            const infoText = isLocked ? 'Complete previous session to unlock' : `${session.questions.length} Questions`;

            card.className = `session-card${isFinalSession ? ' final-session' : ''}${isLocked ? ' locked-session' : ''}${isCompleted ? ' completed-session' : ''}`;
            card.setAttribute('role', isLocked ? 'group' : 'button');
            card.setAttribute('tabindex', isLocked ? '-1' : '0');
            card.setAttribute('aria-disabled', isLocked ? 'true' : 'false');
            card.setAttribute('aria-label', isLocked
                ? `${session.name} is locked. Complete the previous session first.`
                : `Start ${session.name} with ${session.questions.length} questions`);
            card.innerHTML = `
                <div class="session-number">${sessionBadge}</div>
                <div class="session-card-body">
                    <div class="session-label">${session.name}</div>
                    <div class="session-info">${infoText}</div>
                </div>
                <div class="session-start">${statusContent}</div>
            `;
            if (isLocked) {
                sessionsList.appendChild(card);
                return;
            }

            card.addEventListener('click', () => {
                app.startSession(session.id);
            });
            card.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    app.startSession(session.id);
                }
            });
            sessionsList.appendChild(card);
        });
    },
    
    // Render test view
    renderTest() {
        console.log("[v0] Rendering test view");
        if (!app.currentSession) {
            app.goHome();
            return;
        }
        
        // Update title
        document.getElementById('test-title').textContent = 
            `${app.currentSubject.name} - ${app.currentSession.name}`;
        
        // Display current question
        app.updateQuestionDisplay();
    },
    
    // Render results view
    renderResults() {
        console.log("[v0] Rendering results view");
        if (!app.currentSession) {
            app.goHome();
            return;
        }
        
        // Calculate score
        const score = app.calculateScore();
        const totalQuestions = app.currentSession.questions.length;
        const percentage = Math.round((score / totalQuestions) * 100);
        
        // Update score display
        document.getElementById('score-number').textContent = score;
        document.getElementById('percentage-text').textContent = percentage + '%';
        const scoreLabel = document.querySelector('.score-label');
        if (scoreLabel) {
            scoreLabel.textContent = `/ ${totalQuestions}`;
        }
        
        // Update performance message
        const performanceText = document.getElementById('performance-text');
        if (percentage >= 80) {
            performanceText.textContent = 'Excellent performance!';
        } else if (percentage >= 60) {
            performanceText.textContent = 'Good effort, keep practicing!';
        } else if (percentage >= 40) {
            performanceText.textContent = 'Fair performance, review concepts!';
        } else {
            performanceText.textContent = 'Keep practicing to improve!';
        }

        const nextSessionBtn = document.getElementById('next-session-btn');
        if (nextSessionBtn) {
            const nextSession = app.getNextSession();
            nextSessionBtn.style.display = nextSession ? 'inline-flex' : 'none';
            nextSessionBtn.textContent = nextSession ? `Start ${nextSession.name}` : 'Next Session';
        }
        
        // Render answer review
        this.renderAnswerReview(score);
    },
    
    escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[char]);
    },

    // Render answer review
    renderAnswerReview(score) {
        console.log("[v0] Rendering answer review");
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';

        const totalQuestions = app.currentSession.questions.length;
        const unansweredCount = app.currentSession.questions.filter(question => app.userAnswers[question.id] === undefined).length;
        const missedCount = totalQuestions - score - unansweredCount;
        const reviewSummary = document.getElementById('review-summary');

        if (reviewSummary) {
            reviewSummary.innerHTML = `
                <div class="review-summary-stat">
                    <span>${score}</span>
                    <small>Correct</small>
                </div>
                <div class="review-summary-stat">
                    <span>${missedCount}</span>
                    <small>Incorrect</small>
                </div>
                <div class="review-summary-stat">
                    <span>${unansweredCount}</span>
                    <small>Skipped</small>
                </div>
            `;
        }
        
        app.currentSession.questions.forEach((question, index) => {
            const userAnswerIndex = app.userAnswers[question.id];
            const isCorrect = userAnswerIndex === question.correct;
            const unanswered = userAnswerIndex === undefined;
            const statusClass = unanswered ? 'unanswered' : (isCorrect ? 'correct' : 'incorrect');
            const statusText = unanswered ? 'Not answered' : (isCorrect ? 'Correct' : 'Incorrect');
            const userAnswerText = unanswered ? 'No answer selected' : question.options[userAnswerIndex];
            const correctAnswerText = question.options[question.correct];
            
            const reviewItem = document.createElement('div');
            reviewItem.className = 'review-item';
            
            let reviewHTML = '';
            
            if (unanswered) {
                reviewHTML += `
                    <div class="review-answer">
                        <div class="review-label">Status:</div>
                        <div class="review-text">Not answered</div>
                    </div>
                `;
            } else {
                reviewHTML += `
                    <div class="review-answer">
                        <div class="review-label">Your Answer:</div>
                        <div class="review-text">${question.options[userAnswerIndex]}</div>
                    </div>
                    <div class="review-answer">
                        <div class="review-label">Correct Answer:</div>
                        <div class="review-text">${question.options[question.correct]}</div>
                    </div>
                    <div class="review-answer">
                        <div class="review-label">Status:</div>
                        <div class="review-text" style="color: ${isCorrect ? '#10b981' : '#ef4444'};">
                            ${isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </div>
                    </div>
                `;
            }
            
            // Add explanation
            reviewHTML += `
                <div class="review-explanation">
                    <strong>Explanation:</strong> ${question.explanation}
                </div>
            `;
            reviewItem.className = `review-item ${statusClass}`;
            reviewHTML = `
                <div class="review-item-header">
                    <div>
                        <span class="review-question-number">Question ${index + 1}</span>
                        <h3 class="review-question">${this.escapeHTML(question.text)}</h3>
                    </div>
                    <span class="review-status ${statusClass}">${statusText}</span>
                </div>

                <div class="review-answer-grid">
                    <div class="review-answer ${isCorrect ? 'is-correct' : unanswered ? 'is-muted' : 'is-incorrect'}">
                        <div class="review-label">Your answer</div>
                        <div class="review-text">${this.escapeHTML(userAnswerText)}</div>
                    </div>
                    <div class="review-answer is-correct">
                        <div class="review-label">Correct answer</div>
                        <div class="review-text">${this.escapeHTML(correctAnswerText)}</div>
                    </div>
                </div>

                <div class="review-explanation">
                    <span class="review-explanation-label">Explanation</span>
                    <p>${this.escapeHTML(question.explanation)}</p>
                </div>
            `;

            reviewItem.innerHTML = reviewHTML;
            reviewContainer.appendChild(reviewItem);
        });
    }
};
