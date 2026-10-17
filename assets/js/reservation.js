// Classique pour enregistrement dans le localstorage 

//class Reservation {
//     constructor(nom, prenom, numero, email, hotel, nbr_adulte, nbr_enfant, chambre, msg) { 
//         this.nom = nom;
//         this.prenom = prenom;
//         this.numero = numero;
//         this.email = email;
//         this.hotel = hotel;
//         this.nbr_adulte = nbr_adulte;
//         this.nb_enfant = nbr_enfant;
//         this.chambre = chambre;
//         this.msg = msg;
//     }
// }
 
// //Fonction pour ajouter une reservation
// function reserver() {
//     const form = document.getElementById("reservationForm");
//     console.log(form);

//     form.addEventListener("submit", function (event) {
//         event.preventDefault(); //Annuler le rechargement automatique de la page

//         let nom = document.getElementById("nom").value;
//         let prenom = document.getElementById("prenom").value;
//         let numero = document.getElementById("tel").value;
//         let email = document.getElementById("email").value;
//         let hotel = document.getElementById("hotel").value;
//         let nbr_adulte = document.getElementById("nbr_adulte").value;
//         let nbr_enfant = document.getElementById("nbr_enfant").value;
//         let chambre = document.getElementById("chambre").value;
//         let msg = document.getElementById("msg").value;


//         //Création de l'objet
//         let reservation = new Reservation(nom, prenom, numero, email, hotel, nbr_adulte, nbr_enfant, chambre, msg);
//         console.log(reservation);

//         // Sauvegarder dans localstorage
//         let reservations= JSON.parse(localStorage.getItem("reservation")) || [];
//         // Si l'ancienne donnée n'est pas un tableau, on la met dans un tableau
//         if (!Array.isArray(reservations)) {
//             reservations = [reservations];
//         }
//         reservations.push(reservation);
//         localStorage.setItem("reservation", JSON.stringify(reservations));

//         form.reset();


//         document.getElementById("message").textContent = "Réservation enregistrée ! Redirection vers la page de paiement...";
//         setTimeout(function () {
//             window.location.href = "paiement.html";
//         }, 2000);
//     })

// }

// reserver();

let chambresDisponibles = [];

async function chargerHotels() {
    const liste = document.getElementById("hotel");
    liste.innerHTML = "";
    liste.appendChild(new Option("Votre selection", ""));

    const resultat = await appelerAPI("/hotels");
    if (!resultat.ok) {
        alert(messageErreur(resultat));
        return;
    }

    resultat.donnees.forEach(h => liste.appendChild(new Option(h.nom, h.hotel)));

}

async function chargerChambres(idHotel) {
    const liste = document.getElementById("chambre");
    liste.innerHTML = "";
    liste.appendChild(new Option("Votre Chambre", ""));
    chambresDisponibles = [];

    if (idHotel === "") return;

    const resultat = await appelerAPI("/chambres/" + encodeURIComponent(idHotel));
    if (!resultat.ok) {
        alert(messageErreur(resultat));
        return;
    }

    chambresDisponibles = resultat.donnees;
    chambresDisponibles.forEach(c => {
        const nom = c.type || ("chambre " + c.chambre);
        liste.appendChild(new Option(nom + " - " + c.tarif + " € / nuit", c.chambre));
    });
}

//Fonction pour prendre en compte la reservation
function reserver() {
    const form = document.getElementById("reservationForm");
    if (!form) return;
    //permets de recuperer les informations lors de la connexion
    const moi = utilisateurConnect();
    const zoneCompte = document.getElementById("reservation-compte");
    if (zoneCompte) {
        zoneCompte.textContent = moi
            ? "Réservation au nom de " + moi.prenom + " " + moi.nom
            : "Vous devez être connecté pour réserver.";
    }

    //permets de ne pas choisir une date deja passée
    const aujourdhui = new Date().toISOString().slice(0, 10);
    document.getElementById("arrivee").min = aujourdhui;
    document.getElementById("depart").min = aujourdhui;

    chargerHotels();

    //permets de recharger les chambres si on change d'hotel
    document.getElementById("hotel").addEventListener("change", function (event) {
        chargerChambres(event.target.value);
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const utilisateur = utilisateurConnect();
        if (utilisateur === null) {
            alert("Vous devez etre connecté pour reserver");
            window.location.href = PAGE_CONNEXION;
            return;
        }

        const idHotel = document.getElementById("hotel").value;
        const idChambre = document.getElementById("chambre").value;
        const arrivee = document.getElementById("arrivee").value;
        const depart = document.getElementById("depart").value;

        const chambre = chambresDisponibles.find(c => c.chambre === idChambre);

        if (idHotel === "" || idChambre === "" || chambre === undefined) {
            alert("Veuillez choisir un hotel et une chambre !");
            return;
        }

        //permets la cohérence entre date d'arrivee et date de depart
        const nuits = (new Date(depart) - new Date(arrivee)) / 86400000;
        if (!(nuits > 0)) {
            alert("La date de départ doit etre apres la date d'arrivee !");
            return;
        }

        //permets de calculer le montant que le client devra payer (a verifier)
        const montant = Math.round(nuits * Number(chambre.tarif) * 100) / 100;

        const idReservation = "R" + Date.now();

        const resultat = await appelerAPI("/reservations", "POST", {
            reservation: idReservation,
            date_arrivee: arrivee,
            date_depart: depart,
            nombre_adulte: Number(document.getElementById("nbr_adulte").value),
            nombre_enfant: Number(document.getElementById("nbr_enfant").value),
            montant_total: montant,
            statut: "en attente",
            chambre: idChambre,
            hotel: idHotel,
            utilisateurs: utilisateur.id
        });

        if (!resultat.ok) {
            alert(messageErreur(resultat)); // chambre deja reservée
            return;
        }

        //pour la page paiement
        localStorage.setItem("derniereReservation", JSON.stringify({ id: idReservation, montant: montant }));

        form.reset();
        chargerChambres("");

        document.getElementById("message").textContent = "Réservation enregistrée ! Redirection vers la page de paiement...";
        setTimeout(function () {
            window.location.href = "paiement.html";
        }, 2000);
    });
}

reserver();

