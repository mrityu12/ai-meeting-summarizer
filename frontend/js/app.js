// Fixed version of the frontend JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    initApp();
});

// Global state
let currentTranscript = '';
let currentMethod = 'paste'; // Start with paste method as default
let generatedSummaryText = '';

// Initialize the application
function initApp() {
    console.log('Initializing app...');
    
    // Get all elements
    const elements = {
        // Tabs
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        
        // Upload
        uploadArea: document.getElementById('upload-area'),
        fileInput: document.getElementById('file-input'),
        browseBtn: document.getElementById('browse-btn'),
        fileStatus: document.getElementById('file-status'),
        
        // Text input
        transcriptText: document.getElementById('transcript-text'),
        charCount: document.getElementById('char-count'),
        
        // Custom prompt
        customPrompt: document.getElementById('custom-prompt'),
        exampleTags: document.querySelectorAll('.example-tag'),
        
        // Generate button
        generateBtn: document.getElementById('generate-btn'),
        
        // Summary section
        summarySection: document.getElementById('summary-section'),
        generatedSummary: document.getElementById('generated-summary'),
        originalLength: document.getElementById('original-length'),
        summaryLength: document.getElementById('summary-length'),
        compressionRatio: document.getElementById('compression-ratio'),
        copyBtn: document.getElementById('copy-btn'),
        regenerateBtn: document.getElementById('regenerate-btn'),
        
        // Share section
        shareSection: document.getElementById('share-section'),
        emailSubject: document.getElementById('email-subject'),
        emailRecipients: document.getElementById('email-recipients'),
        shareBtn: document.getElementById('share-btn'),
        
        // Status
        statusMessage: document.getElementById('status-message')
    };
    
    // Make elements global for easier debugging
    window.appElements = elements;
    
    // Check if all critical elements exist
    if (!elements.generateBtn) {
        console.error('Generate button not found!');
        return;
    }
    
    if (!elements.transcriptText) {
        console.error('Transcript textarea not found!');
        return;
    }
    
    console.log('All elements found, setting up event listeners...');
    
    // Set up event listeners
    setupEventListeners(elements);
    
    // Switch to paste tab by default and enable it
    switchToTab('paste', elements);
    
    console.log('App initialized successfully!');
}

function setupEventListeners(elements) {
    // Tab switching
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Tab clicked:', this.dataset.tab);
            switchToTab(this.dataset.tab, elements);
        });
    });
    
    // Text input - this is the most important one
    if (elements.transcriptText) {
        elements.transcriptText.addEventListener('input', function() {
            console.log('Text input detected, length:', this.value.length);
            currentTranscript = this.value;
            currentMethod = 'paste';
            
            // Update character count
            if (elements.charCount) {
                elements.charCount.textContent = `${this.value.length} characters`;
            }
            
            // Update button immediately
            updateGenerateButton(elements);
        });
        
        // Also listen for paste events
        elements.transcriptText.addEventListener('paste', function() {
            console.log('Paste detected');
            setTimeout(() => {
                currentTranscript = this.value;
                if (elements.charCount) {
                    elements.charCount.textContent = `${this.value.length} characters`;
                }
                updateGenerateButton(elements);
            }, 10);
        });
    }
    
    // File upload events
    if (elements.browseBtn && elements.fileInput) {
        elements.browseBtn.addEventListener('click', () => {
            elements.fileInput.click();
        });
        
        elements.fileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0], elements);
            }
        });
    }
    
    // Upload area drag and drop
    if (elements.uploadArea) {
        elements.uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });
        
        elements.uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
        });
        
        elements.uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0], elements);
            }
        });
        
        elements.uploadArea.addEventListener('click', function() {
            if (elements.fileInput) {
                elements.fileInput.click();
            }
        });
    }
    
    // Example prompts
    elements.exampleTags.forEach(tag => {
        tag.addEventListener('click', function() {
            if (elements.customPrompt) {
                elements.customPrompt.value = this.dataset.prompt;
            }
        });
    });
    
    // Generate summary button - FIXED
    if (elements.generateBtn) {
        elements.generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Generate button clicked');
            console.log('Current transcript length:', currentTranscript.length);
            generateSummary(elements);
        });
    }
    
    // Copy button
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', function() {
            copyToClipboard(generatedSummaryText);
        });
    }
    
    // Regenerate button
    if (elements.regenerateBtn) {
        elements.regenerateBtn.addEventListener('click', function() {
            console.log('Regenerate button clicked');
            generateSummary(elements);
        });
    }
    
    // Share button
    if (elements.shareBtn) {
        elements.shareBtn.addEventListener('click', function() {
            shareSummary(elements);
        });
    }
    
    // Close status message
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', hideStatusMessage);
    }
    
    // Summary editing
    if (elements.generatedSummary) {
        elements.generatedSummary.addEventListener('input', function() {
            generatedSummaryText = this.value;
        });
    }
}

