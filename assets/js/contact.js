// //Faire fonction ajouter chambre pour la page ajout chambre 
//Implement an 'add room' function for the 'add room' page
class Contact {
    constructor(nom, numero, email, message) {
        this.nom =nom;
        this.numero=numero;
        this.email=email;
        this.message=message;
    }
}

//Fonction pour envoyer un message
//Function to send a message
function envoieMessage() {
    const form = document.getElementById("envoie-message");
    console.log(form);

    form.addEventListener("submit", function(event){
        event.preventDefault(); //Annuler le rechargement automatique de la page //Disable automatic page reloading

        let nom = document.getElementById("nom").value;
        let numero = document.getElementById("tel").value;
        let email = document.getElementById("email").value;
        let message = document.getElementById("msg").value;

        //Création de l'objet
        //Creation of the object
        let contact = new Contact(nom, numero, email, message);
        console.log(contact);

        // Sauvegarder dans localstorage 
        // Save to localStorage
        const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
        contacts.push(contact);
        localStorage.setItem("contacts", JSON.stringify(contacts));

        form.reset();
        alert("Message envoyé avec succés !");
    })
}

envoieMessage();