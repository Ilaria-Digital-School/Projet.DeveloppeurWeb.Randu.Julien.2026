const LIBELLES_ROLE = { client: "Client", prestataire: "Prestataire (hôtelier)", admin: "Administrateur" };

function ecrire(id, valeur) {
    const element = document.getElementById(id);
    if (element) element.textContent = valeur;
}

//remplissage du formulaire reçu par l'API /
//populating the form received via the API

function remplirProfil(profil) {
    document.getElementById("profil-nom").value = profil.nom || "";
    document.getElementById("profil-prenom").value = profil.prenom || "";
    document.getElementById("profil-email").value = profil.email || "";
    document.getElementById("profil-tel").value = profil.telephone || "";
    document.getElementById("profil-pays").value = profil.pays || "";

    document.querySelectorAll('input[name="profil-genre"]').forEach(function (radio) {
        radio.checked = (radio.value === profil.genre);
    });
    document.querySelectorAll('input[name="profil-interets"]').forEach(function (caseACocher) {
        caseACocher.checked = (profil.interets || []).includes(caseACocher.value);
    });

    ecrire("profil-role", LIBELLES_ROLE[profil.role] || profil.role);
    ecrire("profil-identite", profil.prenom + " " + profil.nom);
}

//mise à jour du prénom après une modification /
//Updating the first name after a modification
function mettreAJourSession(profil) {
    const moi = utilisateurConnecte();
    if (moi === null) return;
    moi.nom = profil.nom;
    moi.prenom = profil.prenom;
    localStorage.setItem("utilisateur", JSON.stringify(moi));
}

async function chargerProfil() {
    const resultat = await appelerAPI("/profil");
    if (!resultat.ok) {
        alert(messageErreur(resultat));
        if (resultat.statut === 401) window.location.href = PAGE_CONNEXION;
        return null;
    }
    remplirProfil(resultat.donnees);
    return resultat.donnees;
}

async function gererProfil(){
    const form = document.getElementById("profil-form");
    if (!form) return;
    if (utilisateurConnecte() === null) return;

    let profilActuel = await chargerProfil();
    if (profilActuel === null) return;

    form.addEventListener("submit", async function (evenement) {
        evenement.preventDefault();

        const email = valeurChamp("profil-email").trim();
        const nouveauMdp = valeurChamp("profil-nouveau-mdp");
        const confirmation = valeurChamp("profil-confirm-mdp");
        const mdpActuel = valeurChamp("profil-mdp-actuel");

        if (nouveauMdp !== confirmation) {
            alert("Les mots de passe ne correspondent pas !");
            return;
        }
        const changeEmail = profilActuel !== null && email !== profilActuel.email;
        if ((changeEmail || nouveauMdp !== "") && mdpActuel === "") {
            alert("Veuillez saisir votre mot de passe pour modifier votre email !");
            return;
        }

        const pays = valeurChamp("profil-pays");
        const modifs = {
            nom: valeurChamp("profil-nom").trim(),
            prenom: valeurChamp("profil-prenom").trim(),
            email: email,
            telephone: valeurChamp("profil-tel").trim(),
            pays: pays === "" ? null : pays,
            interets: Array.from(document.querySelectorAll('input[name="profil-interets"]:checked')).map(c => c.value)
        };
        const genre = document.querySelector('input[name="profil-genre"]:checked');
        if (genre) modifs.genre = genre.value;
        if (mdpActuel !== "") modifs.mot_de_passe_actuel = mdpActuel;
        if (nouveauMdp !== "") modifs.nouveau_mot_de_passe = nouveauMdp;
        
        const resultat = await appelerAPI("/profil", "PATCH", modifs);
        if (!resultat.ok) {
            alert(messageErreur(resultat));
            return;
        }
        profilActuel = resultat.donnees;
        remplirProfil(resultat.donnees);
        mettreAJourSession(resultat.donnees);
        ["profil-mdp-actuel", "profil-nouveau-mdp", "profil-confirm-mdp"].forEach(id => { document.getElementById(id).value = ""; });
        ecrire("profil-message", "profil mis a jour");
        alert("Profil mis a jour avec succés !");
    });
}

gererProfil();