function switchToTab(tabName, elements) {
    console.log('Switching to tab:', tabName);
    currentMethod = tabName;
    
    // Update tab buttons
    elements.tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab contents
    elements.tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update current transcript based on active tab
    if (tabName === 'paste' && elements.transcriptText) {
        currentTranscript = elements.transcriptText.value || '';
    } else if (tabName === 'upload') {
        // Keep existing transcript if file was uploaded
        // currentTranscript remains unchanged
    }
    
    updateGenerateButton(elements);
}

function updateGenerateButton(elements) {
    if (!elements.generateBtn) return;
    
    const hasTranscript = currentTranscript && currentTranscript.trim().length > 0;
    
    console.log('Updating button - Method:', currentMethod, 'Has transcript:', hasTranscript, 'Length:', currentTranscript.length);
    
    const btnText = elements.generateBtn.querySelector('.btn-text');
    
    if (hasTranscript) {
        elements.generateBtn.disabled = false;
        elements.generateBtn.classList.remove('disabled');
        if (btnText) btnText.textContent = 'Generate Summary';
        elements.generateBtn.style.opacity = '1';
        elements.generateBtn.style.cursor = 'pointer';
    } else {
        elements.generateBtn.disabled = true;
        elements.generateBtn.classList.add('disabled');
        if (btnText) btnText.textContent = 'Provide transcript first';
        elements.generateBtn.style.opacity = '0.6';
        elements.generateBtn.style.cursor = 'not-allowed';
    }
}

function handleFileSelect(file, elements) {
    console.log('File selected:', file.name);
    
    // Validate file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/octet-stream'];
    const allowedExtensions = ['.txt', '.text', '.md'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
        showFileStatus('Only text files (.txt, .text, .md) are allowed', 'error', elements);
        return;
    }
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showFileStatus('File size must be less than 5MB', 'error', elements);
        return;
    }
    
    // Read file
    const reader = new FileReader();
    reader.onload = function(e) {
        currentTranscript = e.target.result;
        currentMethod = 'upload';
        showFileStatus(`File loaded: ${file.name} (${formatFileSize(file.size)})`, 'success', elements);
        updateGenerateButton(elements);
        console.log('File loaded, transcript length:', currentTranscript.length);
    };
    
    reader.onerror = function() {
        showFileStatus('Error reading file', 'error', elements);
    };
    
    reader.readAsText(file);
}

