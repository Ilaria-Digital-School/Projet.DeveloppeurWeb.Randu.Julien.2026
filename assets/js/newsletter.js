class Inscription_news {
    constructor(email) {

        this.email = email;

    }
}

//Fonction pour ajouter une inscription a la newsletter

function inscriptionNews() {
    const form = document.getElementById("inscription-news");
    if (!form){
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault(); //Annuler le rechargement automatique de la page

        const email = document.getElementById("email-news").value;
    
        //Création de l'objet
        const inscription = new Inscription_news(email);

        // Sauvegarder dans localstorage
        let inscriptions = JSON.parse(localStorage.getItem("inscription-news")) || [];

        if (!Array.isArray(inscriptions)) {
            inscriptions = [inscriptions];
        }
        //Evite d'inscrire 2 fois la meme adresse mail
        const dejaInscrit = inscriptions.some(function (i){
            return i.email === email;
        });

        if (dejaInscrit) {
            document.getElementById("message-news").textContent = "Cette adresse est deja inscrite !"
            return;
        }

        inscriptions.push(inscription);
        localStorage.setItem("inscription-news", JSON.stringify(inscriptions));

        form.reset();


        document.getElementById("message-news").textContent = "Inscription à notre Newsletter reussis !";

});

}

inscriptionNews();