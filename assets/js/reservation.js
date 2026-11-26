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
 
// //Fonction pour ajouter une réservation
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
let moisAffichePlanning = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let periodesOccupeesPlanning = [];
let versionChargementPlanning = 0;
let versionVerificationPlanning = 0;

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
    reinitialiserPlanning();
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

// Convertit une date locale en chaîne ISO sans décalage de fuseau horaire.
// Converts a local date to an ISO string without a timezone shift.
function datePlanningISO(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" +
        String(date.getDate()).padStart(2, "0");
}

// Ajoute un nombre de jours à une date ISO pour calculer la date minimale de départ.
// Adds a number of days to an ISO date to calculate the earliest departure date.
function ajouterJoursPlanning(dateISO, nombreJours) {
    const morceaux = dateISO.split("-").map(Number);
    const date = new Date(morceaux[0], morceaux[1] - 1, morceaux[2]);
    date.setDate(date.getDate() + nombreJours);
    return datePlanningISO(date);
}

// Interroge l'API avec une plage de dates et récupère uniquement les périodes occupées.
// Queries the API for a date range and retrieves only occupied periods.
async function demanderPeriodesOccupees(idHotel, idChambre, debut, fin) {
    const chemin = "/disponibilites/" + encodeURIComponent(idHotel) + "/" + encodeURIComponent(idChambre);
    const parametres = "?debut=" + encodeURIComponent(debut) + "&fin=" + encodeURIComponent(fin);
    return appelerAPI(chemin + parametres);
}

// Masque et vide le planning lorsqu'aucune chambre n'est sélectionnée.
// Hides and clears the calendar when no room is selected.
function reinitialiserPlanning() {
    versionChargementPlanning += 1;
    versionVerificationPlanning += 1;
    periodesOccupeesPlanning = [];
    document.getElementById("planning-chambre").hidden = true;
    document.getElementById("planning-calendrier").replaceChildren();
    document.getElementById("planning-message").textContent = "";
}

// Affiche les jours du mois et distingue les nuits occupées des nuits disponibles.
// Renders the days of the month and distinguishes occupied from available nights.
function afficherCalendrierPlanning() {
    const calendrier = document.getElementById("planning-calendrier");
    const arrivee = document.getElementById("arrivee").value;
    const depart = document.getElementById("depart").value;
    const premierJour = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth(), 1);
    const nombreJours = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth() + 1, 0).getDate();
    const decalage = (premierJour.getDay() + 6) % 7;
    const aujourdhui = aujourdhuiISO();
    const nomsJours = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

    calendrier.replaceChildren();
    nomsJours.forEach(function (nomJour) {
        const entete = document.createElement("span");
        entete.className = "planning-jour-entete";
        entete.textContent = nomJour;
        calendrier.appendChild(entete);
    });

    for (let index = 0; index < decalage; index += 1) {
        const espace = document.createElement("span");
        espace.className = "planning-case-vide";
        espace.setAttribute("aria-hidden", "true");
        calendrier.appendChild(espace);
    }

    for (let jour = 1; jour <= nombreJours; jour += 1) {
        const dateJour = datePlanningISO(new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth(), jour));
        const estOccupe = periodesOccupeesPlanning.some(function (periode) {
            const dateArrivee = String(periode.date_arrivee).slice(0, 10);
            const dateDepart = String(periode.date_depart).slice(0, 10);
            return dateJour >= dateArrivee && dateJour < dateDepart;
        });
        const peutEtreDepart = arrivee !== "" && depart === "" && dateJour > arrivee;
        const bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "planning-jour";
        bouton.textContent = String(jour);
        bouton.disabled = dateJour < aujourdhui || (estOccupe && !peutEtreDepart);
        bouton.setAttribute("aria-pressed", String(dateJour === arrivee || dateJour === depart));

        if (estOccupe) bouton.classList.add("planning-jour-occupe");
        if (dateJour === arrivee || dateJour === depart) bouton.classList.add("planning-jour-selectionne");
        if (dateJour < aujourdhui) bouton.classList.add("planning-jour-passe");

        const dateLisible = new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric"
        }).format(new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth(), jour));
        const statut = estOccupe
            ? (peutEtreDepart ? "nuit occupée, sélectionnable comme date de départ" : "nuit occupée")
            : "nuit disponible";
        bouton.setAttribute("aria-label", dateLisible + " : " + statut);
        bouton.addEventListener("click", function () {
            choisirDatePlanning(dateJour, estOccupe);
        });
        calendrier.appendChild(bouton);
    }

    const moisActuel = new Date();
    moisActuel.setDate(1);
    document.getElementById("planning-precedent").disabled = premierJour <= moisActuel;
}

