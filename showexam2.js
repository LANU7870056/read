// 提取单元信息
exam.forEach((q, index) => {
    const match = q.item.match(/\[([^\]]+)\]/);
    q.unit = match ? match[1] : '';
    q.id = index + 1;
});

let currentPage = 1;
const questionsPerPage = 50;

// 渲染题目列表
function renderQuestions(page = 1) {
    const questionList = document.getElementById('question-list');
    questionList.innerHTML = '';

    const startIndex = (page - 1) * questionsPerPage;
    const endIndex = Math.min(startIndex + questionsPerPage, exam.length);

    for (let i = startIndex; i < endIndex; i++) {
        const question = exam[i];
        const questionElement = document.createElement('div');
        questionElement.className = 'question-card';

        const questionText = question.item.replace(/\[(\d+-\d+)\]$/, '').replace(/\(A\)/, '<br>(A)');

        let explanationHTML = '';
        if (question.tea && question.tea.trim() !== '') {
            explanationHTML = `
                <div class="explanation" style="display: none;">
                    <strong>解析:</strong><br>
                    ${question.tea}
                </div>
            `;
        }

        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-number">第${question.id}题</span>
                <span class="question-tag">${question.unit}</span>
            </div>
            <div class="question-content">${questionText}</div>
            <button class="toggle-explanation">解析</button>
            <div class="answer" style="display: none;">
                <strong>正确答案: ${question.ans}</strong>
            </div>
            ${explanationHTML}
        `;
        questionList.appendChild(questionElement);
    }
    
    // 為每個「解析」按鈕添加點擊事件監聽器
    document.querySelectorAll('.toggle-explanation').forEach(button => {
        button.addEventListener('click', (event) => {
            const card = event.target.closest('.question-card');
            const answerDiv = card.querySelector('.answer');
            const explanationDiv = card.querySelector('.explanation');

            if (answerDiv.style.display === 'none') {
                answerDiv.style.display = 'block';
                explanationDiv.style.display = 'block';
                event.target.textContent = '隱藏解析';
            } else {
                answerDiv.style.display = 'none';
                explanationDiv.style.display = 'none';
                event.target.textContent = '解析';
            }
        });
    });

    // 渲染分页
    renderPagination(exam.length, page);
}

// 渲染分页控件
function renderPagination(totalQuestions, currentPage) {
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    if (totalPages <= 1) return;

    // 添加上一页按钮
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '上一页';
        prevButton.addEventListener('click', () => {
            renderQuestions(currentPage - 1);
        });
        paginationElement.appendChild(prevButton);
    }

    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            renderQuestions(i);
        });
        paginationElement.appendChild(pageButton);
    }

    // 添加下一页按钮
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '下一页';
        nextButton.addEventListener('click', () => {
            renderQuestions(currentPage + 1);
        });
        paginationElement.appendChild(nextButton);
    }
}

// 初始渲染
renderQuestions();