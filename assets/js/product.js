class Produit {
    constructor(nom, description, prix, imgSrc) {
        this.nom =nom;
        this.description =description;
        this.prix = prix;
        this.imgSrc =imgSrc;
    }
}

//Fonction pour ajouter un produit
function ajouterProduit() {
    const form = document.getElementById("productForm");
    console.log(form);

    form.addEventListener("submit", function(event){
        event.preventDefault(); //Annuler le rechargement automatique de la page

        let nom = document.getElementById("productName").value;
        let description = document.getElementById("description").value;
        let prix = document.getElementById("productPrice").value;
        let imgSrc = document.getElementById("img").value;

        //Création de l'objet
        let produit = new Produit(nom, description, prix, imgSrc);
        console.log(produit);

        // Sauvegarder dans localstorage
        const produits = JSON.parse(localStorage.getItem("produits")) || [];
        produits.push(produit);
        localStorage.setItem("produits", JSON.stringify(produits));

        form.reset();
        alert("Produit ajouté avec succés !");
    })
    

}

ajouterProduit();