// Charge les périodes du mois sélectionné et affiche le calendrier de la chambre.
// Loads the selected month's occupied periods and displays the room calendar.
async function chargerPlanning() {
    const idHotel = document.getElementById("hotel").value;
    const idChambre = document.getElementById("chambre").value;
    const zonePlanning = document.getElementById("planning-chambre");
    versionVerificationPlanning += 1;
    if (idHotel === "" || idChambre === "") {
        reinitialiserPlanning();
        return;
    }

    zonePlanning.hidden = false;
    const debut = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth(), 1);
    const fin = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth() + 1, 1);
    document.getElementById("planning-mois").textContent = new Intl.DateTimeFormat("fr-FR", {
        month: "long",
        year: "numeric"
    }).format(debut);
    document.getElementById("planning-message").textContent = "Chargement des disponibilités…";
    document.getElementById("planning-calendrier").replaceChildren();

    const version = ++versionChargementPlanning;
    const resultat = await demanderPeriodesOccupees(
        idHotel,
        idChambre,
        datePlanningISO(debut),
        datePlanningISO(fin)
    );
    if (version !== versionChargementPlanning) return;

    if (!resultat.ok) {
        document.getElementById("planning-message").textContent = messageErreur(resultat);
        return;
    }

    periodesOccupeesPlanning = resultat.donnees;
    document.getElementById("planning-message").textContent =
        "Choisissez une date d'arrivée disponible, puis une date de départ.";
    afficherCalendrierPlanning();
}

// Choisit l'arrivée puis vérifie côté serveur que tout le séjour est libre.
// Selects the arrival date, then checks with the server that the whole stay is available.
async function choisirDatePlanning(dateChoisie, estOccupee) {
    const champArrivee = document.getElementById("arrivee");
    const champDepart = document.getElementById("depart");
    const message = document.getElementById("planning-message");
    const version = ++versionVerificationPlanning;

    if (champArrivee.value === "" || champDepart.value !== "" || dateChoisie <= champArrivee.value) {
        if (estOccupee) {
            message.textContent = "Cette nuit est occupée. Choisissez une autre date d'arrivée.";
            return;
        }
        champArrivee.value = dateChoisie;
        champDepart.value = "";
        champDepart.min = ajouterJoursPlanning(dateChoisie, 1);
        message.textContent = "Arrivée sélectionnée. Choisissez une date de départ.";
        afficherCalendrierPlanning();
        return;
    }

    message.textContent = "Vérification des dates sélectionnées…";
    const resultat = await demanderPeriodesOccupees(
        document.getElementById("hotel").value,
        document.getElementById("chambre").value,
        champArrivee.value,
        dateChoisie
    );
    if (version !== versionVerificationPlanning) return;

    if (!resultat.ok) {
        message.textContent = messageErreur(resultat);
        return;
    }
    if (resultat.donnees.length > 0) {
        message.textContent = "Cette période chevauche une réservation. Choisissez d'autres dates.";
        return;
    }

    champDepart.value = dateChoisie;
    message.textContent = "Séjour disponible du " + champArrivee.value + " au " + dateChoisie + ".";
    afficherCalendrierPlanning();
}

// Vérifie les dates saisies manuellement et informe le client si elles sont déjà occupées.
// Checks manually entered dates and tells the customer if they are already occupied.
async function verifierDatesPlanning() {
    const arrivee = document.getElementById("arrivee").value;
    const depart = document.getElementById("depart").value;
    const idHotel = document.getElementById("hotel").value;
    const idChambre = document.getElementById("chambre").value;
    const version = ++versionVerificationPlanning;
    if (!arrivee || !depart || !idHotel || !idChambre || depart <= arrivee) return;

    const message = document.getElementById("planning-message");
    message.textContent = "Vérification des dates sélectionnées…";
    const resultat = await demanderPeriodesOccupees(idHotel, idChambre, arrivee, depart);
    if (version !== versionVerificationPlanning) return;

    if (!resultat.ok) {
        message.textContent = messageErreur(resultat);
    } else if (resultat.donnees.length > 0) {
        message.textContent = "Cette période chevauche une réservation. Choisissez d'autres dates.";
    } else {
        message.textContent = "Les dates sélectionnées sont disponibles.";
    }
}

