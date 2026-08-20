const codigo = document.getElementById("TarjetaCod");
const boton = document.getElementById("enviar");
const Tarjeta = document.getElementById("tarjeta");
const tipoImg = document.getElementById("TipoTarj");

// rutas a imágenes locales (en la misma carpeta)
const imgs = {
    visa: 'visa.webp',
    mastercard: 'mastercard.png',
    invalid: 'invalid.png'
};

function setCardImage(type) {
    if (!tipoImg) return;
    if (type === 'blank') {
        tipoImg.src = '';
        tipoImg.style.visibility = 'hidden';
        return;
    }
    tipoImg.style.visibility = 'visible';
    tipoImg.src = imgs[type] || imgs.invalid;
    tipoImg.alt = type;
}

if (codigo) codigo.addEventListener("input", corroborar);

function corroborar() {
    if (!codigo || !Tarjeta) return;

    
    let digits = codigo.value.replace(/\D/g, "").substring(0, 16);

    
    codigo.value = digits.replace(/(.{4})/g, "$1 ").trim();

    Tarjeta.classList.remove("visa", "mastercard", "invalid");

    if (digits.length === 0) {
        setCardImage('blank');
        return;
    }

    // VISA
    if (digits[0] === "4") {
        Tarjeta.classList.add("visa");
        setCardImage('visa');
        return;
    }

    // MASTERCARD (rangos comunes)
    if (digits.length < 4) return;

    let numero = parseInt(digits.substring(0, 4), 10);

    if ((numero >= 5100 && numero <= 5599) || (numero >= 2221 && numero <= 2720)) {
        Tarjeta.classList.add("mastercard");
        setCardImage('mastercard');
    } else {
        Tarjeta.classList.add("invalid");
        setCardImage('invalid');
    }
}

// inicializar imagen al cargar
setCardImage('blank');