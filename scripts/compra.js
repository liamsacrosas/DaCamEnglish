let carrouselImages = document.getElementById("carrouselImages");
function prueba(){
    let cont = 0;
    while(cont<10){
        let img = document.createElement('img');
        img.src = "DaCam.png";
        carrouselImages.appendChild(img);
        cont++;
    }
}