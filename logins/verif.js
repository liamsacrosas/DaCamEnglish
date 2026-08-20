
// codigo de verificacion
let email = localStorage.getItem("email") || "";
const emailEl = document.getElementById("emailOculto");

if (email) {
    const partes = email.split("@");
    const nombre = partes[0] || "";
    const dominio = partes[1] || "";

    let oculto = nombre.substring(0, 2);
    for (let i = 2; i < nombre.length; i++) {
        oculto += ".";
    }
    oculto += dominio ? "@" + dominio : "";

    if (emailEl) emailEl.textContent = oculto;
} else {
    if (emailEl) emailEl.textContent = "";
}

const codigo = document.getElementById("codigo");
const boton = document.getElementById("ingresar");
const mensaje = document.getElementById("mensaje");

if (boton) boton.disabled = true;
if (codigo) {
    codigo.addEventListener("input", corroborar);
    corroborar();
}
if (boton) {
    boton.addEventListener("click", () => {
        window.location.href = "CreditCard.html";
    });
}

function corroborar() {
    if (!codigo || !mensaje) return;
    codigo.value = codigo.value.replace(/\D/g, "");
    if (codigo.value.length === 6) {
        mensaje.textContent = "codigo válido";
        if (boton) boton.disabled = false;
    } else {
        mensaje.textContent = "codigo inválido";
        if (boton) boton.disabled = true;
    }
    console.log(mensaje.textContent);
}
