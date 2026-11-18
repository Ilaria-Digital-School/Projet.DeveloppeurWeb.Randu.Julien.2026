const API_URL = "http://localhost:8000"; //mettre 5000 pour utilisation via Flask ou 8000 sans Flask
const PAGE_CONNEXION = "connexion.html";

//Envoie une requete sur l'API
async function appelerAPI(chemin, methode = "GET", corps = null) {
    const entetes = {};

    if (corps !== null) {
        entetes["Content-Type"] = "application/json";
    } 

    //permets a l'utilisateur de se connecter et d'envoyer une requete 
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
        

        //renvoie une erreur si le délai de connexion est depassé
        if (reponse.status === 401 && jeton) {
            deconnecter();
        }

        return { ok: reponse.ok, statut: reponse.status, donnees: donnees };
    } catch (erreur) {
        return { ok: false, statut: 0, donnees: { error: "Serveur injoignable" } };

    }
    
}
//permets de transmettre un message d'erreur lisible a l'utilisateur
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
//permets de lire la valeur des champs selectionner et permets une lecture claire
function valeurChamp(id){
    const element = document.getElementById(id);
    if (element === null) {
        throw new Error("champ introuvable : id=\"" + id +"\"");
    }
    return element.value;
}

//sauvegarde la session dans le localstorage 

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

//en fonction du role de la personne connectée
function aRole(...roles) {
    return roles.includes(roleConnecte());
}

//Pages et liens reserver a l'Admin
function estAdmin() { return roleConnecte() === "admin"; }
function estClient() { return roleConnecte() === "client"; }
function estPrestataire() { return roleConnecte() === "prestataire"; }
function peutGererCatalogue() { return aRole("admin", "prestataire"); }

//permets la redirection en fonction du role
//personne de connecté : message et redirection vers la page de connexion
//mauvais role: message et redirection vers la page d'accueil
// bon role : la page s'affiche

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

//affiche ou cache les elements du menu en fonction du role via la classe sur la page HTML

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

//date a la française
function dateFrancaise(texte) {
    return String(texte).split("-").reverse().join("/");
}

//le prix devient 120,50€ (exemple)
function montantEuros(nombre) {
    return Number(nombre).toFixed(2).replace(".", ",") + " €";
}

//nombre de nuit entre deux dates format AAAA-MM-JJ
function nombreDeNuits(arrivee, depart) {
    return Math.round((new Date(depart) - new Date(arrivee)) / 86400000);
}

//date d'aujourd'hui
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

//Boutton d'action 
function boutonAction(texte, classe, action) {
    const bouton = creerElement("button", texte, "btn btn-sm " + classe);
    bouton.type = "button";
    bouton.style.marginRight = "4px";
    bouton.addEventListener("click", action);
    return bouton;
}

//Lien Connexion / Deconnexion
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