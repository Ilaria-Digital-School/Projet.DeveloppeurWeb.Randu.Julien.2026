// class Produit {
//     constructor(nom, adresse, etoile, type, description, prix, imgSrc) {
//         this.nom =nom;
//         this.adresse=adresse;
//         this.etoile=etoile;
//         this.type=type
//         this.description =description;
//         this.prix = prix;
//         this.imgSrc =imgSrc;

//     }
// }

// //Fonction pour ajouter un produit
// function ajouterProduit() {
//     const form = document.getElementById("productForm");
//     console.log(form);

//     form.addEventListener("submit", function(event){
//         event.preventDefault(); //Annuler le rechargement automatique de la page

//         let nom = document.getElementById("productName").value;
//         let adresse = document.getElementById("adresse").value;
//         let etoile = document.getElementById("etoile").value;
//         let type = document.getElementById("type").value;
//         let description = document.getElementById("description").value;
//         let prix = document.getElementById("productPrice").value;
//         let imgSrc = document.getElementById("img").value;

//         //Création de l'objet
//         let produit = new Produit(nom, adresse, etoile, type, description, prix, imgSrc);
//         console.log(produit);

//         // Sauvegarder dans localstorage
//         const produits = JSON.parse(localStorage.getItem("produits")) || [];
//         produits.push(produit);
//         localStorage.setItem("produits", JSON.stringify(produits));

//         form.reset();
//         alert("Produit ajouté avec succés !");
//     })
    

// }


// Page Ajout Hotel 
//Sauvegarde dans le localstorage le informations rentrées dans la page ajout Hotel

class Produit {
    constructor(nom, etoile, description, adresse, codePostale, ville, pays, imgSrc) {
        this.nom =nom;
        this.etoile=etoile;
        this.description =description;
        this.adresse=adresse;
        this.codePostale=codePostale;
        this.ville=ville;
        this.pays=pays;
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
        let etoile = document.getElementById("etoile").value;
        let description = document.getElementById("description").value;
        let adresse = document.getElementById("adresse").value;
        let codePostale = document.getElementById("code-postale").value;
        let ville = document.getElementById("ville").value;
        let pays = document.getElementById("pays").value;
        let imgSrc = document.getElementById("img").value;

        //Création de l'objet
        let produit = new Produit(nom, etoile, description, adresse, codePostale, ville, pays, imgSrc);
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