//Fonction pour prendre en compte la réservation
//Function to process the reservation
function reserver() {
    const form = document.getElementById("reservationForm");
    if (!form) return;

    //permet de récupérer les informations lors de la connexion
    //allows for retrieving information during login
    const moi = utilisateurConnecte();
    const zoneCompte = document.getElementById("reservation-compte");
    if (zoneCompte) {
        if (moi === null) {
            zoneCompte.textContent = "Vous devez etre connecté pour reserver";
        } else if (moi.role !== "client") {
            zoneCompte.textContent = "Seuls les comptes clients peuvent reserver";
        } else {
            zoneCompte.textContent = "Reservation au nom de " + moi.prenom + " " + moi.nom;
        }
    }

    //permet de ne pas choisir une date déjà passée
    //prevents selecting a date that has already passed
    const aujourdhui = aujourdhuiISO();
    document.getElementById("arrivee").min = aujourdhui;
    document.getElementById("depart").min = aujourdhui;

    chargerHotels();

    //permet de recharger les chambres si l'hôtel est changé
    //allows for reloading the rooms if the hotel is changed
    document.getElementById("hotel").addEventListener("change", function (event) {
        chargerChambres(event.target.value);
    });

    document.getElementById("chambre").addEventListener("change", function (event) {
        if (event.target.value === "") {
            reinitialiserPlanning();
            return;
        }
        const arrivee = document.getElementById("arrivee").value;
        if (arrivee) {
            const morceaux = arrivee.split("-").map(Number);
            moisAffichePlanning = new Date(morceaux[0], morceaux[1] - 1, 1);
        }
        chargerPlanning().then(verifierDatesPlanning);
    });

    document.getElementById("planning-precedent").addEventListener("click", function () {
        moisAffichePlanning = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth() - 1, 1);
        chargerPlanning();
    });

    document.getElementById("planning-suivant").addEventListener("click", function () {
        moisAffichePlanning = new Date(moisAffichePlanning.getFullYear(), moisAffichePlanning.getMonth() + 1, 1);
        chargerPlanning();
    });

    document.getElementById("arrivee").addEventListener("change", function (event) {
        const depart = document.getElementById("depart");
        depart.min = event.target.value ? ajouterJoursPlanning(event.target.value, 1) : aujourdhui;
        if (depart.value && depart.value < depart.min) depart.value = "";
        if (event.target.value) {
            const morceaux = event.target.value.split("-").map(Number);
            moisAffichePlanning = new Date(morceaux[0], morceaux[1] - 1, 1);
        }
        chargerPlanning().then(verifierDatesPlanning);
    });

    document.getElementById("depart").addEventListener("change", verifierDatesPlanning);

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const utilisateur = utilisateurConnecte();
        if (utilisateur === null) {
            alert("Vous devez etre connecté pour reserver");
            window.location.href = PAGE_CONNEXION;
            return;
        }

        if (utilisateur.role !== "client") {
            alert("Seuls les comptes clients peuvent reserver");
            return;
        }

        const idHotel = valeurChamp("hotel");
        const idChambre = valeurChamp("chambre");
        const arrivee = valeurChamp("arrivee");
        const depart = valeurChamp("depart");

        const chambre = chambresDisponibles.find(c => c.chambre === idChambre);

        if (idHotel === "" || idChambre === "" || chambre === undefined) {
            alert("Veuillez choisir un hotel et une chambre !");
            return;
        }

        //permet de maintenir la cohérence entre la date d'arrivée et la date de départ
        //ensures consistency between arrival date and departure date
        const nuits = (new Date(depart) - new Date(arrivee)) / 86400000;
        if (!(nuits > 0)) {
            alert("La date de départ doit etre apres la date d'arrivee !");
            return;
        }

        const resultat = await appelerAPI("/reservations", "POST", {
            date_arrivee: arrivee,
            date_depart: depart,
            nombre_adulte: Number(valeurChamp("nbr_adulte")),
            nombre_enfant: Number(valeurChamp("nbr_enfant")) || 0,
            chambre: idChambre,
            hotel: idHotel,
        });

        if (!resultat.ok) {
            const erreur = messageErreur(resultat);
            alert(erreur); // chambre deja reservée // room already reserved
            if (resultat.statut === 409) {
                await chargerPlanning();
                document.getElementById("planning-message").textContent = erreur;
            }
            return;
        }

        const resume = {
            id: resultat.donnees.reservation,
            montant: resultat.donnees.montant_total,
            hotel: document.querySelector("#hotel option:checked").textContent,
            chambre: chambre.type || ("Chambre " + chambre.chambre),
            arrivee: arrivee,
            depart: depart
        };
        localStorage.setItem("derniereReservation", JSON.stringify(resume));

        form.reset();
        chargerChambres("");

        document.getElementById("message").textContent = "Réservation enregistrée ! Redirection vers la page de paiement...";
        setTimeout(function () {
            window.location.href = "paiement.html";
        }, 2000);
    });
}

reserver();

