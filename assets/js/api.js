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
        const donnees = await reponse.json();

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

//Pages et liens reserver a l'Admin
function estAdmin() {
    const moi = utilisateurConnecte();
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
    return prefixe + String(max + 1).padStart(3, "0");

}

//Lien deconnexion et lien inscription permettent de masquer les elements portant le lien
//si un client est connecter la page inscription disparait (lien portant la classe lien-inscription)
//les liens qui portent le lien-connexion se transforme en deconnexion, remplace la creation d'un boutton sur les pages html
function afficherLienConnexion(){
    const moi = utilisateurConnecte();

    document.querySelectorAll(".lien-connexion").forEach(function (lien) {
        if (moi === null) return; //si personne de connecter, le lien reste connexion

        lien.textContent = moi.prenom ? "Déconnexion (" + moi.prenom +")" : "Deconnexion";
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

//Partie reservée aux clients, comme la page panier qui s'affiche que si le client se connecte 
function estClient(){
    const moi = utilisateurConnecte();
    return moi !== null && moi.role === "client";
}

//permets d'apeller la page client portant le style display none dans le body
function pageReserveeClient(){
    const moi = utilisateurConnecte();

    if (moi === null) {
        alert("Veuillez vous connecter pour acceder a cette page !");
        window.location.href = PAGE_CONNEXION;
        return;
    }
    if (moi.role !== "client") {
        alert("Cette page est reservee aux clients.");
        window.location.href = "../index.html";
        return;
    }
    document.body.style.display = "";
}

//permets de cacher les elements portant la classe client-seulement
function afficherLiensClient(){
    document.querySelectorAll(".client-seulement").forEach(function (element) {
        element.style.display = estClient() ? "" : "none";
    });

}

document.addEventListener("DOMContentLoaded", afficherLiensClient);