class Reservation {
    constructor(nom, prenom, numero, email, hotel, nbr_adulte, nbr_enfant, chambre, msg) {
        this.nom = nom;
        this.prenom = prenom;
        this.numero = numero;
        this.email = email;
        this.hotel = hotel;
        this.nbr_adulte = nbr_adulte;
        this.nb_enfant = nbr_enfant;
        this.chambre = chambre;
        this.msg = msg;
    }
}

//Fonction pour ajouter une reservation
function reserver() {
    const form = document.getElementById("reservationForm");
    console.log(form);

    form.addEventListener("submit", function (event) {
        event.preventDefault(); //Annuler le rechargement automatique de la page

        let nom = document.getElementById("nom").value;
        let prenom = document.getElementById("prenom").value;
        let numero = document.getElementById("tel").value;
        let email = document.getElementById("email").value;
        let hotel = document.getElementById("hotel").value;
        let nbr_adulte = document.getElementById("nbr_adulte").value;
        let nbr_enfant = document.getElementById("nbr_enfant").value;
        let chambre = document.getElementById("chambre").value;
        let msg = document.getElementById("msg").value;


        //Création de l'objet
        let reservation = new Reservation(nom, prenom, numero, email, hotel, nbr_adulte, nbr_enfant, chambre, msg);
        console.log(reservation);

        // Sauvegarder dans localstorage
        let reservations= JSON.parse(localStorage.getItem("reservation")) || [];
        // Si l'ancienne donnée n'est pas un tableau, on la met dans un tableau
        if (!Array.isArray(reservations)) {
            reservations = [reservations];
        }
        reservations.push(reservation);
        localStorage.setItem("reservation", JSON.stringify(reservations));

        form.reset();


        document.getElementById("message").textContent = "Réservation enregistrée ! Redirection vers la page de paiement...";
        setTimeout(function () {
            window.location.href = "paiement.html";
        }, 2000);
    })

}

reserver();