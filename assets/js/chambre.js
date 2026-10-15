// //Faire fonction ajouter chambre pour la page ajout chambre 
class Chambre {
    constructor(nom, numero, type, capacite, tarif, description, imgSrc) {
        this.nom =nom;
        this.numero=numero;
        this.type=type
        this.capacite=capacite
        this.tarif=tarif
        this.description =description;
        this.imgSrc =imgSrc;
    }
}

//Fonction pour ajouter un produit
function ajouterChambre() {
    const form = document.getElementById("productChambre");
    console.log(form);

    form.addEventListener("submit", function(event){
        event.preventDefault(); //Annuler le rechargement automatique de la page

        let nom = document.getElementById("chambre-hotel").value;
        let numero = document.getElementById("numero-chambre").value;
        let type = document.getElementById("type-chambre").value;
        let capacite = document.getElementById("capacite-chambre").value;
        let tarif = document.getElementById("tarif").value;
        let description = document.getElementById("description-chambre").value;
        let imgSrc = document.getElementById("img-chambre").value;

        //Création de l'objet
        let chambre = new Chambre(nom, numero, type, capacite, tarif, description, imgSrc);
        console.log(chambre);

        // Sauvegarder dans localstorage
        const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
        chambres.push(chambre);
        localStorage.setItem("chambres", JSON.stringify(chambres));

        form.reset();
        alert("Chambre ajouté avec succés !");
    })
}

ajouterChambre();