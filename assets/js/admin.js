let donnees = { hotels: [], chambres: [], reservations: [], utilisateurs: [] };

const CHAMPS_HOTEL = [
    {nom: "nom", libelle: "Nom" },
    {nom: "nombre_etoiles", libelle: "Etoiles (1 à 5)", type: "number", min: 1, max: 5, numerique: true },
    {nom: "description", libelle: "Description", type: "textarea" },
    {nom: "adresse", libelle: "Adresse" },
    {nom: "code_postale", libelle: "Code Postal" },
    {nom: "ville", libelle: "Ville" },
    {nom: "pays", libelle: "Pays" },
    {nom: "image", libelle: "Image (chemin)" }    
];

const CHAMPS_CHAMBRE = [
    {nom: "numero", libelle: "Numéro" },
    {nom: "type", libelle: "Type" },
    {nom: "capacite", libelle: "Capacité (1 à 10)", type: "number", min: 1, max: 10, numerique: true },
    {nom: "tarif", libelle: "Tarif par nuit (€)", type: "number", min: 0, step: "0.01", numerique: true },
    {nom: "description", libelle: "Description", type: "textarea" },
    {nom: "image", libelle: "Image (chemin)" } 
];

const CHAMPS_RESERVATION = [
    {nom: "date_arrivee", libelle: "Arrivée", type: "date" },
    {nom: "date_depart", libelle: "Départ", type: "date" },
    {nom: "nombre_adulte", libelle: "Adultes (1 à 10)", type: "number", min: 1, max: 10, numerique: true },
    {nom: "nombre_enfant", libelle: "Enfants (0 à 10)", type: "number", min: 0, max: 10, numerique: true },
    {nom: "statut", libelle: "Statut", options: [
        {valeur: "en attente", texte: "En attente" },
        {valeur: "confirmee", texte: "Confirmée" },
        {valeur: "annulee", texte: "Annulée" },
        {valeur: "reserver", texte: "Réservée (ancienne donnée)" },
        {valeur: "en cours de traitement", texte: "En cours de traitement (ancienne donnée)"}
    ] },
    {nom: "montant_total", libelle: "Montant Total (€) : recalculé en fonction des dates selectionnées", type: "number", min: 0, step: "0.01", numerique: true }
];

// outils d'affichage 

function tableau(entetes, lignes) {
    const table = creerElement("table", "", "table table-striped");
    const enteteLigne = document.createElement("tr");
    entetes.forEach(titre => enteteLigne.appendChild(cellule(titre, "th")));
    table.appendChild(enteteLigne);
    lignes.forEach(function (cellules) {
        const ligne = document.createElement("tr");
        cellules.forEach(contenu => ligne.appendChild(cellule(contenu)));
        table.appendChild(ligne);
    });
    return table;
}

function rangeeActions(...boutons) {
    const div = document.createElement("div");
    boutons.forEach(b => div.appendChild(b));
    return div;
}

function afficherDans(id, element) {
    const zone = document.getElementById(id);
    zone.innerHTML = "";
    zone.appendChild(element);
}

function nomPrestataire(h) {
    if (!h.prestataire) return "Aucun (hôtel ajouté avant les prestataires)";
    return (h.prestataire_prenom || "") + " " + (h.prestataire_nom || "") + " (" + (h.prestataire_email || "") + ")";
}

//formulaire de modification, identique que dans reservation, chambre et hotel 

