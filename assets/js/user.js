class Utilisateur {
    constructor(nom, prenom, tel, email, mdp, genre, interets, pays, role) {
        this.nom = nom;
        this.prenom = prenom;
        this.tel = tel;
        this.email = email;
        this.mdp = mdp;
        this.genre = genre;
        this.interets = interets;
        this.pays = pays;
        this.role = role;

    }
}

//Création de l'utilisateur/admin

function ajouterAdmin() {
    const admin = new Utilisateur("Randu", "Julien", "0605132521", "randu.julien@gmail.com", "admin1234", "homme", [], "France", "Admin");

    const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

    const existe = utilisateurs.some(
        u => u.email?.toLowerCase() === admin.email.toLowerCase()
    );

    if (existe) return;

    utilisateurs.push(admin);
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

}

async function envoyerUtilisateur(utilisateur) {
    try {
        const reponse = await fetch(
            "http://localhost:8000/api/utilisateurs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(utilisateur)
            }
        );
        const resultat = await reponse.json();

        if (!reponse.ok) {
            throw new Error(
                resultat.message || "Erreur lors de l'inscription"
            );
        }
        console.log("utilisateur enregistré :", resultat);
        return true;
    } catch (erreur) {
        console.error("Erreur fetch :", erreur);
        alert("impossible d'enregistrer le compte sur le serveur")
        return false;
    }
}

//Création du client 

function sInscrire() {
    const inscriptionForm = document.getElementById("inscription-form");
    if (!inscriptionForm) return;
    console.log(inscriptionForm);


    inscriptionForm.addEventListener("submit", async function (event) {
        event.preventDefault();


        let nom = document.getElementById("nom").value.trim();
        let prenom = document.getElementById("prenom").value.trim();
        let tel = document.getElementById("tel").value.trim();
        let email = document.getElementById("email").value.trim();
        let mdp = document.getElementById("mdp").value;
        let confirmMdp = document.getElementById("confirmMdp").value;

        //vérification mot de passe

        if (mdp !== confirmMdp) {
            alert("Les Mots de passe ne correspondent pas !");
            return;
        }

        const genreSelectionne = document.querySelector('input[name="genre"]:checked');
        if (!genreSelectionne) {
            alert("Veuillez selectionner un genre !");
            return;
        }
        const genre = genreSelectionne.value;

          //Array permets de recuperer plusieurs interets et evite ainsi les boucles 
        const interets = Array.from(document.querySelectorAll('input[name="interets"]:checked')).map(element => element.value);

        const pays = document.getElementById("pays").value;

        //client = role
        const utilisateur = new Utilisateur(nom, prenom, tel, email, mdp, genre, interets, pays, "client");
        //envoyer vers le backend pour recuperation 
        const succes = await envoyerUtilisateur(utilisateur);

        if (!succes) return; //arrete le serveur en cas d'erreur 
        inscriptionForm.reset();
        alert("Compte cree avec succés !");
    })
};

function seConnecter() {
    const connexionForm = document.getElementById("connexion-form");
    if (!connexionForm) return;

    connexionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const mdp = document.getElementById("password").value;

        const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

        for (const utilisateur of utilisateurs) {
            if (utilisateur.email?.toLowerCase() === email.toLowerCase() && utilisateur.mdp === mdp) {

                //operateur ternaire (2e methode)
                window.location.href = utilisateur.role == "Admin" ? "nos-hôtels.html" : "/index.html";
                return;
            }
        };
        alert("Email ou Mot de passe incorect !");

    });
}


document.addEventListener("DOMContentLoaded", () => {
    sInscrire();
    seConnecter();
    ajouterAdmin();
});
