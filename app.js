/* ==========================================================================
   InstaSpark AI - Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // State Variables
    let geminiApiKey = localStorage.getItem('gemini_api_key') || '';
    let geminiModel = localStorage.getItem('gemini_model') || 'gemini-2.5-flash';
    let selectedFile = null;
    let isGenerating = false;

    // DOM Elements - Settings & Alerts
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsCard = document.getElementById('settings-card');
    const settingsClose = document.getElementById('settings-close');
    const geminiKeyInput = document.getElementById('gemini-key');
    const geminiModelSelect = document.getElementById('gemini-model');
    const keyVisibilityBtn = document.getElementById('key-visibility');
    const eyeIcon = document.getElementById('eye-icon');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const apiWarningBanner = document.getElementById('api-warning-banner');
    
    // DOM Elements - Upload Area
    const dropZone = document.getElementById('drop-zone');
    const mediaInput = document.getElementById('media-input');
    const uploadPrompt = document.getElementById('upload-prompt');
    const previewContainer = document.getElementById('preview-container');
    const removeMediaBtn = document.getElementById('remove-media-btn');
    const mediaPreview = document.getElementById('media-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    
    // DOM Elements - Generation
    const generateBtn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnSpinner = document.getElementById('btn-spinner');
    const loadingSequence = document.getElementById('loading-sequence');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const loadingMessage = document.getElementById('loading-message');
    
    // DOM Elements - Output Results
    const resultsWorkspace = document.getElementById('results-workspace');
    const hookContent = document.getElementById('hook-content');
    const captionContent = document.getElementById('caption-content');
    const hashtagsContainer = document.getElementById('hashtags-container');
    const copyHashtagsBtn = document.getElementById('copy-hashtags-btn');
    const hashtagsRaw = document.getElementById('hashtags-raw');
    const audioMood = document.getElementById('audio-mood');
    const audioDescription = document.getElementById('audio-description');
    const audioQueriesList = document.getElementById('audio-queries-list');
    const toast = document.getElementById('toast');

    // DOM Elements - Optional Description Context
    const contextContainer = document.getElementById('context-container');
    const mediaContextInput = document.getElementById('media-context');

    // ==========================================================================
    // Initialization & Settings Panel
    // ==========================================================================
    
    // Init API Key State
    if (geminiApiKey) {
        geminiKeyInput.value = geminiApiKey;
    } else {
        apiWarningBanner.classList.remove('hidden');
    }

    if (geminiModel) {
        geminiModelSelect.value = geminiModel;
    }

    // Toggle Settings Card
    settingsToggle.addEventListener('click', () => {
        settingsCard.classList.toggle('hidden');
    });

    settingsClose.addEventListener('click', () => {
        settingsCard.classList.add('hidden');
    });

    // Toggle API Key Steps Guide accordion
    const stepsToggle = document.getElementById('steps-toggle');
    const stepsList = document.getElementById('steps-list');
    stepsToggle.addEventListener('click', () => {
        const isExpanded = stepsToggle.getAttribute('aria-expanded') === 'true';
        stepsToggle.setAttribute('aria-expanded', !isExpanded);
        stepsList.classList.toggle('hidden', isExpanded);
    });

    // Toggle Password Masking
    keyVisibilityBtn.addEventListener('click', () => {
        if (geminiKeyInput.type === 'password') {
            geminiKeyInput.type = 'text';
            eyeIcon.innerHTML = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>`;
        } else {
            geminiKeyInput.type = 'password';
            eyeIcon.innerHTML = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>`;
        }
    });

    // Save Key & Model Settings
    saveKeyBtn.addEventListener('click', () => {
        const key = geminiKeyInput.value.trim();
        const model = geminiModelSelect.value;
        
        // Save Model
        geminiModel = model;
        localStorage.setItem('gemini_model', model);
        
        // Save Key
        if (key) {
            geminiApiKey = key;
            localStorage.setItem('gemini_api_key', key);
            apiWarningBanner.classList.add('hidden');
            settingsCard.classList.add('hidden');
            showToast('Settings saved successfully!');
        } else {
            localStorage.removeItem('gemini_api_key');
            geminiApiKey = '';
            apiWarningBanner.classList.remove('hidden');
            showToast('Settings saved (Key removed).');
        }
    });

    // ==========================================================================
    // Media Upload & Drag-and-Drop Handlers
    // ==========================================================================
    
    // Drag-over styling
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove('drag-over');
        }, false);
    });

    // File Drop Handler
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    // File Input Click Handlers
    dropZone.addEventListener('click', (e) => {
        // Only trigger file selector if not clicking on the remove button or media player
        if (!e.target.closest('#remove-media-btn') && !e.target.closest('video')) {
            mediaInput.click();
        }
    });

    mediaInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelection(e.target.files[0]);
        }
    });

    // Clear Selected Media
    removeMediaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetMediaUpload();
    });

    // Reset Upload State
    function resetMediaUpload() {
        selectedFile = null;
        mediaInput.value = '';
        generateBtn.disabled = true;
        
        // UI Clean up
        mediaPreview.innerHTML = '';
        previewContainer.classList.add('hidden');
        uploadPrompt.classList.remove('hidden');
        
        // Clear context input
        mediaContextInput.value = '';
        contextContainer.classList.add('hidden');
    }

    // Process Selected File
    function handleFileSelection(file) {
        // Validate MIME type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
            showToast('Unsupported file type. Please upload an image or video.');
            return;
        }

        // Limit Check (20MB API soft limit)
        const sizeInMb = file.size / (1024 * 1024);
        if (sizeInMb > 20) {
            showToast('File size exceeds 20MB. Please use a compressed version.');
            return;
        } else if (sizeInMb > 15) {
            showToast('Large file. Uploading might take slightly longer.', 4000);
        }

        selectedFile = file;
        fileName.textContent = file.name;
        fileSize.textContent = sizeInMb.toFixed(1) + ' MB';
        
        // Hide initial prompt & clear preview container
        uploadPrompt.classList.add('hidden');
        mediaPreview.innerHTML = '';
        previewContainer.classList.remove('hidden');

        // Create HTML visual preview
        if (isImage) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = 'Uploaded image preview';
            mediaPreview.appendChild(img);
        } else if (isVideo) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.preload = 'metadata';
            mediaPreview.appendChild(video);
        }

        generateBtn.disabled = false;
        contextContainer.classList.remove('hidden');
    }

    // ==========================================================================
    // API Call & Generation Logic
    // ==========================================================================

    generateBtn.addEventListener('click', async () => {
        if (isGenerating) return;

        // Ensure key is provided
        if (!geminiApiKey) {
            apiWarningBanner.classList.remove('hidden');
            apiWarningBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('Please set your Gemini API Key in Settings first.');
            return;
        }

        if (!selectedFile) {
            showToast('Please upload an image or video first.');
            return;
        }

        // Start Generation State
        isGenerating = true;
        generateBtn.disabled = true;
        btnText.textContent = 'Analyzing Content...';
        btnSpinner.classList.remove('hidden');
        loadingSequence.classList.remove('hidden');
        resultsWorkspace.classList.add('hidden');

        // Step-by-Step progress bar updates
        const steps = [
            { threshold: 10, text: 'Initializing neural engine...' },
            { threshold: 25, text: 'Uploading visual frame vectors...' },
            { threshold: 45, text: 'Analyzing context and visual mood...' },
            { threshold: 70, text: 'Crafting captions and hooks...' },
            { threshold: 90, text: 'Scouting music tracks & hashtags...' }
        ];

        let currentProgress = 0;
        const progressTimer = setInterval(() => {
            if (currentProgress < 95) {
                currentProgress += Math.random() * 8;
                if (currentProgress > 95) currentProgress = 95;
                
                progressBarFill.style.width = currentProgress + '%';
                
                // Update text based on current percentage
                const matchingStep = steps.reduce((prev, curr) => {
                    return (currentProgress >= curr.threshold) ? curr : prev;
                }, steps[0]);
                loadingMessage.textContent = matchingStep.text;
            }
        }, 350);

        try {
            // Read file as base64
            const base64Data = await fileToBase64(selectedFile);
            
            // Read optional context description
            const contextText = mediaContextInput.value.trim();
            
            // Generate content using Gemini API
            const responseData = await callGeminiAPI(base64Data, selectedFile.type, contextText);
            
            // Update to 100% completion
            clearInterval(progressTimer);
            progressBarFill.style.width = '100%';
            loadingMessage.textContent = 'Post ready to copy!';
            
            // Populate Results UI
            populateResults(responseData);
            
            // Show Results
            setTimeout(() => {
                resultsWorkspace.classList.remove('hidden');
                resultsWorkspace.scrollIntoView({ behavior: 'smooth' });
                resetGenerateBtn();
            }, 600);

        } catch (error) {
            console.error('Generation Error:', error);
            clearInterval(progressTimer);
            
            let displayMsg = error.message;
            if (displayMsg.toUpperCase().includes('RESOURCE_EXHAUSTED') || displayMsg.includes('429')) {
                displayMsg = 'API Limit Reached! Try changing the Model (e.g. Gemini 1.5 Flash) in Settings ⚙️';
            }
            
            showToast('Error: ' + displayMsg, 8000);
            resetGenerateBtn();
        }
    });

    function resetGenerateBtn() {
        isGenerating = false;
        generateBtn.disabled = false;
        btnText.textContent = 'Generate Instagram Kit';
        btnSpinner.classList.add('hidden');
        loadingSequence.classList.add('hidden');
        progressBarFill.style.width = '0%';
    }

    // Convert file to base64 encoding helper
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Strip the base64 URL protocol prefix
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = error => reject(error);
        });
    }

    // Call Gemini API request
    async function callGeminiAPI(base64Data, mimeType, contextText = '') {
        // System instruction / prompt detail
        let prompt = `Analyze this media file (image or video) and generate a cohesive, ready-to-post Instagram package. 
You must return your output strictly in JSON format matching the schema below. Do not wrap the JSON block in markdown backticks (e.g. \`\`\`json); output ONLY the raw JSON string.

JSON Schema:
{
  "hook": "A highly engaging, scroll-stopping hook (10-15 words max) appropriate for visual text overlay.",
  "caption": "An engaging, reader-focused Instagram caption (100-200 words). Structure it with appropriate spacing, line breaks, emojis, and an actionable Call To Action (CTA) at the end. Do not include hashtags here.",
  "hashtags": [
    "#hashtag1",
    "#hashtag2",
    "#hashtag3",
    "#hashtag4",
    "#hashtag5"
  ],
  "audio_suggestion": {
    "mood": "A 1-3 word description of the visual mood, e.g. 'Chill & Aesthetic' or 'High Energy Beats'.",
    "description": "A brief explanation (1-2 sentences) explaining why this style of audio pairs perfectly with the media.",
    "search_queries": [
      "trending lo-fi acoustic",
      "retro synth pop beat",
      "cinematic soft piano"
    ]
  }
}

Ensure the caption tone matches the content style (e.g., aesthetic, inspirational, professional, educational, or fun). The 5 hashtags must be a mixture of broad and targeted tags relevant to the subject matter. The search_queries should be realistic, generic keywords or audio descriptions that creators can type into the Instagram audio library search bar to find matching tracks.`;

        // Inject custom description if user provided context
        if (contextText) {
            prompt += `\n\nCRITICAL CONTEXT SPECIFIED BY THE CREATOR: The creator has specified this post/visual is about: "${contextText}". You MUST structure the caption, hook, and tags to focus on and highlight this specific topic/context, while using the visual content of the media for descriptive color.`;
        }

        // Direct fetch url for selected Gemini model
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            const errMsg = errData.error?.message || response.statusText;
            throw new Error(`API failed (${response.status}): ${errMsg}`);
        }

        const data = await response.json();
        
        // Safely extract candidate text
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            throw new Error('Gemini API returned an empty output. Try checking your media file.');
        }

        // Sanitize LLM JSON outputs (removes any accidental markdown wrappers)
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('```json')) {
            cleanedText = cleanedText.substring(7);
        } else if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.substring(3);
        }
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.substring(0, cleanedText.length - 3);
        }
        cleanedText = cleanedText.trim();

        try {
            return JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('Raw JSON payload:', responseText);
            throw new Error('Could not parse the Gemini API response structure. Please try generating again.');
        }
    }

    // Populate Results Workspace
    function populateResults(data) {
        // 1. Hook
        hookContent.textContent = data.hook || '';

        // 2. Caption
        captionContent.innerHTML = (data.caption || '').replace(/\n/g, '<br>');

        // 3. Hashtags
        hashtagsContainer.innerHTML = '';
        const rawTags = (data.hashtags || []).map(tag => tag.startsWith('#') ? tag : '#' + tag);
        
        rawTags.forEach(tag => {
            const pill = document.createElement('span');
            pill.className = 'hashtag-pill';
            pill.textContent = tag;
            pill.addEventListener('click', () => {
                copyTextToClipboard(tag);
                showToast(`Copied individual tag: ${tag}`);
            });
            hashtagsContainer.appendChild(pill);
        });

        // Set raw hashtags value for Copy All trigger
        hashtagsRaw.textContent = rawTags.join(' ');

        // 4. Audio Suggestions
        audioMood.textContent = data.audio_suggestion?.mood || 'Aesthetic';
        audioDescription.textContent = data.audio_suggestion?.description || 'No description provided.';
        
        audioQueriesList.innerHTML = '';
        const queries = data.audio_suggestion?.search_queries || [];
        queries.forEach(query => {
            const li = document.createElement('li');
            li.className = 'query-item';
            li.textContent = query;
            li.addEventListener('click', () => {
                copyTextToClipboard(query);
                showToast(`Copied search query: "${query}"`);
            });
            audioQueriesList.appendChild(li);
        });
    }

    // ==========================================================================
    // Copy-to-Clipboard & Toast Notifications
    // ==========================================================================

    // Dynamic copy handler on copy buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Handle captions with newlines correctly
                let textToCopy = targetElement.innerText || targetElement.textContent;
                
                // Copy
                copyTextToClipboard(textToCopy);
                
                // Trigger button animation feedback
                btn.classList.add('copied');
                const btnLabel = btn.querySelector('.copy-icon-text');
                const checkIcon = btn.querySelector('.check-icon');
                
                const originalLabel = btnLabel.textContent;
                btnLabel.textContent = 'Copied!';
                if (checkIcon) checkIcon.classList.remove('hidden');
                
                showToast('Copied content to clipboard!');
                
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btnLabel.textContent = originalLabel;
                    if (checkIcon) checkIcon.classList.add('hidden');
                }, 2000);
            }
        });
    });

    // Copy to clipboard helper
    function copyTextToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Prevent scrolling to bottom of page in some browsers
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback clipboard copy failed:', err);
        }
        document.body.removeChild(textarea);
    }

    // Show Toast Notice
    let toastTimer = null;
    function showToast(message, duration = 3000) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        // Force Reflow
        void toast.offsetWidth;
        
        toast.classList.add('show');
        
        if (toastTimer) clearTimeout(toastTimer);
        
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 300); // match transition speed
        }, duration);
    }
});
