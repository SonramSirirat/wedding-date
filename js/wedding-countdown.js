/**
 * wedding-countdown.js
 * Defines the <wedding-countdown> custom element.
 * * Note: For this to work, the Tailwind CSS CDN link
 * <script src="https://cdn.tailwindcss.com"></script>
 * must still be present in the main index.html file's <head>.
 */
class WeddingCountdown extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }); // Use Shadow DOM for encapsulation
        this.countdownInterval = null;
    }

    // HTML template for the component, including Tailwind classes and Inter font styles
    getTemplate() {
        // The body styles and font import are moved inside the component's <style> block
        // to keep it self-contained, but the Tailwind CDN must be in the main document.
        return `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
                /* Apply Inter font and base styles to the shadow root's content */
                :host {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    padding: 1rem;
                    background-color: #111827; /* bg-gray-900 */
                }
                .container {
                    width: 100%;
                    max-width: 42rem; /* max-w-2xl */
                    background-color: #1f2937; /* bg-gray-800 */
                    padding: 2rem;
                    border-radius: 1rem; /* rounded-2xl */
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
                    border: 1px solid #374151; /* border border-gray-700 */
                    color: white;
                    font-family: 'Inter', sans-serif;
                }
                /* Utility classes for the input/buttons */
                .input-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border-radius: 0.5rem;
                    background-color: #374151; /* bg-gray-700 */
                    color: #e5e7eb; /* text-gray-200 */
                    border: 1px solid #4b5563; /* border border-gray-600 */
                    transition: all 300ms;
                }
                .input-field:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px #a855f7; /* focus:ring-2 focus:ring-purple-500 */
                }
                .start-btn {
                    background-color: #9333ea; /* bg-purple-600 */
                }
                .start-btn:hover {
                    background-color: #7e22ce; /* hover:bg-purple-700 */
                }
                .reset-btn {
                    background-color: #dc2626; /* bg-red-600 */
                }
                .reset-btn:hover {
                    background-color: #b91c1c; /* hover:bg-red-700 */
                }
                .button-base {
                    width: 100%;
                    padding: 0.75rem 1.5rem;
                    color: white;
                    font-weight: 600;
                    border-radius: 0.5rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
                    transition: all 300ms;
                    transform: scale(1);
                    cursor: pointer;
                }
                .button-base:hover {
                    transform: scale(1.05);
                }
                
            </style>
            
            <div class="container">
                <h1 class="text-4xl sm:text-5xl font-bold text-center mb-6">Ning and Pok Wedding</h1>
                <p class="text-center text-gray-400 mb-8">Set a date and time for your countdown and it will persist across sessions.</p>

                <div class="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                    <div class="w-full sm:w-auto">
                        <input type="datetime-local" id="target-date" class="input-field">
                    </div>
                    <div class="flex space-x-4 w-full sm:w-auto">
                        <button id="start-btn" class="button-base start-btn">
                            Start
                        </button>
                        <button id="reset-btn" class="button-base reset-btn">
                            Reset
                        </button>
                    </div>
                </div>

                <div id="countdown-display" class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div class="bg-gray-700 p-4 rounded-xl shadow-inner">
                        <div id="days" class="text-5xl font-extrabold text-purple-400">0</div>
                        <div class="text-sm uppercase text-gray-400 font-medium mt-2">Days</div>
                    </div>
                    <div class="bg-gray-700 p-4 rounded-xl shadow-inner">
                        <div id="hours" class="text-5xl font-extrabold text-purple-400">0</div>
                        <div class="text-sm uppercase text-gray-400 font-medium mt-2">Hours</div>
                    </div>
                    <div class="bg-gray-700 p-4 rounded-xl shadow-inner">
                        <div id="minutes" class="text-5xl font-extrabold text-purple-400">0</div>
                        <div class="text-sm uppercase text-gray-400 font-medium mt-2">Minutes</div>
                    </div>
                    <div class="bg-gray-700 p-4 rounded-xl shadow-inner">
                        <div id="seconds" class="text-5xl font-extrabold text-purple-400">0</div>
                        <div class="text-sm uppercase text-gray-400 font-medium mt-2">Seconds</div>
                    </div>
                </div>
                
                <div id="message" class="text-center mt-8 text-xl font-medium text-gray-300"></div>
            </div>
        `;
    }

    // Called when the element is inserted into a document
    connectedCallback() {
        this.shadowRoot.innerHTML = this.getTemplate();
        this.initializeElements();
        this.addEventListeners();
        this.loadExistingCountdown();
    }

    // Called when the element is removed from a document
    disconnectedCallback() {
        clearInterval(this.countdownInterval);
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

        // Store the target date in local storage
        localStorage.setItem('countdownTargetDate', targetDate.toISOString());

        // Clear any existing countdown
        clearInterval(this.countdownInterval);

        // Start the new countdown
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

        // Calculations for days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result
        if (distance > 0) {
            this.daysEl.textContent = days;
            this.hoursEl.textContent = hours;
            this.minutesEl.textContent = minutes;
            this.secondsEl.textContent = seconds;
            this.messageEl.textContent = '';
        } else {
            // If the countdown is finished
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
            // Set input value: format to YYYY-MM-DDTHH:MM
            this.targetDateInput.value = targetDate.toISOString().slice(0, 16); 

            // Start the countdown
            this.updateCountdown(targetDate.getTime());
            this.countdownInterval = setInterval(() => {
                this.updateCountdown(targetDate.getTime());
            }, 1000);
        }
    }
}

// Define the custom element
customElements.define('wedding-countdown', WeddingCountdown);