function ouvrirEdition(titre, champs, valeurs, enregistrer) {
    const zone = document.getElementById("admin-edition");
    zone.innerHTML = "";

    const form = document.createElement("form");
    form.appendChild(creerElement("h3", titre));
    const saisies = {};

    champs.forEach(function (champ) {
        let saisie;
        if (champ.options) {
            saisie = document.createElement("select");
            champ.options.forEach(o => saisie.appendChild(new Option(o.texte, o.valeur)));
        } else if (champ.type === "textarea") {
            saisie = document.createElement("textarea");
        } else {
            saisie = document.createElement("input");
            saisie.type = champ.type || "text";
            if (champ.min !== undefined) saisie.min = champ.min;
            if (champ.max !== undefined) saisie.max = champ.max;
            if (champ.step !== undefined) saisie.step = champ.step;
        }
        saisie.id = "edition" + champ.nom;
        saisie.value = valeurs[champ.nom] === null || valeurs[champ.nom] === undefined ? "" : valeurs[champ.nom];
        saisies[champ.nom] = saisie;

        const etiquette = creerElement("label", champ.libelle + " ");
        etiquette.htmlFor = saisie.id;
        const bloc= document.createElement("div");
        bloc.appendChild(etiquette);
        bloc.appendChild(saisie);
        form.appendChild(bloc);
    });
    const valider = creerElement("button", "Enregistrer", "btn btn-success");
    valider.type = "submit";
    const fermer = creerElement("button", "Fermer", "btn btn-secondary");
    fermer.type = "button";
    fermer.addEventListener("click", () => { zone.innerHTML = ""; });
    form.appendChild(valider);
    form.appendChild(fermer);

    form.addEventListener("submit", async function (evenement) {
        evenement.preventDefault();

        const modifs = {};
        champs.forEach(function (champ) {
            const texte = saisies[champ.nom].value;
            const valeur = champ.numerique ? Number(texte) : texte.trim();
            if (valeur !== valeurs[champ.nom]) modifs[champ.nom] = valeur;
        });
        if (Object.keys(modifs).length ===0) {
            alert("Aucune Modification !");
            return;
        }
        const resultat = await enregistrer(modifs);
        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }
        zone.innerHTML = "";
        alert("Modification Enregistrée !");
        await chargerTout();
    });
    zone.appendChild(form);
    zone.scrollIntoView();
}

async function supprimer(question, chemin) {
    if (!confirm(question)) return;
    const resultat = await appelerAPI(chemin, "DELETE");
    if (!resultat.ok) {
        alert(messageErreur(resultat));
        return;
    }
    await chargerTout();
}

//affichage des listes  
//displaying the lists
function afficherHotels() {
    const lignes = donnees.hotels.map(function (h) {
        return [h.hotel, h.nom, h.ville, String(h.nombre_etoiles), nomPrestataire(h),
            rangeeActions(
                boutonAction("Modifier", "btn-primary", () => ouvrirEdition("Modifier l'hôtel " + h.hotel, CHAMPS_HOTEL, h,
                    modifs => appelerAPI("/hotels/" + encodeURIComponent(h.hotel), "PATCH", modifs))),
                boutonAction("supprimer", "btn-danger", () => supprimer("supprimer l'hôtel << " + h.nom + " >> ?", "/hotels/" + encodeURIComponent(h.hotel))))];
    });
    afficherDans("admin-hotels", tableau(["Id", "Nom", "Ville", "Etoiles", "Ajouté par", "Actions"], lignes));
}

function afficherChambres() {
    const nomsHotels = {};
    donnees.hotels.forEach(h => { nomsHotels[h.hotel] = h.nom; });

    const lignes = donnees.chambres.map(function (c) {
        const chemin = "/chambres/" + encodeURIComponent(c.hotel) + "/" + encodeURIComponent(c.chambre);
        return [nomsHotels[c.hotel] || c.hotel, c.chambre, c.numero, c.type, String(c.capacite), montantEuros(c.tarif),
            rangeeActions(
                boutonAction("Modifier", "btn-primary", () => ouvrirEdition("Modifier la chambre " + c.chambre + " de l'hôtel " + (nomsHotels[c.hotel] || c.hotel), CHAMPS_CHAMBRE, c,
            modifs => appelerAPI(chemin, "PATCH", modifs))),
            boutonAction("supprimer", "btn-danger", () => supprimer("supprimer la chambre " + c.chambre + " ?", chemin)))];
    });
    afficherDans("admin-chambres", tableau(["Hôtel", "Chambre", "N°", "Type", "Capacité", "Tarif / nuit", "Actions"], lignes));
}

