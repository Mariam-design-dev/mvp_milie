const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const sendBtn = document.getElementById('sendBtn');
const viewBtn = document.getElementById('viewBtn');
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

// Fonction pour envoyer la transcription au backend
async function sendTranscriptionToBackend() {
    if (!finalTranscript.trim()) {
        alert("Aucune transcription à envoyer.");
        return;
    }

    const data = {
        message: finalTranscript.trim(),
        objet: "Transcription vocale",
        entite_etatique: "Non spécifié"
    };

    try {
        const response = await fetch('http://localhost:5000/save_transcription', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            transcriptionDiv.textContent = "";
            finalTranscript = "";
            sendBtn.disabled = true;
        } else {
            alert(`Erreur : ${result.message}`);
        }
    } catch (error) {
        console.error("Erreur lors de l'envoi au backend :", error);
        alert("Erreur de connexion au serveur.");
    }
}

// Redirection vers la page des requêtes
viewBtn.addEventListener('click', () => {
    window.location.href = '/fonts/bd_requetes.html';
});

// Démarrer la reconnaissance vocale
startBtn.addEventListener('click', () => {
    if (isRecording) return;
    isRecording = true;
    startBtn.disabled = true;
    stopBtn.disabled = false;
    sendBtn.disabled = true;
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
    sendBtn.disabled = finalTranscript.trim() === "";
});

// Envoyer la transcription au backend
sendBtn.addEventListener('click', () => {
    sendTranscriptionToBackend();
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

        if (newFinalTranscript.trim() && !finalTranscript.endsWith(newFinalTranscript.trim())) {
            finalTranscript += newFinalTranscript;
        }

        transcriptionDiv.textContent = finalTranscript + interimTranscript;
        sendBtn.disabled = finalTranscript.trim() === "";
    };

    recognition.onend = () => {
        if (isRecording) {
            recognition.start();
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