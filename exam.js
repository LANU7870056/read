        // 隨機選取10題
        const selectedQuestions = [];
        const totalQuestions = exam.length;
        const questionsToSelect = Math.min(10, totalQuestions);
        const shuffledExam = [...exam].sort(() => Math.random() - 0.5);

        for (let i = 0; i < questionsToSelect; i++) {
            selectedQuestions.push({
                ...shuffledExam[i],
                userAnswer: null,
                questionNumber: i + 1
            });
        }

        let currentQuestionIndex = 0;

        const questionNav = document.getElementById('questionNav');
        const optionsContainer = document.getElementById('optionsContainer');
        const questionContainer = document.getElementById('questionContainer');
        const scoreBtn = document.getElementById('scoreBtn');
        const resultDiv = document.getElementById('result');
        const wrongAnswersBtn = document.getElementById('wrongAnswersBtn');
        const wrongAnswersModal = document.getElementById('wrongAnswersModal');
        const wrongAnswersList = document.getElementById('wrongAnswersList');
        //const closeModal = document.querySelector('.close');
        const closeModal = document.querySelector('.modal-close-fixed');
        const downloadWrongBtn = document.getElementById('downloadWrongBtn');

        function formatQuestionText(text) {
            return text
                .replace(/\(A\)/g, '<br><span class="option-box">(A)</span>')
                .replace(/\(B\)/g, '<br><span class="option-box">(B)</span>')
                .replace(/\(C\)/g, '<br><span class="option-box">(C)</span>')
                .replace(/\(D\)/g, '<br><span class="option-box">(D)</span>');
        }

        function renderQuestionNav() {
            questionNav.innerHTML = '';
            selectedQuestions.forEach((question, index) => {
                const btn = document.createElement('button');
                btn.className = 'number';
                btn.textContent = index + 1;
                btn.addEventListener('click', () => {
                    currentQuestionIndex = index;
                    renderQuestion();
                    updateNavButtons();
                });
                
                if (question.userAnswer !== null) {
                    btn.classList.add('answered');
                }
                
                if (index === currentQuestionIndex) {
                    btn.classList.add('current');
                }
                
                questionNav.appendChild(btn);
            });
        }

        function renderOptions() {
            optionsContainer.innerHTML = '';
            ['A', 'B', 'C', 'D'].forEach(option => {
                const btn = document.createElement('button');
                btn.textContent = option;
                btn.addEventListener('click', () => {
                    selectedQuestions[currentQuestionIndex].userAnswer = option;
                    renderQuestionNav();
                    btn.classList.add('selected');
                    Array.from(optionsContainer.children).forEach(child => {
                        if (child !== btn) child.classList.remove('selected');
                    });
                    
                    if (currentQuestionIndex < selectedQuestions.length - 1) {
                        setTimeout(() => {
                            currentQuestionIndex++;
                            renderQuestion();
                            renderQuestionNav();
                        }, 300);
                    }
                });
                
                if (selectedQuestions[currentQuestionIndex].userAnswer === option) {
                    btn.classList.add('selected');
                }
                
                optionsContainer.appendChild(btn);
            });
        }

        function renderQuestion() {
            const question = selectedQuestions[currentQuestionIndex];
            const formattedText = formatQuestionText(question.item);
            questionContainer.innerHTML = `
                <p><strong>${question.questionNumber}.</strong> ${formattedText}</p>
            `;
            renderOptions();
        }

        function updateNavButtons() {
            const buttons = questionNav.querySelectorAll('button');
            buttons.forEach((btn, index) => {
                btn.classList.remove('current');
                if (index === currentQuestionIndex) {
                    btn.classList.add('current');
                }
            });
        }

        function calculateScore() {
            let correctCount = 0;
            selectedQuestions.forEach(question => {
                if (question.userAnswer === question.ans) {
                    correctCount++;
                }
            });
            
            const score = correctCount * 10;
            const totalPossible = selectedQuestions.length * 10;
            
            resultDiv.innerHTML = `
                <p>您的得分: <span class="${score >= 60 ? 'correct' : 'incorrect'}">${score}分</span> (滿分: ${totalPossible}分)</p>
                <p>答對題數: ${correctCount}題 / ${selectedQuestions.length}題</p>
            `;
            
            // 顯示答錯題目按鈕
            if (correctCount < selectedQuestions.length) {
                wrongAnswersBtn.style.display = 'inline-block';
            } else {
                wrongAnswersBtn.style.display = 'none';
            }
        }

        function showWrongAnswers() {
            wrongAnswersList.innerHTML = '';
            let wrongCount = 0;
            
            selectedQuestions.forEach(question => {
                if (question.userAnswer !== question.ans) {
                    wrongCount++;
                    const formattedText = formatQuestionText(question.item);
                    const wrongAnswerItem = document.createElement('div');
                    wrongAnswerItem.className = 'wrong-answer-item';
                    wrongAnswerItem.innerHTML = `
                        <div class="wrong-answer-title">第${question.questionNumber}題</div>
                        <p>${formattedText}</p>
                        <p>您的答案: <span class="incorrect">${question.userAnswer || '未作答'}</span></p>
                        <p>正確答案: <span class="correct">${question.ans}</span></p>
                        ${question.tea ? `<p class="explanation">解析: ${question.tea}</p>` : ''}
                    `;
                    wrongAnswersList.appendChild(wrongAnswerItem);
                }
            });
            
            if (wrongCount === 0) {
                wrongAnswersList.innerHTML = '<p>恭喜您！沒有答錯的題目。</p>';
            }
            
            wrongAnswersModal.style.display = 'block';
        }

        // 新增下载功能函数
        function downloadWrongAnswers() {
            let content = "答錯題目複習\n\n";
            let wrongCount = 0;
            
            selectedQuestions.forEach(question => {
                if (question.userAnswer !== question.ans) {
                    wrongCount++;
                    content += `第${question.questionNumber}題\n`;
                    content += `題目: ${question.item.replace(/<br>/g, '\n')}\n`;
                    content += `您的答案: ${question.userAnswer || '未作答'}\n`;
                    content += `正確答案: ${question.ans}\n`;
                    if (question.tea) {
                        content += `解析: ${question.tea.replace(/<br>/g, '\n')}\n`;
                    }
                    content += "\n" + "=".repeat(50) + "\n\n";
                }
            });
            
            if (wrongCount === 0) {
                content = "恭喜您！沒有答錯的題目。";
            }
            
            // 创建下载链接
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '答錯題目複習.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            renderQuestionNav();
            renderQuestion();
            scoreBtn.addEventListener('click', calculateScore);
            wrongAnswersBtn.addEventListener('click', showWrongAnswers);
            closeModal.addEventListener('click', () => {
                wrongAnswersModal.style.display = 'none';
            });
            window.addEventListener('click', (event) => {
                if (event.target === wrongAnswersModal) {
                    wrongAnswersModal.style.display = 'none';
                }
            });
            
            // 新增下载按钮事件监听
            downloadWrongBtn.addEventListener('click', downloadWrongAnswers);
        });