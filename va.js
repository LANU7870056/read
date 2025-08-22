// 創建翻譯字典
const wordTranslations = {};
const phraseTranslations = {};
const wordPronunciations = {};
const phrasePronunciations = {};

DA1.forEach(item => {
    if (item.isPhrase) {
        phraseTranslations[item.en] = item.zh;
        phrasePronunciations[item.en] = item.mp3;
    } else {
        wordTranslations[item.en] = item.zh;
        wordPronunciations[item.en] = item.mp3;
        const cleanWord = item.en.replace(/[^a-zA-Z]/g, '');
        if (cleanWord !== item.en) {
            wordTranslations[cleanWord] = item.zh;
            wordPronunciations[cleanWord] = item.mp3;
        }
    }
});

// 全域變數
let currentWord = '';
let currentWordElement = null;
let currentParagraph = null;
let speechUtterance = null;
let highlightTimeouts = [];
let currentReadingWordElements = [];

// 初始化 - 動態生成段落內容
document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '';
    
    DA0.forEach((paragraph, index) => {
        const paraContainer = document.createElement('div');
        paraContainer.className = 'paragraph-container';
        
        const paraDiv = document.createElement('div');
        paraDiv.className = 'paragraph';
        
        // 創建翻譯按鈕 (放在第一單詞前面)
        const transBtn = document.createElement('button');
        transBtn.className = 'translation-btn';
        transBtn.textContent = '解';
        transBtn.addEventListener('click', function() {
            const transDiv = paraContainer.querySelector('.translation');
            if (transDiv) {
                transDiv.style.display = transDiv.style.display === 'block' ? 'none' : 'block';
            }
        });
        
        // 先處理片語（避免單詞和片語重疊）
        let remainingText = paragraph.en;
        const phrases = Object.keys(phraseTranslations).sort((a, b) => b.length - a.length);
        
        phrases.forEach(phrase => {
            if (remainingText.includes(phrase)) {
                const parts = remainingText.split(phrase);
                remainingText = parts.join(`||${phrase}||`);
            }
        });
        
        // 處理文本並添加元素
        const segments = remainingText.split('||');
        let firstWordAdded = false;
        
        segments.forEach(segment => {
            if (phraseTranslations[segment]) {
                // 處理片語
                const phraseSpan = document.createElement('span');
                phraseSpan.className = 'word phrase';
                phraseSpan.textContent = segment;
                phraseSpan.dataset.cleanWord = segment;
                
                phraseSpan.addEventListener('click', function() {
                    handlePhraseClick(this, segment);
                });
                
                // 如果是第一個單詞且還沒添加按鈕，先添加按鈕
                if (!firstWordAdded) {
                    paraDiv.appendChild(transBtn);
                    firstWordAdded = true;
                }
                
                paraDiv.appendChild(phraseSpan);
            } else {
                // 處理普通文本
                const words = segment.split(/(\s+)/);
                
                words.forEach(word => {
                    if (word.trim() === '') {
                        paraDiv.appendChild(document.createTextNode(word));
                    } else {
                        const wordSpan = document.createElement('span');
                        wordSpan.className = 'word';
                        wordSpan.textContent = word;
                        
                        	         const cleanWord = word.replace(/\([A-D]\)/g, '').replace(/[^a-zA-Z]/g, '');
 
                        wordSpan.dataset.cleanWord = cleanWord;
                        
                        wordSpan.addEventListener('click', function() {
                            handleWordClick(this, word);
                        });
                        
                        // 如果是第一個單詞且還沒添加按鈕，先添加按鈕
                        if (!firstWordAdded) {
                            paraDiv.appendChild(transBtn);
                            firstWordAdded = true;
                        }
                        
                        paraDiv.appendChild(wordSpan);
                    }
                });
            }
        });
        
        paraContainer.appendChild(paraDiv);
        
        // 創建翻譯段落（帶詞性標記）
        if (DA2[index]) {
            const transDiv = document.createElement('div');
            transDiv.className = 'translation';
            
            // 處理詞性標記
            let translationText = DA2[index].zh;
            translationText = markPartOfSpeech(translationText);
            
            transDiv.innerHTML = translationText;
            transDiv.style.display = 'none';
            paraContainer.appendChild(transDiv);
        }
        
        contentDiv.appendChild(paraContainer);
    });
    
    initButtons();
});

// 標記詞性（添加顏色樣式）
function markPartOfSpeech(text) {
    // 名詞 [名]
    text = text.replace(/\[名\]/g, '<span class="pos-noun">名</span>');
    // 形容詞 [形]
    text = text.replace(/\[形\]/g, '<span class="pos-adj">形</span>');
    // 動詞 [動]
    text = text.replace(/\[動\]/g, '<span class="pos-verb">動</span>');
    // 副詞 [副]
    text = text.replace(/\[副\]/g, '<span class="pos-adv">副</span>');
    // 介詞 [介]
    text = text.replace(/\[介\]/g, '<span class="pos-prep">介</span>');
    // 代詞 [代]
    text = text.replace(/\[代\]/g, '<span class="pos-pron">代</span>');

    // 連詞 [連]
    text = text.replace(/\[連\]/g, '<span class="pos-conj">連</span>');
    // V [V]
    text = text.replace(/\[vi\]/g, '<span class="pos-v">vi</span>');
    text = text.replace(/\[vt\]/g, '<span class="pos-v">vt</span>');
     
    return text;
}

