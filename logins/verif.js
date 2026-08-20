// Verification code script
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

    if (emailEl) emailEl.textContent = `Verification code sent to: ${oculto}`;
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
        if (codigo && codigo.value.length === 6) {
            let usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            usuario.codigoVerificacion = codigo.value;

            localStorage.setItem("usuario", JSON.stringify(usuario));
            localStorage.setItem("codigoVerificacion", codigo.value);

            window.location.href = "CreditCard.html";
        }
    });
}

function corroborar() {
    if (!codigo || !mensaje) return;
    codigo.value = codigo.value.replace(/\D/g, "");
    if (codigo.value.length === 6) {
        mensaje.textContent = "Valid code";
        mensaje.style.color = "var(--brand-deep)";
        if (boton) boton.disabled = false;
    } else {
        mensaje.textContent = "Enter a 6-digit code";
        mensaje.style.color = "var(--muted)";
        if (boton) boton.disabled = true;
    }
}
