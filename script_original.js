const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendBtn');
const transcriptionDiv = document.getElementById('transcription');
const waves = document.querySelectorAll('.wave');

let recognition = null;
let isRecording = false;
let finalTranscript = "";

// Fonction pour animer les vagues
function animateWave(active) {
    waves.forEach(wave => {
        wave.style.animation = active ? "wave-animation 1.5s infinite ease-in-out" : "none";
    });
}

// Démarrer la reconnaissance vocale
startBtn.addEventListener('click', () => {
    if (isRecording) return;
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    sendBtn.disabled = true; // Désactiver "Envoyer" au démarrage
    animateWave(true);
    startRecognition();
});

// Arrêter la reconnaissance vocale
stopBtn.addEventListener('click', () => {
    if (!isRecording) return;
    isRecording = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    if (recognition) {
        recognition.stop();
    }
    animateWave(false);
});

// Effacer la transcription et désactiver "Envoyer"
sendBtn.addEventListener('click', () => {
    transcriptionDiv.textContent = "";
    finalTranscript = "";
    sendBtn.disabled = true;
});

// Fonction de reconnaissance vocale
function startRecognition() {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
        alert("Votre navigateur ne prend pas en charge la reconnaissance vocale.");
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let newFinalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                newFinalTranscript += event.results[i][0].transcript + " ";
            } else {
                interimTranscript += event.results[i][0].transcript + " ";
            }
        }

        // Ajouter uniquement les nouvelles phrases sans duplication
        if (newFinalTranscript.trim() && !finalTranscript.endsWith(newFinalTranscript.trim())) {
            finalTranscript += newFinalTranscript;
        }

        transcriptionDiv.textContent = finalTranscript + interimTranscript;
        sendBtn.disabled = finalTranscript.trim() === ""; // Activer/désactiver "Envoyer"
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start(); // Redémarrer automatiquement si l'enregistrement est actif
        }
    };

    recognition.onerror = (event) => {
        console.error("Erreur de reconnaissance vocale : ", event.error);
        if (event.error === "no-speech" && isRecording) {
            recognition.start();
        }
    };

    recognition.start();
}
