// Le site ne dispose pas d'une intégration de paiement sécurisée.
// The site does not have a secure payment integration.
function envoiePaiement() {
    const form = document.getElementById("envoie-paiement");
    if (!form) return;
    localStorage.removeItem("paiements");
    afficherResumeReservation();
    const numero = document.getElementById("numero");
    const erreurNumero = document.getElementById("numero-erreur");

    if (numero && erreurNumero) {
        numero.addEventListener("input", () => {
            erreurNumero.hidden =
                numero.value === "" || /^[0-9]{16}$/.test(numero.value);
        });

        numero.addEventListener("invalid", () => {
            erreurNumero.hidden = false;
        });
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        form.reset();
        if (erreurNumero) erreurNumero.hidden = true;
        const message = document.getElementById("paiement-message");
        if (message) {
            message.textContent =
                "Démonstration uniquement : aucun paiement n'a été effectué ni enregistré.";
        }
    });
}
//Récupère les informations de la réservation pour la page paiement / //Retrieve the reservation information for the payment page
function afficherResumeReservation() {
    const zones = {
        hotel: document.getElementById("resume-hotel"),
        chambre: document.getElementById("resume-chambre"),
        dates: document.getElementById("resume-dates"),
        identifiant: document.getElementById("resume-identifiant"),
        montant: document.getElementById("resume-montant")
    };
    let reservation = null;
    try {
        reservation = JSON.parse(localStorage.getItem("derniereReservation"));
    } catch (erreur) {
        localStorage.removeItem("derniereReservation");
        const message = document.getElementById("paiement-message");
        if (message) message.textContent = "Le récapitulatif de réservation est illisible.";
        return;
    }

    if (!reservation) return;
    if (
        typeof reservation.hotel !== "string" ||
        typeof reservation.chambre !== "string" ||
        typeof reservation.id !== "string" ||
        typeof reservation.arrivee !== "string" ||
        typeof reservation.depart !== "string" ||
        !Number.isFinite(Number(reservation.montant))
    ) {
        const message = document.getElementById("paiement-message");
        if (message) message.textContent = "Le récapitulatif de réservation est incomplet.";
        return;
    }
    if (zones.hotel) zones.hotel.textContent = "Hôtel : " + reservation.hotel;
    if (zones.chambre) zones.chambre.textContent = "Chambre : " + reservation.chambre;
    if (zones.dates) {
        zones.dates.textContent =
            dateFrancaise(reservation.arrivee) + " au " + dateFrancaise(reservation.depart);
    }
    if (zones.identifiant) zones.identifiant.textContent = "Réservation : " + reservation.id;
    if (zones.montant) zones.montant.textContent = montantEuros(reservation.montant);
}

envoiePaiement();