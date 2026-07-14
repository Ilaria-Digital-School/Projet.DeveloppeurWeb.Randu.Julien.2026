

const dropZone = document.getElementById("drop-zone");
dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    const fichier = event.dataTransfer.files[0];
    if (fichier && fichier.type === "application/pdf") {
        console.log("fichier reçu :", fichier.name);
        
    }
})

