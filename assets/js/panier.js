function ajouterDetailReservation(carte, libelle, valeur) {
    const ligne = document.createElement("p");
    const etiquette = document.createElement("strong");
    etiquette.textContent = libelle + " : ";
    ligne.appendChild(etiquette);
    ligne.appendChild(document.createTextNode(valeur));
    carte.appendChild(ligne);
}
// permets au client d'interagir avec ses reservations / // allows the client to interact with their reservations
function afficherReservations(reservations) {
    const liste = document.getElementById("liste-reservations");
    liste.replaceChildren();

    if (reservations.length === 0) {
        liste.textContent = "Vous n'avez pas encore de réservation.";
        return;
    }

    reservations.forEach(function (reservation) {
        const carte = document.createElement("article");
        carte.className = "reservation-client-carte";

        const titre = document.createElement("h3");
        titre.textContent = reservation.hotel_nom || "Hôtel";
        carte.appendChild(titre);

        ajouterDetailReservation(carte, "Chambre", reservation.chambre_type || "Non précisée");
        ajouterDetailReservation(
            carte,
            "Séjour",
            dateFrancaise(reservation.date_arrivee) + " au " + dateFrancaise(reservation.date_depart)
        );
        ajouterDetailReservation(
            carte,
            "Voyageurs",
            reservation.nombre_adulte + " adulte(s), " + reservation.nombre_enfant + " enfant(s)"
        );
        ajouterDetailReservation(carte, "Montant", montantEuros(reservation.montant_total));
        ajouterDetailReservation(carte, "Statut", libelleStatut(reservation.statut));

        if (reservation.statut !== "annulee") {
            const actions = document.createElement("div");
            actions.className = "reservation-actions";

            const boutonAnnuler = document.createElement("button");
            boutonAnnuler.type = "button";
            boutonAnnuler.className = "btn btn-danger";
            boutonAnnuler.textContent = "Annuler la réservation";
            boutonAnnuler.addEventListener("click", function () {
                annulerReservation(reservation.reservation, boutonAnnuler);
            });
            actions.appendChild(boutonAnnuler);
            carte.appendChild(actions);
        }

        liste.appendChild(carte);
    });
}

async function chargerReservations() {
    const liste = document.getElementById("liste-reservations");
    const message = document.getElementById("message-reservations");
    liste.textContent = "Chargement des réservations...";

    const resultat = await appelerAPI("/reservations");
    if (!resultat.ok) {
        message.textContent = messageErreur(resultat);
        liste.replaceChildren();
        if (resultat.statut === 401) window.location.href = PAGE_CONNEXION;
        return;
    }

    if (!Array.isArray(resultat.donnees)) {
        message.textContent = "La réponse du serveur ne contient pas une liste de réservations.";
        liste.replaceChildren();
        return;
    }

    afficherReservations(resultat.donnees);
}

async function annulerReservation(identifiant, bouton) {
    if (!window.confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    bouton.disabled = true;
    const message = document.getElementById("message-reservations");
    message.textContent = "";

    const resultat = await appelerAPI(
        "/reservations/" + encodeURIComponent(identifiant),
        "PATCH",
        { statut: "annulee" }
    );

    if (!resultat.ok) {
        message.textContent = messageErreur(resultat);
        bouton.disabled = false;
        return;
    }

    message.textContent = "La réservation a bien été annulée.";
    await chargerReservations();
}

document.addEventListener("DOMContentLoaded", chargerReservations);
