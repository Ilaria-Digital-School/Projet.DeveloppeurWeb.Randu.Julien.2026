// //Sauvegarde dans le local storage les informations du formulaire de paiement 
class Paiement {
    constructor(carte, numero, nom, expiration, cvv) {
        this.carte = carte;
        this.numero = numero;
        this.nom = nom;
        this.expiration = expiration;
        this.cvv = cvv;
    }
}

//Fonction pour envoyer un message
function envoiePaiement() {
    const form = document.getElementById("envoie-paiement");
    console.log(form);
    const numero = document.getElementById("numero");
    const erreurNumero = document.getElementById("numero-erreur");

    numero.addEventListener("input", () => {
        erreurNumero.hidden =
            numero.value === "" || /^[0-9]{16}$/.test(numero.value);
    });

    numero.addEventListener("invalid", () => {
        erreurNumero.hidden = false;
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault(); //Annuler le rechargement automatique de la page

        let carte = document.getElementById("carte").value;
        let numero = document.getElementById("numero").value;
        let nom = document.getElementById("nom").value;
        let expiration = document.getElementById("expiration").value;
        let cvv = document.getElementById("cvv").value;

        //Création de l'objet
        let paiement = new Paiement(carte, numero, nom, expiration, cvv);
        console.log(paiement);

        // Sauvegarder dans localstorage
        const paiements = JSON.parse(localStorage.getItem("paiements")) || [];
        paiements.push(paiement);
        localStorage.setItem("paiements", JSON.stringify(paiements));

        form.reset();
        alert("Paiement enregistré avec succès !");
    })
}

envoiePaiement();