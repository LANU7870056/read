// 提取单元信息
exam.forEach((q, index) => {
    //const match = q.item.match(/\[(\d+-\d+)\]/);
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

        // 提取题目内容（去掉最后的单元标记）
        //const questionText = question.item.replace(/\[(\d+-\d+)\]$/, '');

const questionText = question.item.replace(/\[(\d+-\d+)\]$/, '').replace(/\(A\)/, '<br>(A)');      // 單獨在第一個 (A) 前加換行



        // === 新增開始 ===
        // 如果題目資料中有解析(tea)，則生成解析的 HTML 區塊
        let explanationHTML = '';
        if (question.tea && question.tea.trim() !== '') {
            explanationHTML = `
                <div class="explanation">
                    <strong>解析:</strong><br>
                    ${question.tea}
                </div>
            `;
        }
        // === 新增結束 ===

        questionElement.innerHTML = `
            <div class="question-header">
                <span class="question-number">第${question.id}题</span>
                <span class="question-tag">${question.unit}</span>
            </div>
            <div class="question-content">${questionText}</div>
            <div class="answer">
                <strong>正确答案: ${question.ans}</strong>
            </div>
            ${explanationHTML} 
        `; // <-- 將生成的解析 HTML 添加到這裡

        questionList.appendChild(questionElement);
    }

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