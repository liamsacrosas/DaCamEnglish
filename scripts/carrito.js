/* carrito.js — Gestión del carrito de compras y verificación de tarjetas */

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";

/* ── Storage ──────────────────────────────────────────────── */

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function eliminarDelCarrito(idProducto) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(id => id !== idProducto);
    guardarCarrito(carrito);
    cargarCarrito();
}

/* ── Formateo ─────────────────────────────────────────────── */

function generarEstrellas(calificacion) {
    const llenas = Math.floor(calificacion);
    const media = calificacion % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;
    return "★".repeat(llenas) + (media ? "½" : "") + "☆".repeat(vacias);
}

function formatearPrecio(num) {
    return num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });
}

/* ── Render de tarjetas de producto reciclando .producto ─── */

function crearTarjetaCarrito(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    const precioHTML = tieneOferta
        ? `<p class="producto__precio">
               ${formatearPrecio(producto.precio_oferta)}
               <span class="producto__precio--oferta">Antes: ${formatearPrecio(producto.precio)}</span>
           </p>`
        : `<p class="producto__precio">${formatearPrecio(producto.precio)}</p>`;

    const imgSrc = `https://picsum.photos/seed/dacam${producto.id}/600/800`;

    return `
        <div class="carrito-item">
            <a class="producto" href="compra.html?id=${producto.id}">
                <img
                    class="producto__img"
                    src="${imgSrc}"
                    alt="${producto.titulo}"
                    loading="lazy"
                >
                <div class="producto__body">
                    <h3 class="producto__titulo">${producto.titulo}</h3>
                    <div class="producto__rating">
                        <span class="producto__estrellas" aria-hidden="true">${generarEstrellas(producto.calificacion)}</span>
                        <span>${producto.calificacion}</span>
                    </div>
                    ${precioHTML}
                </div>
            </a>
            <button
                type="button"
                class="btn-quitar"
                onclick="eliminarDelCarrito(${producto.id})"
                aria-label="Quitar ${producto.titulo} del carrito"
            >
                Quitar del carrito
            </button>
        </div>
    `;
}

/* ── Carga y render del carrito ──────────────────────────── */

function cargarCarrito() {
    const cartIDs = obtenerCarrito();
    const contenedorGrid = document.getElementById("carritoGrid");
    const resumenFilas = document.getElementById("resumenFilas");
    const totalPrecioEl = document.getElementById("totalPrecio");
    const tarjetaStatusEl = document.getElementById("tarjetaStatus");
    const btnComprar = document.getElementById("btnComprar");

    if (!contenedorGrid) return;

    if (cartIDs.length === 0) {
        contenedorGrid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 3rem 1rem; text-align: center;">
                <p style="font-size: 1.2rem; color: var(--ink-soft); margin-bottom: 1rem;">Tu carrito está vacío</p>
                <a href="products.html" style="display:inline-block; padding: .6rem 1.2rem; background: var(--brand-deep); color:#fff; border-radius: var(--radius-sm); font-weight:700;">Ver productos</a>
            </div>
        `;
        if (resumenFilas) resumenFilas.innerHTML = "<p style='color:var(--ink-soft)'>No hay productos</p>";
        if (totalPrecioEl) totalPrecioEl.textContent = formatearPrecio(0);
        actualizarEstadoTarjeta(tarjetaStatusEl);
        if (btnComprar) btnComprar.disabled = true;
        return;
    }

    if (btnComprar) btnComprar.disabled = false;

    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(datos => {
            const productosEnCarrito = datos.productos.filter(p => cartIDs.includes(p.id));

            // Renderizar grid de productos
            contenedorGrid.innerHTML = productosEnCarrito.map(crearTarjetaCarrito).join("");

            // Renderizar resumen de precios
            let total = 0;
            let filasHTML = "";

            productosEnCarrito.forEach(p => {
                const precio = (p.precio_oferta !== -1 && p.precio_oferta > 0) ? p.precio_oferta : p.precio;
                total += precio;
                filasHTML += `
                    <div class="resumen-fila">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 12rem;">${p.titulo}</span>
                        <strong>${formatearPrecio(precio)}</strong>
                    </div>
                `;
            });

            if (resumenFilas) resumenFilas.innerHTML = filasHTML;
            if (totalPrecioEl) totalPrecioEl.textContent = formatearPrecio(total);

            actualizarEstadoTarjeta(tarjetaStatusEl);
        })
        .catch(err => {
            console.error("Error al cargar productos del carrito:", err);
            contenedorGrid.innerHTML = "<p style='color:var(--danger)'>Error al cargar el carrito.</p>";
        });
}

/* ── Verificación de Tarjeta Guardada ─────────────────────── */

function actualizarEstadoTarjeta(contenedor) {
    if (!contenedor) return;

    const tarjeta = localStorage.getItem("tarjeta");
    const tipoTarjeta = localStorage.getItem("tipoTarjeta") || "Tarjeta";

    if (tarjeta && tarjeta.length >= 16) {
        const ultimos4 = tarjeta.slice(-4);
        contenedor.className = "tarjeta-status tarjeta-status--ok";
        contenedor.innerHTML = `
            <strong> Tarjeta Registrada</strong>
            <span>${tipoTarjeta} **** ${ultimos4}</span>
        `;
    } else {
        contenedor.className = "tarjeta-status tarjeta-status--vacio";
        contenedor.innerHTML = `
            <strong> No tienes tarjeta registrada</strong>
            <span>Necesitas agregar una tarjeta de crédito para comprar.</span>
            <a href="logins/CreditCard.html" style="font-weight:700; color:#805000; margin-top:.3rem; display:inline-block;">+ Registrar Tarjeta</a>
        `;
    }
}

/* ── Proceso de Compra ────────────────────────────────────── */

function realizarCompra() {
    const cartIDs = obtenerCarrito();
    if (cartIDs.length === 0) {
        alert("El carrito está vacío.");
        return;
    }

    const tarjeta = localStorage.getItem("tarjeta");
    if (!tarjeta) {
        alert("Debes registrar una tarjeta de crédito antes de realizar la compra.");
        window.location.href = "logins/CreditCard.html";
        return;
    }

    alert("¡Muchas gracias por tu compra! Tu pedido ha sido procesado con éxito.");
    guardarCarrito([]);
    cargarCarrito();
}

// Globalizar funciones
window.eliminarDelCarrito = eliminarDelCarrito;
window.realizarCompra = realizarCompra;

// Inicializar al cargar el DOM
document.addEventListener("DOMContentLoaded", cargarCarrito);
