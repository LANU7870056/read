// 詞性標記到類名的映射
const posClassMap = {
    '名': 'pos-noun',
    '形': 'pos-adj',
    '動': 'pos-verb',
    '副': 'pos-adv',
    '介': 'pos-prep',
    '代': 'pos-pron',
    '連': 'pos-conj',
    'vt': 'pos-v',
    'vi': 'pos-v'
};

// 處理中文解釋中的詞性標記
function processChineseText(zhText) {
    // 使用正則表達式匹配[詞性]格式
    const regex = /(\[[^\]]+\])/;
    const match = zhText.match(regex);
    
    if (match) {
        const posTag = match[1];
        // 提取詞性標記（去掉方括號）
        const pos = posTag.substring(1, posTag.length - 1);
        // 獲取對應的CSS類名
        const posClass = posClassMap[pos] || '';
        
        // 替換原始標記為帶樣式的span
        const styledTag = `<span class="pos-marker ${posClass}">${posTag}</span>`;
        return zhText.replace(regex, styledTag);
    }
    return zhText;
}

// 為每個單字創建卡片
function createWordCards() {
    // 獲取卡片容器
    const cardContainer = document.getElementById('cardContainer');
    
    vocabulary.forEach(word => {
        // 創建卡片元素
        const card = document.createElement('div');
        card.className = 'word-card';
        
        // 創建左側文字區域
        const textSection = document.createElement('div');
        textSection.className = 'text-section';
        
        // 添加英文
        const englishDiv = document.createElement('div');
        englishDiv.className = 'english';
        englishDiv.textContent = word.en;
        
        // 創建中文容器
        const chineseContainer = document.createElement('div');
        chineseContainer.className = 'chinese-container';
        
        // 添加切換按鈕
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.innerHTML = '👁️';
        
        // 添加中文（處理詞性標記）
        const chineseDiv = document.createElement('div');
        chineseDiv.className = 'chinese';
        chineseDiv.innerHTML = processChineseText(word.zh);
        
        // 設置切換按鈕的點擊事件
        toggleBtn.onclick = () => {
            if (chineseDiv.style.display === 'none' || !chineseDiv.style.display) {
                chineseDiv.style.display = 'block';
                toggleBtn.innerHTML = '👁️';
            } else {
                chineseDiv.style.display = 'none';
                toggleBtn.innerHTML = '👁️';
            }
        };
        
        // 將按鈕和中文添加到中文容器
        chineseContainer.appendChild(toggleBtn);
        chineseContainer.appendChild(chineseDiv);
        
        // 將英文和中文容器添加到文字區域
        textSection.appendChild(englishDiv);
        textSection.appendChild(chineseContainer);
        
        // 創建右側發音按鈕區域
        const soundSection = document.createElement('div');
        soundSection.className = 'sound-section';
        
        const soundBtn = document.createElement('button');
        soundBtn.className = 'sound-btn';
        soundBtn.innerHTML = '🔊';
        soundBtn.onclick = () => playSound(word.mp3);
        
        // 將按鈕添加到發音區域
        soundSection.appendChild(soundBtn);
        
        // 將左右兩部分添加到卡片
        card.appendChild(textSection);
        card.appendChild(soundSection);
        
        // 將卡片添加到容器
        cardContainer.appendChild(card);
    });
}

// 播放音訊函數
function playSound(id) {
    if (!id) return; // 如果沒有音檔ID則不執行
    const audio = new Audio(`https://lanu7870056.github.io/600/${id}.mp3`);
    audio.play().catch(e => console.error("播放失敗:", e));
}

// 當頁面載入完成時創建單字卡片
document.addEventListener('DOMContentLoaded', createWordCards);