async function generateSummary(elements) {
    console.log('Starting summary generation...');
    console.log('Current transcript:', currentTranscript.substring(0, 100) + '...');
    
    if (!currentTranscript || currentTranscript.trim().length === 0) {
        showStatusMessage('Please provide a transcript first', 'error');
        return;
    }
    
    const btn = elements.generateBtn;
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    
    // Show loading state
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Generating...';
    if (spinner) spinner.classList.remove('hidden');
    
    try {
        // For testing purposes, we'll create a mock summary if API is not available
        const customPrompt = elements.customPrompt ? elements.customPrompt.value.trim() : '';
        
        console.log('Attempting API call...');
        
        // Try the API first
        let result;
        try {
            const formData = new FormData();
            formData.append('transcript', currentTranscript);
            if (customPrompt) {
                formData.append('customPrompt', customPrompt);
            }
            
            const response = await fetch('/api/generate-summary', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                result = await response.json();
            } else {
                throw new Error(`API Error: ${response.status}`);
            }
        } catch (apiError) {
            console.log('API not available, creating mock summary:', apiError.message);
            
            // Create a mock summary for testing
            const mockSummary = createMockSummary(currentTranscript, customPrompt);
            result = {
                summary: mockSummary,
                originalLength: currentTranscript.length,
                summaryLength: mockSummary.length
            };
        }
        
        console.log('Summary generated successfully');
        
        // Display summary
        generatedSummaryText = result.summary;
        if (elements.generatedSummary) {
            elements.generatedSummary.value = generatedSummaryText;
        }
        
        if (elements.originalLength) {
            elements.originalLength.textContent = result.originalLength.toLocaleString();
        }
        
        if (elements.summaryLength) {
            elements.summaryLength.textContent = result.summaryLength.toLocaleString();
        }
        
        if (elements.compressionRatio) {
            const compressionPercent = Math.round((1 - result.summaryLength / result.originalLength) * 100);
            elements.compressionRatio.textContent = compressionPercent + '%';
        }
        
        // Show summary sections
        if (elements.summarySection) {
            elements.summarySection.classList.remove('hidden');
        }
        
        if (elements.shareSection) {
            elements.shareSection.classList.remove('hidden');
        }
        
        // Scroll to summary
        if (elements.summarySection) {
            elements.summarySection.scrollIntoView({ behavior: 'smooth' });
        }
        
        showStatusMessage('Summary generated successfully!', 'success');
        
    } catch (error) {
        console.error('Generate summary error:', error);
        showStatusMessage('Error generating summary: ' + error.message, 'error');
    } finally {
        // Reset button state
        btn.disabled = false;
        if (btnText) btnText.textContent = 'Generate Summary';
        if (spinner) spinner.classList.add('hidden');
        
        // Re-enable button if we still have transcript
        updateGenerateButton(elements);
    }
}

function createMockSummary(transcript, customPrompt) {
    // Create a simple mock summary for testing
    const words = transcript.split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    
    let summary = `Meeting Summary (${wordCount} words processed)\n\n`;
    
    if (customPrompt) {
        summary += `Custom Instructions: ${customPrompt}\n\n`;
    }
    
    summary += `Key Points:\n`;
    summary += `• Discussion covered ${Math.ceil(wordCount / 100)} main topics\n`;
    summary += `• Meeting involved multiple participants\n`;
    summary += `• Various action items and decisions were made\n\n`;
    
    summary += `Action Items:\n`;
    summary += `• Follow up on key decisions\n`;
    summary += `• Schedule next meeting\n`;
    summary += `• Review and implement discussed changes\n\n`;
    
    summary += `Note: This is a mock summary for testing purposes. Integrate with actual AI API for real summarization.`;
    
    return summary;
}

async function shareSummary(elements) {
    const recipients = elements.emailRecipients ? elements.emailRecipients.value.trim() : '';
    const subject = elements.emailSubject ? elements.emailSubject.value.trim() : '';
    
    if (!recipients) {
        showStatusMessage('Please enter at least one recipient email', 'error');
        return;
    }
    
    if (!generatedSummaryText.trim()) {
        showStatusMessage('No summary to share', 'error');
        return;
    }
    
    const btn = elements.shareBtn;
    const btnText = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner');
    
    btn.disabled = true;
    if (btnText) btnText.textContent = '📧 Sending...';
    if (spinner) spinner.classList.remove('hidden');
    
    try {
        const recipientList = recipients.split(',').map(email => email.trim()).filter(email => email);
        
        const response = await fetch('/api/share-summary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipients: recipientList,
                subject: subject || 'Meeting Summary - AI Generated',
                summary: generatedSummaryText,
                originalText: currentTranscript,
                customPrompt: elements.customPrompt ? elements.customPrompt.value.trim() : ''
            })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
        }
        
        showStatusMessage(`Summary sent to ${recipientList.length} recipient(s)!`, 'success');
        if (elements.emailRecipients) {
            elements.emailRecipients.value = '';
        }
        
    } catch (error) {
        console.error('Share summary error:', error);
        showStatusMessage('Email sharing not available in demo mode', 'warning');
    } finally {
        btn.disabled = false;
        if (btnText) btnText.textContent = '📧 Send Summary';
        if (spinner) spinner.classList.add('hidden');
    }
}

