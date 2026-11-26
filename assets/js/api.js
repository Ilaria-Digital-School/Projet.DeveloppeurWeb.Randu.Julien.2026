const API_URL = "http://localhost:8000"; //mettre 5000 pour utilisation avec Flask ou 8000 sans Flask
//set to 5000 for use with Flask, or 8000 without Flask
const PAGE_CONNEXION = "connexion.html";

//Envoie une requête à l'API
async function appelerAPI(chemin, methode = "GET", corps = null) {
    const entetes = {};

    if (corps !== null) {
        entetes["Content-Type"] = "application/json";
    } 

    //permet à l'utilisateur de se connecter et d'envoyer une requête
    //allows the user to log in and send a request
    const jeton = localStorage.getItem("jeton");
    if (jeton) {
        entetes["Authorization"] = "Bearer " + jeton;
    }

    const options = { method: methode, headers: entetes };
    if (corps !== null) {
        options.body = JSON.stringify(corps);
    }

    try {
        const reponse = await fetch(API_URL + chemin, options);

        let donnees;
        try{
            donnees = await reponse.json();
        } catch (erreurJson) {
            donnees = { error: "Réponse inattendue du serveur (code " + reponse.status + ")"};
        }
        

        //renvoie une erreur si le délai de connexion est dépassé
        //returns an error if the connection timeout is exceeded
        if (reponse.status === 401 && jeton) {
            deconnecter();
        }

        return { ok: reponse.ok, statut: reponse.status, donnees: donnees };
    } catch (erreur) {
        return { ok: false, statut: 0, donnees: { error: "Serveur injoignable" } };

    }
    
}
//permet de transmettre un message d'erreur lisible à l'utilisateur

//allows a readable error message to be conveyed to the user
function messageErreur(resultat) {
    const d = resultat.donnees;
    let message = d.error || "Erreur inconnue !";
    if (d.champs) {
        message += " : " + d.champs.join(", ");
    }
    if (d.details) {
        message += " : " + Object.values(d.details).join(", ");
    }
    return message;
}
//permet de lire la valeur des champs sélectionnés et fournit une lecture claire
//allows reading the value of selected fields and provides clear reading
function valeurChamp(id){
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error("champ introuvable : id=\"" + id +"\"");
    }
    return element.value;
}

//sauvegarde la session dans le localstorage 
//saves the session in the local storage

function sauvegarderSession(donneesConnexion) {
    localStorage.setItem("jeton", donneesConnexion.jeton);
    localStorage.setItem("utilisateur", JSON.stringify({
        id: donneesConnexion.utilisateurs,
        nom: donneesConnexion.nom,
        prenom: donneesConnexion.prenom,
        role: donneesConnexion.role
    }));
}

function utilisateurConnecte() {
    const texte = localStorage.getItem("utilisateur");
    if (!texte) return null;
    try {
        return JSON.parse(texte);
    } catch (erreur) {
        return null;
    }
}

function deconnecter() {
    localStorage.removeItem("jeton");
    localStorage.removeItem("utilisateur");
}

function roleConnecte() {
    const moi = utilisateurConnecte();
    return moi === null ? null : moi.role;
}

//en fonction du rôle de la personne connectée
//depending on the role of the logged-in user
function aRole(...roles) {
    return roles.includes(roleConnecte());
}

//Pages et liens réservés à l'administrateur
//Pages and links reserved for the Admin
function estAdmin() { return roleConnecte() === "admin"; }
function estClient() { return roleConnecte() === "client"; }
function estPrestataire() { return roleConnecte() === "prestataire"; }
function peutGererCatalogue() { return aRole("admin", "prestataire"); }

//permet la redirection en fonction du rôle
//aucune personne connectée : message et redirection vers la page de connexion
//mauvais rôle : message et redirection vers la page d'accueil
//bon rôle : la page s'affiche

//enables redirection based on role
//no user logged in: display message and redirect to the login page
//incorrect role: display message and redirect to the home page
//correct role: the page is displayed

