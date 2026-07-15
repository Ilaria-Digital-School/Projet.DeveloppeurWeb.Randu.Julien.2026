function sinscrireNewsletter() {
    const inscriptionNews = document.getElementById("inscription-news");
    if (!inscriptionNews) return;

    inscriptionNews.addEventListener("submit", function(event){;
        event.preventDefault();
      
        let email = document.getElementById("email").value;

        inscriptionNews.reset();
         

        console.log(email);
        alert("Merci de votre inscription !");

    })
};

sinscrireNewsletter();

  //client = role
       // let utilisateur = new Utilisateur(email, "client"); 
        

       // const utilisateurs = JSON.parse(localStorage.getItem("utilisateurs")) || [];
       // utilisateurs.push(utilisateur);
        //Sauvegarde dans le local Storage
        //localStorage.setItem("utilisateurs", JSON.stringify(utilisateurs));