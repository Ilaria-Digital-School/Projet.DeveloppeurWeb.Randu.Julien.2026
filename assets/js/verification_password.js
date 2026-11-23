const passwordInput = document.getElementById('mdp');
const confirmPasswordInput = document.getElementById('confirmMdp');
const errorMessage = document.getElementById('error_message');

function validationPasswords() {
    //si le champ est vide le message ne s'affiche pas
    //if the field is empty, the message is not displayed
    if (confirmPasswordInput.value === "") {
        errorMessage.textContent = "";
        confirmPasswordInput.setCustomValidity("");
        return;
    }

    //verification de la correspondance / verification of the match
    if (passwordInput.value !== confirmPasswordInput.value) {
        errorMessage.textContent = "Les mots de passe ne correspondent pas !";
        //Bloque le formulaire si les mots de passe ne correspondent pas 
        //Blocks the form if the passwords do not match
        confirmPasswordInput.setCustomValidity("Invalid");

    } else {
        errorMessage.textContent = "";
        //debloque le formulaire si les mots de passe correspondent 
        //unlocks the form if the passwords match
        confirmPasswordInput.setCustomValidity("");
    }
}

confirmPasswordInput.addEventListener('input', validationPasswords);
passwordInput.addEventListener('input', validationPasswords);