const API_URL = "http://localhost:8000"; //mettre 5000 pour utilisation via Flask 
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
        const donnees = await reponse.json();

        //renvoie une erreur si le délai de connexion est depassé
        if (reponse.status === 401 && jeton) {
            deconnecter();
        }
        return { ok: reponse.ok, statut: reponse.status, donnees: donnees };
    } catch (erreur) {
        return { ok: false, statut: 0, donnees: { error: "Serveur injoignable"} };
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

//sauvegarde la session dans le localstorage 

function sauvegarderSession(donneesConnexion) {
    localStorage.setItem("jeton", donneesConnexion.jeton);
    localStorage.setItem("utilisateur", JSON.stringify({
        id: donneesConnexion.utilisateurs,
        nom: donneesConnexion.prenom,
        role: donneesConnexion.role
    }));
}

function utilisateurConnect() {
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

//Pages et liens reserver a l'Admin
function estAdmin() {
    const moi = utilisateurConnect();
    return moi !== null && moi.role === "admin";
}

function pageReserveeAdmin() {
    if (!estAdmin()) {
        alert("Cette page est reservee a l'Administrateur, connexion requise");
        window.location.href = PAGE_CONNEXION; // redirige vers la page connexion 
        return;
    }
    document.body.style.display = ""; //permets a l'admin de voir la page
}

//cache les elements reserver a l'admin 
function afficherLiensAdmin() {
    document.querySelectorAll(".admin-seulement").forEach(function (element) {
        element.style.display = estAdmin() ? "" : "none";
    });
}

document.addEventListener("DOMContentLoaded", afficherLiensAdmin);

//permets de suivre la logique des identifiants, par exemple H001, H002 etc...

function prochainIdentifiant(prefixe, identifiants) {
    let max = 0;
    identifiants.forEach(function (identifiant) {
        const nombre = parseInt(identifiant.slice(prefixe.length), 10);

        //ignore les identifiants qui ne suivent pas le modele definis 
        if (identifiant.startsWith(prefixe) && !isNaN(nombre) && nombre <= 99999 && nombre > max ) {
            max = nombre;
        }
    });
    return prefixe + string(max + 1).padStart(3, "0");

}