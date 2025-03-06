const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const transcriptionDiv = document.getElementById('transcription');
const waves = document.querySelectorAll('.wave');

let recognition;
let isRecording = false;
let finalTranscript = "";

// Fonction pour animer les vagues
function animateWave(active) {
    waves.forEach(wave => {
        if (active) {
            wave.style.animation = "wave-animation 1.5s infinite ease-in-out";
        } else {
            wave.style.animation = "none";
        }
    });
}

startBtn.addEventListener('click', () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    transcriptionDiv.textContent = '';
    finalTranscript = "";
    isRecording = true;
    animateWave(true);
    startRecognition();
});

stopBtn.addEventListener('click', () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    isRecording = false;
    if (recognition) {
        recognition.stop();
    }
    animateWave(false);
});

function startRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'fr-FR';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscriptPart = "";
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscriptPart = event.results[i][0].transcript + " ";
            } else {
                interimTranscript += event.results[i][0].transcript + " ";
            }
        }
        
        // On met à jour le texte de transcription uniquement avec le dernier segment final
        finalTranscript += finalTranscriptPart;
    
        // Afficher la transcription avec les mots finaux et intermédiaires
        transcriptionDiv.textContent = finalTranscript + interimTranscript;
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