function pageReservee(rolesAutorises) {
    const moi = utilisateurConnecte();

    if (moi === null ) {
        alert("Veuillez vous connecter pour acceder a cette page");
        window.location.href = PAGE_CONNEXION;
        return;
    }
    if (!rolesAutorises.includes(moi.role)) {
        alert("Cette page n'est pas accessible avec votre compte");
        window.location.href = "../index.html";
        return;
    }
    document.body.style.display = "";
}

function pageReserveeAdmin() { pageReservee(["admin"]); }
function pageReserveeClient() { pageReservee(["client"]); }
function pageReserveeCatalogue() { pageReservee(["admin", "prestataire"]); }
function pageReserveeConnecte() { pageReservee(["client", "prestataire", "admin"]); }

//affiche ou cache les éléments du menu en fonction du rôle via la classe sur la page HTML
//shows or hides menu elements based on the role, using a class on the HTML page

function afficherLienSelonRole() {
    const regles = {
        ".admin-seulement": ["admin"],
        ".client-seulement": ["client"],
        ".prestataire-seulement": ["prestataire"],
        ".catalogue-seulement": ["admin", "prestataire"],
        ".connecte-seulement": ["client", "prestataire", "admin"]
    };
    for (const selecteur in regles) {
        document.querySelectorAll(selecteur).forEach(function (element) {
            element.style.display = aRole(...regles[selecteur]) ? "" : "none";
        });
    }
}

document.addEventListener("DOMContentLoaded", afficherLienSelonRole);

const LIBELLES_STATUT = {
    "en attente": "En attente",
    "confirmee": "Confirmée",
    "annulee": "Annulée",
    "reserver": "Réservée",
    "en cours de traitement": "En cours de traitement"
};

function libelleStatut(statut) {
    return LIBELLES_STATUT[statut] || statut;
}

//date à la française /
//date in French format
function dateFrancaise(texte) {
    return String(texte).split("-").reverse().join("/");
}

//le prix devient 120,50€ (exemple)
//the price becomes €120.50 (example)
function montantEuros(nombre) {
    return Number(nombre).toFixed(2).replace(".", ",") + " €";
}

//nombre de nuits entre deux dates au format AAAA-MM-JJ
//number of nights between two dates in YYYY-MM-DD format
function nombreDeNuits(arrivee, depart) {
    return Math.round((new Date(depart) - new Date(arrivee)) / 86400000);
}

