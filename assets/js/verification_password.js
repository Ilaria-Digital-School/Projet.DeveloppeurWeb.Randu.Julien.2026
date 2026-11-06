const passwordInput = document.getElementById('mdp');
const confirmPasswordInput = document.getElementById('confirmMdp');
const errorMessage = document.getElementById('error_message');

function validationPasswords() {
    //si le champ est vide le message ne s'affiche pas
    if (confirmPasswordInput.value === "") {
        errorMessage.textContent = "";
        confirmPasswordInput.setCustomValidity("");
        return;
    }

    //verification de la correspondance
    if (passwordInput.value !== confirmPasswordInput.value) {
        errorMessage.textContent = "Les mots de passe ne correspondent pas !";
        //Bloque le formulaire si les mots de passe ne correspondent pas 
        confirmPasswordInput.setCustomValidity("Invalid");

    } else {
        errorMessage.textContent = "";
        //debloque le formulaire si les mots de passe correspondent 
        confirmPasswordInput.setCustomValidity("");
    }
}

confirmPasswordInput.addEventListener('input', validationPasswords);
passwordInput.addEventListener('input', validationPasswords);