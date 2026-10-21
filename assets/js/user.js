// class Utilisateur {
//     constructor(nom, prenom, tel, email, mdp, genre, interets, pays, role) {
//         this.nom = nom;
//         this.prenom = prenom;
//         this.tel = tel;
//         this.email = email;
//         this.mdp = mdp;
//         this.genre = genre;
//         this.interets = interets;
//         this.pays = pays;
//         this.role = role;

//     }
// }

//Création de l'utilisateur/admin
//sauvegarde en brut dans le localstorage avce MP visible

// function ajouterAdmin() {
//     const admin = new Utilisateur("Randu", "Julien", "0605132521", "randu.julien@gmail.com", "admin1234", "homme", [], "France", "Admin");

//     const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

//     const existe = utilisateurs.some(
//         u => u.email?.toLowerCase() === admin.email.toLowerCase()
//     );

//     if (existe) return;

//     utilisateurs.push(admin);
//     localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

// }

// async function envoyerUtilisateur(utilisateur) { 
//     try {
//         const reponse = await fetch(
//             "http://localhost:8000/utilisateurs",
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify(utilisateur)
//             }
//         );
//         const resultat = await reponse.json();

//         if (!reponse.ok) {
//             throw new Error(
//                 resultat.message || "Erreur lors de l'inscription"
//             );
//         }
//         console.log("utilisateur enregistré :", resultat);
//         return true;
//     } catch (erreur) {
//         console.error("Erreur fetch :", erreur);
//         alert("impossible d'enregistrer le compte sur le serveur")
//         return false;
//     }
// }

//Création du client 

function sInscrire() {
    const inscriptionForm = document.getElementById("inscription-form");
    if (!inscriptionForm) return;

    inscriptionForm.addEventListener("submit", async function (event) {
        event.preventDefault();


        const nom = valeurChamp("nom").trim();
        const prenom = valeurChamp("prenom").trim();
        const tel = valeurChamp("tel").trim();
        const email = valeurChamp("email").trim();
        const mdp = valeurChamp("mdp")
        const confirmMdp = valeurChamp("confirmMdp")

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

        const champPays = inscriptionForm.querySelector('select[name="pays"]') || inscriptionForm.querySelector("select");
        const pays = champPays ? champPays.value : null;
        if (champPays === null) {
            console.warn("Pays introuvable");
        }

        const resultat = await appelerAPI("/inscription", "POST", {
            nom: nom,
            prenom: prenom,
            email: email,
            mot_de_passe: mdp,
            telephone: tel,
            genre: genre,
            interets: interets,
            pays: pays,
        });

        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }

        inscriptionForm.reset();
        alert("Compte créé avec succés !");
        window.location.href = PAGE_CONNEXION;

    });
}
 //Connexion

function seConnecter() {
    const connexionForm = document.getElementById("connexion-form");
    if (!connexionForm) return;

    connexionForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = valeurChamp("email").trim();
        const mdp = valeurChamp("mdp");

        const resultat = await appelerAPI("/connexion", "POST", {
            email: email,
            mot_de_passe: mdp
        });

        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }

        sauvegarderSession(resultat.donnees); //sauvegarde dans le localstorage 

        window.location.href = "../index.html";
    });
 }


  document.addEventListener("DOMContentLoaded", () => {
    sInscrire();
    seConnecter();
});

