// // //Faire fonction ajouter chambre pour la page ajout chambre 
// class Chambre {
//     constructor(nom, numero, type, capacite, tarif, description, imgSrc) {
//         this.nom =nom;
//         this.numero=numero;
//         this.type=type
//         this.capacite=capacite
//         this.tarif=tarif
//         this.description =description;
//         this.imgSrc =imgSrc;
//     }
// } 

// //Fonction pour ajouter un produit
// function ajouterChambre() {
//     const form = document.getElementById("productChambre");
//     console.log(form);

//     form.addEventListener("submit", function(event){
//         event.preventDefault(); //Annuler le rechargement automatique de la page

//         let nom = document.getElementById("chambre-hotel").value;
//         let numero = document.getElementById("numero-chambre").value;
//         let type = document.getElementById("type-chambre").value;
//         let capacite = document.getElementById("capacite-chambre").value;
//         let tarif = document.getElementById("tarif").value;
//         let description = document.getElementById("description-chambre").value;
//         let imgSrc = document.getElementById("img-chambre").value;

//         //Création de l'objet
//         let chambre = new Chambre(nom, numero, type, capacite, tarif, description, imgSrc);
//         console.log(chambre);

//         // Sauvegarder dans localstorage
//         const chambres = JSON.parse(localStorage.getItem("chambres")) || [];
//         chambres.push(chambre);
//         localStorage.setItem("chambres", JSON.stringify(chambres));

//         form.reset();
//         alert("Chambre ajouté avec succés !");
//     })
// }

// ajouterChambre();

//permet la recuperation dans la base de donnée: recupere la liste des hotels présent dans la base de donnée
async function chargerHotelsChambre() {
    const liste = document.getElementById("chambre-hotel");
    liste.innerHTML = "";
    liste.appendChild(new Option("Choisissez l'Hôtel concerné", ""));

    const resultat = await appelerAPI("/hotels");
    if (!resultat.ok) {
        alert(messageErreur(resultat));
        return;
    }

    resultat.donnees.forEach(h => liste.appendChild(new Option(h.nom, h.hotel)));
}

//fonction pour ajouter une chambre
function ajouterChambre() {
    const form = document.getElementById("productChambre");
    if (!form) return;

    chargerHotelsChambre();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!estAdmin()) {
            alert("Cette page est reservee a l'administrateur, connexion requise");
            window.location.href = PAGE_CONNEXION;
            return;
        }
        const idHotel = document.getElementById("chambre-hotel").value;
        const type = document.getElementById("type-chambre").value;

        if (idHotel === "") {
            alert("Veuillez choisir l'hôtel concerné !");
            return;
        }
        if (type === "") {
            alert("Veuillez choisir un type de chambre");
            return;
        }

        //identifiant de la nouvelle chambre
        const existantes = await appelerAPI("/chambres/" + encodeURIComponent(idHotel));
        if (!existantes.ok) {
            alert(messageErreur(existantes));
            return;
        }
        const idChambre = prochainIdentifiant("C", existantes.donnees.map(c => c.chambre));

        const resultat = await appelerAPI("/chambres", "POST", {
            hotel: idHotel,
            chambre: idChambre,
            numero: document.getElementById("numero-chambre").value.trim(),
            type: type,
            capacite: Number(document.getElementById("capacite-chambre").value),
            tarif: Number(document.getElementById("tarif").value),
            description: document.getElementById("description-chambre").value.trim(),
            iùage: document.getElementById("img-chambre").value.tim()

        });

        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }


        form.reset();
        alert("chambre " + idChambre + "ajoutée avec succés !");

    });
}
ajouterChambre();
