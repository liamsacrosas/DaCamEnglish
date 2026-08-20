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

    localStorage.setItem("email", email);

    window.location.href = "verifCode.html";
}

function corroborarEmail(email) {
    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return formatoEmail.test(email);
}