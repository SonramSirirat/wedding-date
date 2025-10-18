/**
 * js/wedding-countdown.js
 * Defines the <wedding-countdown> custom element.
 */
class WeddingCountdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); 
        this.countdownInterval = null;
    }

    connectedCallback() {
        // 1. Get the template content from the main document
        const template = document.getElementById('wedding-countdown-template');
        if (!template) {
            this.shadowRoot.innerHTML = '<p style="color: red;">Error: Component template not loaded.</p>';
            console.error('Template element with ID "wedding-countdown-template" not found.');
            return;
        }

        // 2. Clone the template content
        const content = template.content.cloneNode(true);

        // 3. INJECT STYLES INTO SHADOW DOM FOR TAILWIND AND CUSTOM CSS

        // A. Inject Tailwind CDN link
        const tailwindLink = document.createElement('script');
        tailwindLink.src = 'https://cdn.tailwindcss.com';
        this.shadowRoot.appendChild(tailwindLink);
        
        // B. Inject custom CSS link (for font and base rules)
        const customCssLink = document.createElement('link');
        customCssLink.rel = 'stylesheet';
        // Use the relative path to the CSS file
        customCssLink.href = 'css/wedding-countdown.css'; 
        this.shadowRoot.appendChild(customCssLink);

        // 4. Append the HTML content after the styles
        this.shadowRoot.appendChild(content);

        this.initializeElements();
        this.addEventListeners();
        this.loadExistingCountdown();
    }

    disconnectedCallback() {
        clearInterval(this.countdownInterval);
    }
    
    // ... (All other JavaScript methods remain the same) ...

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