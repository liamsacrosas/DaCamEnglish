function cargar(event) {
    event.preventDefault();

    let email = document.getElementById("EM").value.trim();
    let pass = document.getElementById("password").value;
    let msg = document.getElementById("return");

    if (!corroborarEmail(email)) {
        msg.textContent = "Ingrese un email válido";
        return;
    }

    if (pass === "") {
        msg.textContent = "Ingrese una contraseña";
        return;
    }

    // Guardar datos del login en localStorage
    let usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    usuario.email = email;
    usuario.password = pass;
    usuario.fechaInicio = new Date().toISOString();

    localStorage.setItem("usuario", JSON.stringify(usuario));
    localStorage.setItem("email", email);
    localStorage.setItem("password", pass);

    window.location.href = "verifCode.html";
}

function corroborarEmail(email) {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return formatoEmail.test(email);
}

// Autocompletar si ya hay email guardado
document.addEventListener("DOMContentLoaded", () => {
    const savedEmail = localStorage.getItem("email");
    const emailInput = document.getElementById("EM");
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
    }
});