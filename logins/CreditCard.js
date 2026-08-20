const codigo = document.getElementById("TarjetaCod");
const titularInput = document.getElementById("tarjetaTitular");
const expInput = document.getElementById("tarjetaExp");
const cvvInput = document.getElementById("tarjetaCVV");
const calleInput = document.getElementById("direccionCalle");
const ciudadInput = document.getElementById("direccionCiudad");
const cpInput = document.getElementById("direccionCodigoPostal");
const boton = document.getElementById("enviar");
const Tarjeta = document.getElementById("tarjeta");
const tipoImg = document.getElementById("TipoTarj");
const errorMsg = document.getElementById("cardErrorMsg");

// Local image paths
const imgs = {
    visa: 'visa.png',
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

// Format Expiration Date MM/YY
function formatExp(value) {
    let digits = value.replace(/\D/g, "").substring(0, 4);
    if (digits.length >= 3) {
        return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    }
    return digits;
}

// Validate Expiration Date MM/YY
function validateExp(value) {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mStr, yStr] = value.split("/");
    const month = parseInt(mStr, 10);
    const year = parseInt(`20${yStr}`, 10);

    if (month < 1 || month > 12) return false;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
}

function validarTodo() {
    if (!codigo || !titularInput || !expInput || !cvvInput || !calleInput || !ciudadInput || !cpInput || !boton) return false;

    // 1. Cardholder Name
    const titularVal = titularInput.value.trim();
    const titularValido = titularVal.length >= 3;

    // 2. Card Number
    let digits = codigo.value.replace(/\D/g, "").substring(0, 16);
    codigo.value = digits.replace(/(.{4})/g, "$1 ").trim();

    Tarjeta.classList.remove("visa", "mastercard", "invalid");
    let cardType = "invalid";

    if (digits.length === 16) {
        if (digits[0] === "4") {
            cardType = "visa";
        } else if (digits.length >= 4) {
            let numero = parseInt(digits.substring(0, 4), 10);
            if ((numero >= 5100 && numero <= 5599) || (numero >= 2221 && numero <= 2720)) {
                cardType = "mastercard";
            }
        }
    }

    if (digits.length > 0) {
        if (cardType === "visa") {
            Tarjeta.classList.add("visa");
            setCardImage("visa");
        } else if (cardType === "mastercard") {
            Tarjeta.classList.add("mastercard");
            setCardImage("mastercard");
        } else {
            Tarjeta.classList.add("invalid");
            setCardImage("invalid");
        }
    } else {
        setCardImage("blank");
    }

    const tarjetaValida = digits.length === 16 && (cardType === "visa" || cardType === "mastercard");

    // 3. Expiration Date
    expInput.value = formatExp(expInput.value);
    const expValida = validateExp(expInput.value);

    // 4. CVV
    const cvvDigits = cvvInput.value.replace(/\D/g, "").substring(0, 3);
    cvvInput.value = cvvDigits;
    const cvvValido = cvvDigits.length === 3;

    // 5. Shipping / Billing Address
    const calleVal = calleInput.value.trim();
    const calleValida = calleVal.length >= 5;

    const ciudadVal = ciudadInput.value.trim();
    const ciudadValida = ciudadVal.length >= 2;

    const cpVal = cpInput.value.trim();
    const cpValido = cpVal.length >= 3;

    // Visual feedback for error message
    let msg = "";
    if (titularInput.value.length > 0 && !titularValido) {
        msg = "Cardholder name must be at least 3 characters.";
    } else if (digits.length > 0 && !tarjetaValida) {
        msg = "Enter a valid 16-digit Visa or Mastercard.";
    } else if (expInput.value.length > 0 && !expValida) {
        msg = "Expiration date must be a valid future MM/YY.";
    } else if (cvvInput.value.length > 0 && !cvvValido) {
        msg = "CVV must be 3 numeric digits.";
    } else if (calleInput.value.length > 0 && !calleValida) {
        msg = "Street address must be at least 5 characters.";
    } else if (ciudadInput.value.length > 0 && !ciudadValida) {
        msg = "City must be at least 2 characters.";
    } else if (cpInput.value.length > 0 && !cpValido) {
        msg = "Zip / Postal code must be at least 3 characters.";
    }

    if (errorMsg) errorMsg.textContent = msg;

    const todoValido = titularValido && tarjetaValida && expValida && cvvValido && calleValida && ciudadValida && cpValido;
    boton.disabled = !todoValido;
    return todoValido;
}

// Attach listeners & pre-fill saved data
window.addEventListener("DOMContentLoaded", () => {
    setCardImage("blank");

    if (titularInput && localStorage.getItem("tarjetaTitular")) {
        titularInput.value = localStorage.getItem("tarjetaTitular");
    }
    if (codigo && localStorage.getItem("tarjeta")) {
        codigo.value = localStorage.getItem("tarjeta");
    }
    if (expInput && localStorage.getItem("tarjetaExp")) {
        expInput.value = localStorage.getItem("tarjetaExp");
    }
    if (calleInput && localStorage.getItem("direccionCalle")) {
        calleInput.value = localStorage.getItem("direccionCalle");
    }
    if (ciudadInput && localStorage.getItem("direccionCiudad")) {
        ciudadInput.value = localStorage.getItem("direccionCiudad");
    }
    if (cpInput && localStorage.getItem("direccionCodigoPostal")) {
        cpInput.value = localStorage.getItem("direccionCodigoPostal");
    }

    [titularInput, codigo, expInput, cvvInput, calleInput, ciudadInput, cpInput].forEach(el => {
        if (el) {
            el.addEventListener("input", validarTodo);
            el.addEventListener("keyup", validarTodo);
        }
    });

    validarTodo();
});

if (boton) {
    boton.addEventListener("click", (e) => {
        e.preventDefault();

        if (validarTodo()) {
            let digits = codigo.value.replace(/\D/g, "");
            let tipoTarjeta = Tarjeta.classList.contains("visa") ? "Visa" : "Mastercard";
            let titularVal = titularInput.value.trim();
            let expVal = expInput.value.trim();
            let calleVal = calleInput.value.trim();
            let ciudadVal = ciudadInput.value.trim();
            let cpVal = cpInput.value.trim();

            let usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            usuario.titular = titularVal;
            usuario.tarjeta = digits;
            usuario.tipoTarjeta = tipoTarjeta;
            usuario.expDate = expVal;
            usuario.direccion = {
                calle: calleVal,
                ciudad: ciudadVal,
                codigoPostal: cpVal
            };
            usuario.isLoggedIn = true;

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("tarjeta", digits);
            localStorage.setItem("tipoTarjeta", tipoTarjeta);
            localStorage.setItem("tarjetaTitular", titularVal);
            localStorage.setItem("tarjetaExp", expVal);
            localStorage.setItem("direccionCalle", calleVal);
            localStorage.setItem("direccionCiudad", ciudadVal);
            localStorage.setItem("direccionCodigoPostal", cpVal);
            localStorage.setItem("isLoggedIn", "true");

            alert("Banking & Shipping details saved successfully!");
            window.location.href = "../products.html";
        }
    });
}