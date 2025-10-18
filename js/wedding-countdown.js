/**
 * js/wedding-countdown.js
 * Defines the <wedding-countdown> custom element.
 */
class WeddingCountdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); 
        this.countdownInterval = null;
        // Flag to prevent double initialization
        this.isInitialized = false; 
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.loadTemplateAndInitialize();
        }
    }

    disconnectedCallback() {
        clearInterval(this.countdownInterval);
    }

    async loadTemplateAndInitialize() {
        try {
            // Fetch the external HTML template
            const response = await fetch('templates/wedding-countdown-template.html');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const templateHtml = await response.text();

            // Create a <template> element on the fly to hold the fetched content
            const template = document.createElement('template');
            template.innerHTML = templateHtml;
            
            // Append a clone of the content to the Shadow DOM
            this.shadowRoot.appendChild(template.content.cloneNode(true));

            this.initializeElements();
            this.addEventListeners();
            this.loadExistingCountdown();
            this.isInitialized = true;

        } catch (error) {
            console.error('Error loading component template:', error);
            this.shadowRoot.innerHTML = '<p style="color: red;">Error: Could not load component template.</p>';
        }
    }

    // --- Component Logic Methods ---

    initializeElements() {
        this.targetDateInput = this.shadowRoot.getElementById('target-date');
        this.startBtn = this.shadowRoot.getElementById('start-btn');
        this.resetBtn = this.shadowRoot.getElementById('reset-btn');
        this.daysEl = this.shadowRoot.getElementById('days');
        this.hoursEl = this.shadowRoot.getElementById('hours');
        this.minutesEl = this.shadowRoot.getElementById('minutes');
        this.secondsEl = this.shadowRoot.getElementById('seconds');
        this.messageEl = this.shadowRoot.getElementById('message');
    }

    addEventListeners() {
        this.startBtn.addEventListener('click', this.handleStart.bind(this));
        this.resetBtn.addEventListener('click', this.handleReset.bind(this));
    }

    handleStart() {
        const targetDate = new Date(this.targetDateInput.value);

        if (isNaN(targetDate.getTime())) {
            this.messageEl.textContent = 'Please enter a valid date and time.';
            return;
        }

        localStorage.setItem('countdownTargetDate', targetDate.toISOString());
        clearInterval(this.countdownInterval);

        this.updateCountdown(targetDate.getTime());
        this.countdownInterval = setInterval(() => {
            this.updateCountdown(targetDate.getTime());
        }, 1000);
    }

    handleReset() {
        clearInterval(this.countdownInterval);
        localStorage.removeItem('countdownTargetDate');
        this.daysEl.textContent = '0';
        this.hoursEl.textContent = '0';
        this.minutesEl.textContent = '0';
        this.secondsEl.textContent = '0';
        this.targetDateInput.value = '';
        this.messageEl.textContent = 'Countdown has been reset.';
    }

    updateCountdown(targetTimestamp) {
        const now = new Date().getTime();
        const distance = targetTimestamp - now;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (distance > 0) {
            this.daysEl.textContent = days;
            this.hoursEl.textContent = hours;
            this.minutesEl.textContent = minutes;
            this.secondsEl.textContent = seconds;
            this.messageEl.textContent = '';
        } else {
            clearInterval(this.countdownInterval);
            this.daysEl.textContent = '0';
            this.hoursEl.textContent = '0';
            this.minutesEl.textContent = '0';
            this.secondsEl.textContent = '0';
            this.messageEl.textContent = '🎉 The big day is here! Congratulations! 🎉';
        }
    }
    
    loadExistingCountdown() {
        const storedDate = localStorage.getItem('countdownTargetDate');
        if (storedDate) {
            const targetDate = new Date(storedDate);
            this.targetDateInput.value = targetDate.toISOString().slice(0, 16); 

            this.updateCountdown(targetDate.getTime());
            this.countdownInterval = setInterval(() => {
                this.updateCountdown(targetDate.getTime());
            }, 1000);
        }
    }
}

customElements.define('wedding-countdown', WeddingCountdown);