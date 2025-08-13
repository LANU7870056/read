
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

function formatQuestionText(text) {
    // 將 (A)、(B)、(C)、(D) 前面加上換行
    return text
        .replace(/\(A\)/g, '<br>(A)')
        .replace(/\(B\)/g, '<br>(B)')
        .replace(/\(C\)/g, '<br>(C)')
        .replace(/\(D\)/g, '<br>(D)');
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
                | 正確答案: ${question.ans} 
                <span class="${isCorrect ? 'correct' : 'incorrect'}">(${isCorrect ? '正確' : '錯誤'})</span>
            </p>
        `;
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    renderQuestionNav();
    renderQuestion();
    scoreBtn.addEventListener('click', calculateScore);
});