// 處理單詞點擊
function handleWordClick(element, originalWord) {
    clearSelection();
    element.classList.add('highlight');
    
    const cleanWord = element.dataset.cleanWord || originalWord.replace(/[^a-zA-Z]/g, '');
    let translation = wordTranslations[originalWord] || 
                    wordTranslations[cleanWord] || 
                    '未找到翻譯';
    
    // 處理詞性標記
    translation = markPartOfSpeech(translation);
    
    updateTranslationDisplay(originalWord, translation);
    
    currentWord = cleanWord;
    currentWordElement = element;
    currentParagraph = element.closest('.paragraph-container');
    
    // 播放發音
    const mp3Number = wordPronunciations[originalWord] || wordPronunciations[cleanWord];
    if (mp3Number) {
        playPronunciation(mp3Number);
    }
}

// 處理片語點擊
function handlePhraseClick(element, phrase) {
    clearSelection();
    element.classList.add('highlight');
    
    let translation = phraseTranslations[phrase] || '未找到翻譯';
    
    // 處理詞性標記
    translation = markPartOfSpeech(translation);
    
    updateTranslationDisplay(phrase, translation);
    
    currentWord = phrase;
    currentWordElement = element;
    currentParagraph = element.closest('.paragraph-container');
    
    // 播放發音
    const mp3Number = phrasePronunciations[phrase];
    if (mp3Number) {
        playPronunciation(mp3Number);
    }
}

// 播放發音
function playPronunciation(mp3Number) {
    const audio = new Audio(`https://lanu7870056.github.io/600/${mp3Number}.mp3`);
    audio.play().catch(e => console.error('播放失敗:', e));
}

// 清除所有選擇
function clearSelection() {
    document.querySelectorAll('.word.highlight').forEach(el => {
        el.classList.remove('highlight');
    });
}

// 更新翻譯顯示（支援HTML）
function updateTranslationDisplay(original, translation) {
    document.getElementById('translation-display').innerHTML = 
        `<strong><span style="font-size:25px;color:#FF0">${original}：</strong>${translation}`;
}

// 初始化按鈕事件
function initButtons() {
    // 單詞發音按鈕
    document.getElementById('pronounce-word').addEventListener('click', function() {
        if (currentWord) {
            const mp3Number = wordPronunciations[currentWord] || phrasePronunciations[currentWord];
            if (mp3Number) {
                playPronunciation(mp3Number);
            } else {
                pronounceWord(currentWord);
            }
        } else {
            alert('請先點擊一個單詞或片語');
        }
    });
    
    // 段落發音按鈕
    document.getElementById('pronounce-paragraph').addEventListener('click', function() {
        if (currentParagraph) {
            currentReadingWordElements = Array.from(currentParagraph.querySelectorAll('.word'));
            const text = currentParagraph.querySelector('.paragraph').textContent;
            pronounceParagraph(text, currentReadingWordElements);
        } else {
            alert('請先點擊一個段落中的單詞或片語');
        }
    });
    
    // 顯示/隱藏翻譯按鈕
    document.getElementById('show-translation').addEventListener('click', function() {
        if (currentParagraph) {
            const translation = currentParagraph.querySelector('.translation');
            if (translation) {
                translation.style.display = translation.style.display === 'block' ? 'none' : 'block';
            }
        }
    });
    
    // 停止朗讀按鈕
    document.getElementById('stop-pronunciation').addEventListener('click', function() {
        stopPronunciation();
    });
}

// 發音單詞/片語
function pronounceWord(word) {
    if ('speechSynthesis' in window) {
        stopPronunciation();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    }
}

// 朗讀段落並高亮單詞
function pronounceParagraph(text, wordElements) {
    if (!('speechSynthesis' in window)) {
        alert('您的流覽器不支援語音合成功能');
        return;
    }

    stopPronunciation();
    
    const words = text.split(/\s+/);
    const wordDurations = words.map(word => {
        let duration = 250 + word.length * 20;
        if (word.endsWith('.')) duration += 500;
        return duration;
    });
    
    let currentTime = 0;
    const wordTimings = wordDurations.map((duration, index) => {
        const start = currentTime;
        currentTime += duration;
        return { start, end: currentTime, word: words[index] };
    });
    
    wordElements.forEach((element, index) => {
        if (index < wordTimings.length) {
            const timing = wordTimings[index];
            
            const startTimeout = setTimeout(() => {
                element.classList.add('reading-highlight');
                if (index % 3 === 0 || element.textContent.length > 6) {
                    element.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                }
            }, timing.start);
            
            highlightTimeouts.push(startTimeout);
            
            const endTimeout = setTimeout(() => {
                element.classList.remove('reading-highlight');
            }, timing.end);
            
            highlightTimeouts.push(endTimeout);
        }
    });
    
    speechUtterance = new SpeechSynthesisUtterance(text);
    speechUtterance.lang = 'en-US';
    
    speechUtterance.onend = function() {
        clearReadingHighlights();
    };
    
    speechSynthesis.speak(speechUtterance);
}

// 停止朗讀
function stopPronunciation() {
    if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
    }
    clearReadingHighlights();
}

// 清除朗讀高亮
function clearReadingHighlights() {
    document.querySelectorAll('.word.reading-highlight').forEach(el => {
        el.classList.remove('reading-highlight');
    });
    
    highlightTimeouts.forEach(timeout => clearTimeout(timeout));
    highlightTimeouts = [];
}