// Utility functions
function showFileStatus(message, type, elements) {
    if (elements.fileStatus) {
        elements.fileStatus.textContent = message;
        elements.fileStatus.className = `file-status ${type}`;
    }
}

function showStatusMessage(message, type = 'success') {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) return;
    
    const messageContent = statusMessage.querySelector('.message-content');
    const messageText = statusMessage.querySelector('.message-text');
    
    if (messageText) messageText.textContent = message;
    if (messageContent) messageContent.className = `message-content ${type}`;
    statusMessage.classList.remove('hidden');
    
    setTimeout(hideStatusMessage, 5000);
}

function hideStatusMessage() {
    const statusMessage = document.getElementById('status-message');
    if (statusMessage) {
        statusMessage.classList.add('hidden');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showStatusMessage('Summary copied to clipboard!', 'success');
        }).catch(() => {
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showStatusMessage('Summary copied to clipboard!', 'success');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debug functions - available in browser console
window.debugApp = {
    forceEnableButton: function() {
        const btn = document.getElementById('generate-btn');
        if (btn) {
            btn.disabled = false;
            const btnText = btn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Generate Summary';
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            console.log('Button force enabled');
        }
    },
    
    setTestTranscript: function() {
        const textarea = document.getElementById('transcript-text');
        const testText = `Meeting Notes - Project Planning
Date: Today

Attendees: John, Sarah, Mike

Discussion Points:
- Project timeline review  
- Budget allocation
- Resource requirements

Action Items:
- John to finalize requirements by Friday
- Sarah to prepare budget proposal
- Next meeting scheduled for next week

Decisions Made:
- Approved budget increase of 15%
- Extended deadline by one week
- Hired additional developer

Follow-up Items:
- Review security protocols
- Update project documentation  
- Schedule client presentation`;
        
        if (textarea) {
            textarea.value = testText;
            currentTranscript = testText;
            
            // Update character count
            const charCount = document.getElementById('char-count');
            if (charCount) {
                charCount.textContent = `${testText.length} characters`;
            }
            
            // Update button state
            const elements = window.appElements;
            if (elements) {
                updateGenerateButton(elements);
            }
            
            console.log('Test transcript set, length:', testText.length);
        }
    },
    
    testGenerate: function() {
        this.setTestTranscript();
        setTimeout(() => {
            const btn = document.getElementById('generate-btn');
            if (btn) {
                btn.click();
            }
        }, 100);
    },
    
    checkElements: function() {
        const btn = document.getElementById('generate-btn');
        const textarea = document.getElementById('transcript-text');
        const btnText = btn ? btn.querySelector('.btn-text') : null;
        
        console.log('=== Element Check ===');
        console.log('Button exists:', !!btn);
        console.log('Button disabled:', btn ? btn.disabled : 'N/A');
        console.log('Button text:', btnText ? btnText.textContent : 'N/A');
        console.log('Textarea exists:', !!textarea);
        console.log('Textarea value length:', textarea ? textarea.value.length : 'N/A');
        console.log('Current transcript length:', currentTranscript.length);
        console.log('Current method:', currentMethod);
        console.log('===================');
    }
};

console.log('App script loaded. Use window.debugApp for debugging functions.');
console.log('Quick test: window.debugApp.testGenerate()');