function afficherReservation() {
    const lignes = donnees.reservations.map(function (r) {
        const chemin = "/reservations/" + encodeURIComponent(r.reservation);
        const client = r.client_prenom + " " + r.client_nom + " (" + r.client_email + ")";
        const personnes = r.nombre_adulte + " ad." + (r.nombre_enfant > 0 ? " + " + r.nombre_enfant + " enf." : "");
        return [client, r.hotel_nom + " - " + (r.chambre_type || r.chambre), dateFrancaise(r.date_arrivee) + " au " + dateFrancaise(r.date_depart),
            personnes, montantEuros(r.montant_total), libelleStatut(r.statut),
            rangeeActions(
                boutonAction("Modifier", "btn-primary", () => ouvrirEdition("Modifier la reservation de " + client, CHAMPS_RESERVATION, r,
                    modifs => appelerAPI(chemin, "PATCH", modifs))),
                    boutonAction("Supprimer", "btn-danger", () => supprimer("supprimer la reservation de " + client + " ?", chemin)))];
    });
    afficherDans("admin-reservations", tableau(["Client", "Hôtel et Chambre", "Séjour", "Personnes", "Montant", "Statut", "Actions"], lignes));
}

function afficherUtilisateurs() {
    const lignes = donnees.utilisateurs.map(u => [u.prenom + " " + u.nom, u.email, u.telephone, u.role]);
    afficherDans("admin-utilisateurs", tableau(["Nom", "Email", "Téléphone", "Rôle"], lignes));
}

//Chargement 

//Loading

async function chargerTout() {
    const [hotels, chambres, reservations, utilisateurs] = await Promise.all([
        appelerAPI("/mes-hotels"), appelerAPI("/chambres"), appelerAPI("/reservations"), appelerAPI("/utilisateurs")
    ]);

    for (const resultat of [hotels, chambres, reservations, utilisateurs]) {
        if (!resultat.ok) {
            alert(messageErreur(resultat));
            if (resultat.statut === 401) window.location.href = PAGE_CONNEXION;
            return;
        }
    }

    donnees = { hotels: hotels.donnees, chambres: chambres.donnees, reservations: reservations.donnees, utilisateurs: utilisateurs.donnees };
    afficherHotels();
    afficherChambres();
    afficherReservation();
    afficherUtilisateurs();

    ecrireCompte("onglet-compte-hotels", "Hôtels", donnees.hotels.length);
    ecrireCompte("onglet-compte-chambres", "Chambres", donnees.chambres.length);
    ecrireCompte("onglet-compte-reservations", "Reservations", donnees.reservations.length);
    ecrireCompte("onglet-compte-utilisateurs", "Utilisateurs", donnees.utilisateurs.length);

}

function ecrireCompte(id, libelle, nombre) {
    const bouton = document.getElementById(id);
    if (bouton) bouton.textContent = libelle + " (" + nombre + ")";
}

//gestion des onglets
function activerOnglets() {
    const boutons = document.querySelectorAll("[data-onglet]");
    function afficher(nom) {
        boutons.forEach(function (bouton) {
            const section = document.getElementById("section-" + bouton.dataset.onglet);
            const actif = bouton.dataset.onglet === nom;
            if (section) section.hidden = !actif;
            bouton.classList.toggle("btn-primary", actif);
            bouton.classList.toggle("btn-outline-primary", !actif);
        });
    }
    boutons.forEach(bouton => bouton.addEventListener("click", () => afficher(bouton.dataset.onglet)));
    afficher("reservations");
}

if (document.getElementById("admin-hotels") && estAdmin()) {
    activerOnglets();
    chargerTout();
}

