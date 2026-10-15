// //Faire fonction ajouter chambre pour la page ajout chambre 
class Contact {
    constructor(nom, numero, email, message) {
        this.nom =nom;
        this.numero=numero;
        this.email=email;
        this.message=message;
    }
}

//Fonction pour envoyer un message
function envoieMessage() {
    const form = document.getElementById("envoie-message");
    console.log(form);

    form.addEventListener("submit", function(event){
        event.preventDefault(); //Annuler le rechargement automatique de la page

        let nom = document.getElementById("nom").value;
        let numero = document.getElementById("tel").value;
        let email = document.getElementById("email").value;
        let message = document.getElementById("msg").value;

        //Création de l'objet
        let contact = new Contact(nom, numero, email, message);
        console.log(contact);

        // Sauvegarder dans localstorage
        const contacts = JSON.parse(localStorage.getItem("contacts")) || [];
        contacts.push(contact);
        localStorage.setItem("contacts", JSON.stringify(contacts));

        form.reset();
        alert("Message envoyé avec succés !");
    })
}

envoieMessage();