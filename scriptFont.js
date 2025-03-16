const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const passwordFeedback = document.getElementById('passwordFeedback');

// Afficher/Masquer le mot de passe
togglePassword.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' 
                 ? 'text' 
                 : 'password';
    passwordInput.setAttribute('type', type);

    togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
});

// Vérification du mot de passe en temps réel
passwordInput.addEventListener('input', () => {
    const passwordValue = passwordInput.value;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10}$/;

    if (passwordRegex.test(passwordValue)) {
        passwordFeedback.style.display = 'none';  // ✅ Mot de passe valide
        passwordInput.style.borderColor = 'green';
    } else {
        passwordFeedback.style.display = 'block'; // ❌ Mot de passe invalide
        passwordInput.style.borderColor = 'red';
    }
});

// Vérification du numéro de téléphone
const phoneInput = document.getElementById('phone');
const phoneFeedback = document.getElementById('phoneFeedback');

// Vérification du numéro de téléphone
phoneInput.addEventListener('input', () => {
    const phoneValue = phoneInput.value.trim();
    const phoneRegex = /^(01|05|07|27|25)\d{8}$/;

    if (phoneRegex.test(phoneValue)) {
        phoneFeedback.style.display = 'none';  // ✅ Numéro valide
        phoneInput.style.borderColor = 'green';
    } else {
        phoneFeedback.style.display = 'block'; // ❌ Numéro invalide
        phoneInput.style.borderColor = 'red';
    }
});

 // Vérification de l'e-mail en temps réel
const emailInput = document.getElementById('email');
    const emailFeedback = document.getElementById('emailFeedback');

    // Vérification de l'e-mail en temps réel
    emailInput.addEventListener('input', () => {
        const emailValue = emailInput.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (emailRegex.test(emailValue)) {
            emailFeedback.style.display = 'none';  // ✅ E-mail valide
            emailInput.style.borderColor = 'green';
        } else {
            emailFeedback.style.display = 'block'; // ❌ E-mail invalide
            emailInput.style.borderColor = 'red';
        }
    });