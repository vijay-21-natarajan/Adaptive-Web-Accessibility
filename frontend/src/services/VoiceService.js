// Web Speech API Wrapper for Smart Voice Assistant
class VoiceService {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
        }
    }

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        this.synth.speak(utterance);
    }

    startListening(onCommand) {
        if (!this.recognition || this.isListening) return;

        this.recognition.onresult = (event) => {
            const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
            console.log("[Voice Assistant] Command recognized:", command);
            onCommand(command);
        };

        this.recognition.onerror = (event) => {
            console.error("[Voice Assistant] Recognition error:", event.error);
            if (event.error === 'no-speech') return;
            this.stopListening();
        };

        this.recognition.onend = () => {
            if (this.isListening) {
                this.recognition.start(); // Keep listening
            }
        };

        this.isListening = true;
        this.recognition.start();
        this.speak("Voice assistant enabled. How can I help you?");
    }

    stopListening() {
        if (!this.recognition) return;
        this.isListening = false;
        this.recognition.stop();
        this.speak("Voice assistant disabled.");
    }
}

export const voiceService = new VoiceService();
