// 隨機選取20題
const selectedQuestions = [];
const totalQuestions = exam.length;
const questionsToSelect = Math.min(20, totalQuestions);
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
const recordBtn = document.getElementById('recordBtn');
const recordModal = document.getElementById('recordModal');
const answerRecordBody = document.getElementById('answerRecordBody');
const closeBtn = document.querySelector('.close');

function formatQuestionText(text) {
    // 將 (A)、(B)、(C)、(D) 前面加上換行
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
            // 移除其他按鈕的selected類
            Array.from(optionsContainer.children).forEach(child => {
                if (child !== btn) child.classList.remove('selected');
            });
            
            // 自動跳轉到下一題
            if (currentQuestionIndex < selectedQuestions.length - 1) {
                setTimeout(() => {
                    currentQuestionIndex++;
                    renderQuestion();
                    renderQuestionNav();
                }, 300); // 延遲300毫秒讓使用者看到選擇效果
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
    
    const score = correctCount * 5;
    const totalPossible = selectedQuestions.length * 5;
    
    resultDiv.innerHTML = `
        <p>您的得分: <span class="${score >= 60 ? 'correct' : 'incorrect'}">${score}分</span> (滿分: ${totalPossible}分)</p>
        <p>答對題數: ${correctCount}題 / ${selectedQuestions.length}題</p>
    `;
    
    selectedQuestions.forEach(question => {
        const isCorrect = question.userAnswer === question.ans;
        resultDiv.innerHTML += `
            <p>第${question.questionNumber}題: 
                您的答案: ${question.userAnswer || '未作答'} 


            </p>
        `;
    });
}

function showAnswerRecord() {
    answerRecordBody.innerHTML = '';
    selectedQuestions.forEach(question => {
        const isCorrect = question.userAnswer === question.ans;
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${question.questionNumber}</td>
            <td>${question.userAnswer || '未作答'}</td>

            
        `;
        
        answerRecordBody.appendChild(row);
    });
    
    recordModal.style.display = 'block';
}

// 關閉模態視窗
function closeModal() {
    recordModal.style.display = 'none';
}

// 點擊模態視窗外部關閉視窗
window.onclick = function(event) {
    if (event.target == recordModal) {
        closeModal();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderQuestionNav();
    renderQuestion();
    scoreBtn.addEventListener('click', calculateScore);
    recordBtn.addEventListener('click', showAnswerRecord);
    closeBtn.addEventListener('click', closeModal);
});