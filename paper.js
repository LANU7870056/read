
        // 创建翻译字典
        const wordTranslations = {};
        const phraseTranslations = {};
        
        DA1.forEach(item => {
            if (item.isPhrase) {
                phraseTranslations[item.en] = item.zh;
            } else {
                wordTranslations[item.en] = item.zh;
                const cleanWord = item.en.replace(/[^a-zA-Z]/g, '');
                if (cleanWord !== item.en) {
                    wordTranslations[cleanWord] = item.zh;
                }
            }
        });

        // 全局变量
        let currentWord = '';
        let currentWordElement = null;
        let currentParagraph = null;
        let speechUtterance = null;
        let highlightTimeouts = [];
        let currentReadingWordElements = [];

        // 初始化 - 动态生成段落内容
        document.addEventListener('DOMContentLoaded', function() {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = '';
            
            DA0.forEach((paragraph, index) => {
                const paraContainer = document.createElement('div');
                paraContainer.className = 'paragraph-container';
                
                const paraDiv = document.createElement('div');
                paraDiv.className = 'paragraph';
                
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
                                
                                const cleanWord = word.replace(/[^a-zA-Z]/g, '');
                                wordSpan.dataset.cleanWord = cleanWord;
                                
                                wordSpan.addEventListener('click', function() {
                                    handleWordClick(this, word);
                                });
                                
                                paraDiv.appendChild(wordSpan);
                            }
                        });
                    }
                });
                
                paraContainer.appendChild(paraDiv);
                
                // 创建翻译段落（带词性标记）
                if (DA2[index]) {
                    const transDiv = document.createElement('div');
                    transDiv.className = 'translation';
                    
                    // 处理词性标记
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
        
        // 标记词性（添加颜色样式）
        function markPartOfSpeech(text) {
            // 名词 [名]
            text = text.replace(/\[名\]/g, '<span class="pos-noun">名</span>');
            // 形容词 [形]
            text = text.replace(/\[形\]/g, '<span class="pos-adj">形</span>');
            // 动词 [动]
            text = text.replace(/\[動\]/g, '<span class="pos-verb">動</span>');
            // 副词 [副]
            text = text.replace(/\[副\]/g, '<span class="pos-adv">副</span>');
	    // 介词 [介]
            text = text.replace(/\[介\]/g, '<span class="pos-prep">介</span>');
   	    // 代詞 [代]
            text = text.replace(/\[代\]/g, '<span class="pos-pron">代</span>');

	    // 連詞 [連]
            text = text.replace(/\[連\]/g, '<span class="pos-conj">連</span>');
  	    // V [V]
            text = text.replace(/\[vi\]/g, '<span class="pos-v">Vi</span>');
            text = text.replace(/\[vt\]/g, '<span class="pos-v">Vi</span>');
             
         
            return text;
        }
        
        // 处理单词点击
        function handleWordClick(element, originalWord) {
            clearSelection();
            element.classList.add('highlight');
            
            const cleanWord = element.dataset.cleanWord || originalWord.replace(/[^a-zA-Z]/g, '');
            let translation = wordTranslations[originalWord] || 
                            wordTranslations[cleanWord] || 
                            '未找到翻譯';
            
            // 处理词性标记
            translation = markPartOfSpeech(translation);
            
            updateTranslationDisplay(originalWord, translation);
            
            currentWord = cleanWord;
            currentWordElement = element;
            currentParagraph = element.closest('.paragraph-container');
        }
        
        // 处理片语点击
        function handlePhraseClick(element, phrase) {
            clearSelection();
            element.classList.add('highlight');
            
            let translation = phraseTranslations[phrase] || '未找到翻譯';
            
            // 处理词性标记
            translation = markPartOfSpeech(translation);
            
            updateTranslationDisplay(phrase, translation);
            
            currentWord = phrase;
            currentWordElement = element;
            currentParagraph = element.closest('.paragraph-container');
        }
        
        // 清除所有选择
        function clearSelection() {
            document.querySelectorAll('.word.highlight').forEach(el => {
                el.classList.remove('highlight');
            });
        }
        
        // 更新翻译显示（支持HTML）
        function updateTranslationDisplay(original, translation) {
            document.getElementById('translation-display').innerHTML = 
                `<strong><span style="font-size:25px;color:#FF0">${original}：</strong>${translation}`;
        }
        
        // 初始化按钮事件
        function initButtons() {
            // 单词发音按钮
            document.getElementById('pronounce-word').addEventListener('click', function() {
                if (currentWord) {
                    pronounceWord(currentWord);
                } else {
                    alert('請先點擊一個單詞或片語');
                }
            });
            
            // 段落发音按钮
            document.getElementById('pronounce-paragraph').addEventListener('click', function() {
                if (currentParagraph) {
                    currentReadingWordElements = Array.from(currentParagraph.querySelectorAll('.word'));
                    const text = currentParagraph.querySelector('.paragraph').textContent;
                    pronounceParagraph(text, currentReadingWordElements);
                } else {
                    alert('請先點擊一個段落中的單詞或片語');
                }
            });
            
            // 显示/隐藏翻译按钮
            document.getElementById('show-translation').addEventListener('click', function() {
                if (currentParagraph) {
                    const translation = currentParagraph.querySelector('.translation');
                    if (translation) {
                        translation.style.display = translation.style.display === 'block' ? 'none' : 'block';
                    }
                }
            });
            
            // 停止朗读按钮
            document.getElementById('stop-pronunciation').addEventListener('click', function() {
                stopPronunciation();
            });
        }
        
        // 发音单词/片语
        function pronounceWord(word) {
            if ('speechSynthesis' in window) {
                stopPronunciation();
                const utterance = new SpeechSynthesisUtterance(word);
                utterance.lang = 'en-US';
                speechSynthesis.speak(utterance);
            }
        }
        
        // 朗读段落并高亮单词
        function pronounceParagraph(text, wordElements) {
            if (!('speechSynthesis' in window)) {
                alert('您的浏览器不支持语音合成功能');
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
        
        // 停止朗读
        function stopPronunciation() {
            if ('speechSynthesis' in window) {
                speechSynthesis.cancel();
            }
            clearReadingHighlights();
        }
        
        // 清除朗读高亮
        function clearReadingHighlights() {
            document.querySelectorAll('.word.reading-highlight').forEach(el => {
                el.classList.remove('reading-highlight');
            });
            
            highlightTimeouts.forEach(timeout => clearTimeout(timeout));
            highlightTimeouts = [];
        }