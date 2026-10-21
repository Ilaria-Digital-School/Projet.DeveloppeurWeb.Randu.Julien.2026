// // Page Ajout Hotel 
// //Sauvegarde dans le localstorage le informations rentrées dans la page ajout Hotel

// class Produit {
//     constructor(nom, etoile, description, adresse, codePostale, ville, pays, imgSrc) {
//         this.nom =nom;
//         this.etoile=etoile;
//         this.description =description;
//         this.adresse=adresse;
//         this.codePostale=codePostale;
//         this.ville=ville;
//         this.pays=pays;
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
//         let etoile = document.getElementById("etoile").value;
//         let description = document.getElementById("description").value;
//         let adresse = document.getElementById("adresse").value;
//         let codePostale = document.getElementById("code-postale").value;
//         let ville = document.getElementById("ville").value;
//         let pays = document.getElementById("pays-hotel").value;
//         let imgSrc = document.getElementById("img").value;

//         //Création de l'objet
//         let produit = new Produit(nom, etoile, description, adresse, codePostale, ville, pays, imgSrc); 
//         console.log(produit);

//         // Sauvegarder dans localstorage
//         const produits = JSON.parse(localStorage.getItem("produits")) || [];
//         produits.push(produit);
//         localStorage.setItem("produits", JSON.stringify(produits));

//         form.reset();
//         alert("Produit ajouté avec succés !");
//     })
// }

// ajouterProduit();


//permets l'ajout dans la base de donnée

function ajouterProduit() {
    const form = document.getElementById("productForm");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!estAdmin()) {
            alert("Cette page est reservee a l'administrateur, connexion requise");
            window.location.href = PAGE_CONNEXION;
            return;
        }

        const liste = await appelerAPI("/hotels");
        if (!liste.ok) {
            alert(messageErreur(liste));
            return;
        }
        const idHotel = prochainIdentifiant("H", liste.donnees.map(h => h.hotel));
        
        const champPays = form.querySelector('[name="pays"]') || document.getElementById("pays-hotel");
        const pays = champPays ? champPays.value.trim() : "";

        const resultat = await appelerAPI("/hotels", "POST", {
            hotel: idHotel,
            nom: valeurChamp("productName").trim(),
            nombre_etoiles: Number(valeurChamp("etoile")),
            description: valeurChamp("description").trim(),
            adresse: valeurChamp("adresse").trim(),
            code_postal: valeurChamp("code-postale").trim(),
            ville: valeurChamp("ville").trim(),
            pays: pays,
            image: valeurChamp("img").trim()
        });

        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }

        form.reset();
        alert("Hôtel " + idHotel + " ajouté avec succès !");
    });
}

ajouterProduit();