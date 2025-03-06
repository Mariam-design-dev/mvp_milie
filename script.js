const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptionDiv = document.getElementById('transcription');
const waves = document.querySelectorAll('.wave');

let recognition = null;
let isRecording = false;
let finalTranscript = ""; // Texte final accumulé

// Fonction pour animer les vagues
function animateWave(active) {
    waves.forEach(wave => {
        wave.style.animation = active ? "wave-animation 1.5s infinite ease-in-out" : "none";
    });
}

startBtn.addEventListener('click', () => {
    if (isRecording) return; // Éviter les appuis multiples
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    animateWave(true);
    
    startRecognition();
});

stopBtn.addEventListener('click', () => {
    if (!isRecording) return; // Éviter les appuis multiples
    isRecording = false;
    startBtn.disabled = false;
    stopBtn.disabled = true;
    
    if (recognition) {
        recognition.stop();
    }
    animateWave(false);
});

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
