class Utilisateur {
    constructor(nom, prenom, tel, email, mdp, genre, interets, pays, role){
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

//Création de l'utilisateur

function ajouterAdmin() {
    let admin = new Utilisateur("Randu", "Julien", "0605132521", "randu.julien@gmail.com", "admin1234", "homme", [], "France", "Admin");

    let utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
    for (let i = 0; i < utilisateurs.length; i++) {
        if (utilisateurs[i].email == admin.email) return;
    }

    utilisateurs.push(admin);
    localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

}

//Création du client 

function sInscrire() {
    const inscriptionForm = document.getElementById("inscription-form");
    if (!inscriptionForm) return;

    inscriptionForm.addEventListener("submit", function(event){;
        event.preventDefault();
      

        let nom = document.getElementById("nom").value;
        let prenom = document.getElementById("prenom").value;
        let tel = document.getElementById("tel").value;
        let email = document.getElementById("email").value;
        let mdp = document.getElementById("mdp").value;

        let genre = document.querySelector('input[name=genre]:checked').value;

        let interets = [];
        let interetsChecked = document.querySelectorAll('input[name=interets]:checked');

        //utilisation de la boucle pour la recuperation des elements de type interets, afin de faire une selection multiple

        for (let i = 0; i < interetsChecked.length; i++) {
            interets.push(interetsChecked[i].value);
            
        }

        let pays = document.getElementById("pays").value;
        //client = role
        let utilisateur = new Utilisateur(nom, email, mdp, genre, interets, pays, "client"); 
        

        const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
        utilisateurs.push(utilisateur);
        //Sauvegarde dans le local Storage
        localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));

        inscriptionForm.reset();
         

        console.log(nom, prenom, tel ,email, mdp, genre, interetsChecked);
        alert("Compte crée avec succés !");

    })
};

function seConnecter() {
    const connexionForm = document.getElementById("connexion-form");
    if (!connexionForm) return;

    connexionForm.addEventListener("submit", function(event){
        event.preventDefault();

        let email = document.getElementById("email").value;
        let mdp = document.getElementById("password").value;

        const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];

        for(let utilisateur of utilisateurs) {
            if (utilisateur.email === email && utilisateur.mdp === mdp){

                //operateur ternaire (2e methode)
                window.location.href = utilisateur.role == "Admin" ? "nos-hôtels.html" : "/index.html";
                return;
            }
        };
        alert("Email ou Mot de passe incorect !");

    })
}

seConnecter();
sInscrire();
ajouterAdmin();