//date d'aujourd'hui
//today's date
function aujourdhuiISO() {
    const d = new Date();
    return  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`;
}

function creerElement(balise, texte = "", classe = "") {
    const element = document.createElement(balise);
    element.textContent = texte;
    if (classe) element.className = classe;
    return element;
}

function cellule(contenu, balise = "td") {
    const element = document.createElement(balise);
    if (typeof contenu === "object") {
        element.appendChild(contenu);
    } else {
        element.textContent = contenu;
    }
    return element;
}
//Bouton d'action
//Action button
function boutonAction(texte, classe, action) {
    const bouton = creerElement("button", texte, "btn btn-sm " + classe);
    bouton.type = "button";
    bouton.style.marginRight = "4px";
    bouton.addEventListener("click", action);
    return bouton;
}

//Lien Connexion / Déconnexion
//Connection / Disconnection link
function afficherLienConnexion() {
    const moi = utilisateurConnecte();

    document.querySelectorAll(".lien-connexion").forEach(function (lien) {
        if (moi === null) return;

        lien.textContent = moi.prenom ? "Deconnexion (" + moi.prenom + ")" : "Deconnexion";
        lien.href = "#";
        lien.addEventListener("click", function (evenement) {
            evenement.preventDefault();
            deconnecter();
            window.location.href = "../index.html";
        });

    }); 

    document.querySelectorAll(".lien-inscription").forEach(function (element) {
        element.style.display = moi !== null ? "none" : "";
    });
}

document.addEventListener("DOMContentLoaded", afficherLienConnexion);

// Normalise le texte pour comparer les recherches sans tenir compte des accents.
// Normalizes text so searches are compared without considering accents.
function normaliserTexteRecherche(texte) {
    return texte
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr");
}

// Configure la recherche de la navigation et filtre les hôtels du catalogue.
// Sets up navigation search and filters the hotels in the catalogue.
function initialiserRechercheNavigation() {
    const formulairesRecherche = document.querySelectorAll('form[role="search"]');
    const cheminAccueil = /\/Pages\//i.test(window.location.pathname) ? "../index.html" : "index.html";

    formulairesRecherche.forEach(function (formulaire) {
        const champ = formulaire.querySelector('input[type="search"]');
        const bouton = formulaire.querySelector('button[type="submit"], button:not([type])');
        if (!champ) return;

        champ.placeholder = "Rechercher un hôtel";
        champ.setAttribute("aria-label", "Rechercher un hôtel");
        champ.name = "recherche";
        if (bouton) bouton.textContent = "Rechercher";

        formulaire.addEventListener("submit", function (evenement) {
            evenement.preventDefault();
            const destination = new URL(cheminAccueil, window.location.href);
            const recherche = champ.value.trim();
            if (recherche) destination.searchParams.set("recherche", recherche);
            window.location.href = destination.href;
        });
    });

    // Récupère le catalogue et les éléments nécessaires au filtrage des hôtels.
    // Gets the catalogue and the elements needed to filter the hotels.
    const catalogue = document.querySelector("main");
    const cartes = catalogue ? catalogue.querySelectorAll(".article, .article-2") : [];
    if (cartes.length === 0) return;

    const params = new URLSearchParams(window.location.search);
    const recherche = params.get("recherche") || "";
    const champRecherche = document.querySelector('form[role="search"] input[type="search"]');
    if (champRecherche) champRecherche.value = recherche;

    const conteneurs = new Set();
    const sectionsCatalogue = new Set();
    cartes.forEach(function (carte) {
        conteneurs.add(carte.parentElement);
        const section = carte.closest("section");
        if (section) sectionsCatalogue.add(section);
    });

    const message = document.createElement("p");
    message.className = "recherche-resultats";
    message.setAttribute("role", "status");
    message.setAttribute("aria-live", "polite");
    const premierConteneur = cartes[0].parentElement;
    const premiereSection = premierConteneur.closest("section");
    const pointInsertion = premiereSection || premierConteneur;
    pointInsertion.parentElement.insertBefore(message, pointInsertion);

    if (!recherche) {
        message.hidden = true;
        sectionsCatalogue.forEach(function (section) {
            section.hidden = false;
        });
        return;
    }

    const termes = normaliserTexteRecherche(recherche).trim().split(/\s+/).filter(Boolean);
    let nombreResultats = 0;
    cartes.forEach(function (carte) {
        const contenu = normaliserTexteRecherche(carte.textContent);
        const correspond = termes.every(function (terme) {
            return contenu.includes(terme);
        });
        carte.hidden = !correspond;
        if (correspond) nombreResultats += 1;
    });

    conteneurs.forEach(function (conteneur) {
        conteneur.hidden = !conteneur.querySelector(".article:not([hidden]), .article-2:not([hidden])");
    });
    sectionsCatalogue.forEach(function (section) {
        section.hidden = !section.querySelector(".article:not([hidden]), .article-2:not([hidden])");
    });

    message.hidden = false;
    message.textContent = nombreResultats === 0
        ? "Aucun hôtel ne correspond à votre recherche. Essayez un autre nom, une ville ou une catégorie."
        : nombreResultats + (nombreResultats > 1 ? " hôtels correspondent" : " hôtel correspond") + " à votre recherche.";
    message.scrollIntoView({ behavior: "smooth", block: "center" });
}

document.addEventListener("DOMContentLoaded", initialiserRechercheNavigation);