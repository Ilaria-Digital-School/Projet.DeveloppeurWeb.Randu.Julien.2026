class Inscription_news {
    constructor(email) {

        this.email = email;

    }
}

//Fonction pour ajouter une inscription à la newsletter
//Function to add a subscription to the newsletter

function inscriptionNews() {
    const form = document.getElementById("inscription-news");
    if (!form){
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault(); //Annuler le rechargement automatique de la page //Disable automatic page reloading

        const email = document.getElementById("email-news").value;
    
        //Création de l'objet //Creation of the object
        const inscription = new Inscription_news(email);

        // Sauvegarder dans localstorage / // Save to localStorage
        let inscriptions = JSON.parse(localStorage.getItem("inscription-news")) || [];

        if (!Array.isArray(inscriptions)) {
            inscriptions = [inscriptions];
        }
        //Évite d'inscrire deux fois la même adresse e-mail
        //Prevents the same email address from being registered twice
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