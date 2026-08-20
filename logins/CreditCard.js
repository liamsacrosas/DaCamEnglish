const codigo = document.getElementById("TarjetaCod");
const boton = document.getElementById("enviar");
const Tarjeta = document.getElementById("tarjeta");
const tipoImg = document.getElementById("TipoTarj");

// Rutas a imágenes locales
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

if (codigo) {
    // Si ya existe tarjeta guardada, cargarla
    const tarjetaGuardada = localStorage.getItem("tarjeta");
    if (tarjetaGuardada) {
        codigo.value = tarjetaGuardada;
    }
    codigo.addEventListener("input", corroborar);
    corroborar();
}

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

    // MASTERCARD
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

if (boton) {
    boton.addEventListener("click", (e) => {
        e.preventDefault();
        let digits = codigo.value.replace(/\D/g, "");

        if (digits.length === 16 && (Tarjeta.classList.contains("visa") || Tarjeta.classList.contains("mastercard"))) {
            let usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            usuario.tarjeta = digits;
            usuario.tipoTarjeta = Tarjeta.classList.contains("visa") ? "Visa" : "Mastercard";
            usuario.isLoggedIn = true;
            usuario.fechaCompletado = new Date().toISOString();

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("tarjeta", digits);
            localStorage.setItem("tipoTarjeta", usuario.tipoTarjeta);
            localStorage.setItem("isLoggedIn", "true");

            alert("¡Login completado con éxito!");
            window.location.href = "../products.html";
        } else {
            alert("Por favor ingrese un número de tarjeta válido (16 dígitos).");
        }
    });
}

// Inicializar imagen al cargar
setCardImage('blank');