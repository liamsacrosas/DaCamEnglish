/* carrito.js — Shopping cart management & payment verification */

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";

/* ── Storage ──────────────────────────────────────────────── */

function obtenerCarrito() {
    return JSON.parse(localStorage.getItem("carrito") || "[]");
}

function guardarCarrito(carrito) {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

/** Modifica la cantidad de una cámara comprada (+1 / -1) */
function modificarCantidad(idProducto, delta) {
    let carrito = obtenerCarrito();
    if (delta > 0) {
        carrito.push(idProducto);
    } else if (delta < 0) {
        const index = carrito.findIndex(item => item === idProducto);
        if (index !== -1) {
            carrito.splice(index, 1);
        }
    }
    guardarCarrito(carrito);
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
    cargarCarrito();
}

/** Elimina todas las compras estándar de un producto */
function eliminarDelCarrito(idProducto) {
    let carrito = obtenerCarrito();
    carrito = carrito.filter(item => item !== idProducto);
    guardarCarrito(carrito);
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
    cargarCarrito();
}

/** Elimina un item específico (ej. un alquiler) por su índice en el carrito */
function eliminarItemPorIndice(index) {
    let carrito = obtenerCarrito();
    if (index >= 0 && index < carrito.length) {
        carrito.splice(index, 1);
        guardarCarrito(carrito);
        if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
        cargarCarrito();
    }
}

/* ── Formatting ───────────────────────────────────────────── */

function generarEstrellas(calificacion) {
    if (typeof calificacion !== "number" || calificacion <= 0) return "★★★★★";
    const llenas = Math.floor(calificacion);
    const media = calificacion % 1 >= 0.5 ? 1 : 0;
    const vacias = Math.max(0, 5 - llenas - media);
    const countLlenas = Math.max(0, llenas);
    return "★".repeat(countLlenas) + (media ? "½" : "") + "☆".repeat(vacias);
}

function formatearPrecio(num) {
    return num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });
}

/* ── Product Card Component (Compras) ───────────── */

function crearTarjetaCarrito(producto, cantidad) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;
    const precioUnitario = tieneOferta ? producto.precio_oferta : producto.precio;
    const precioSubtotal = precioUnitario * cantidad;

    const precioHTML = tieneOferta
        ? `<p class="producto__precio">
               ${formatearPrecio(precioSubtotal)}
               <span class="producto__precio--oferta">Was: ${formatearPrecio(producto.precio * cantidad)}</span>
           </p>`
        : `<p class="producto__precio">${formatearPrecio(precioSubtotal)}</p>`;

    const imgSrc = (Array.isArray(producto.imagenes) && producto.imagenes.length > 0)
        ? producto.imagenes[0]
        : `https://picsum.photos/seed/dacam${producto.id}/600/800`;

    const ratingVal = producto.calificacion === -1 ? "New" : producto.calificacion.toFixed(1);

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
                        <span>${ratingVal}</span>
                    </div>
                    ${precioHTML}
                </div>
            </a>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-top:.75rem; padding-top:.5rem; border-top:1px solid var(--line);">
                <div style="display:flex; align-items:center; gap:.4rem;">
                    <button type="button" style="padding:.25rem .6rem; min-height:auto; font-weight:800; border-radius:var(--radius-sm);" onclick="modificarCantidad(${producto.id}, -1)" aria-label="Decrease quantity">-</button>
                    <span style="font-weight:800; font-size:.85rem; padding:0 .3rem;">Qty: ${cantidad}</span>
                    <button type="button" style="padding:.25rem .6rem; min-height:auto; font-weight:800; border-radius:var(--radius-sm);" onclick="modificarCantidad(${producto.id}, 1)" aria-label="Increase quantity">+</button>
                </div>
                <button
                    type="button"
                    class="btn-quitar"
                    onclick="eliminarDelCarrito(${producto.id})"
                    aria-label="Remove ${producto.titulo} from cart"
                >
                    Remove All
                </button>
            </div>
        </div>
    `;
}

/* ── Product Card Component (Alquileres) ────────── */

function crearTarjetaAlquiler(producto, rentalObj, index) {
    const imgSrc = (Array.isArray(producto.imagenes) && producto.imagenes.length > 0)
        ? producto.imagenes[0]
        : `https://picsum.photos/seed/dacam${producto.id}/600/800`;

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
                    <h3 class="producto__titulo">${producto.titulo} <span style="font-size:.72rem; background:var(--brand-deep); color:#fff; padding:.2rem .4rem; border-radius:var(--radius-sm); font-weight:800; margin-left:.3rem;">Rental</span></h3>
                    <div class="producto__rating">
                        <span style="font-weight:700; font-size:.8rem; color:var(--brand-deep);">2.5% / Day (${formatearPrecio(rentalObj.tarifaDiaria)}/day)</span>
                    </div>
                    <p class="producto__precio">${formatearPrecio(rentalObj.totalAlquiler)}</p>
                </div>
            </a>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:.75rem; margin-top:.75rem; padding-top:.5rem; border-top:1px solid var(--line);">
                <span style="font-size:.82rem; color:var(--ink-soft); font-weight:800;">Duration: ${rentalObj.dias} Days</span>
                <button
                    type="button"
                    class="btn-quitar"
                    onclick="eliminarItemPorIndice(${index})"
                    aria-label="Remove rental from cart"
                >
                    Remove Rental
                </button>
            </div>
        </div>
    `;
}

/* ── Cart Rendering ───────────────────────────────────────── */

function cargarCarrito() {
    const rawCart = obtenerCarrito();
    const contenedorGrid = document.getElementById("carritoGrid");
    const resumenFilas = document.getElementById("resumenFilas");
    const totalPrecioEl = document.getElementById("totalPrecio");
    const tarjetaStatusEl = document.getElementById("tarjetaStatus");
    const btnComprar = document.getElementById("btnComprar");

    if (!contenedorGrid) return;

    if (rawCart.length === 0) {
        contenedorGrid.innerHTML = `
            <div style="grid-column: 1/-1; padding: 3rem 1rem; text-align: center;">
                <p style="font-size: 1.2rem; color: var(--ink-soft); margin-bottom: 1rem;">Your shopping cart is empty</p>
                <a href="products.html" style="display:inline-block; padding: .6rem 1.2rem; background: var(--brand-deep); color:#fff; border-radius: var(--radius-sm); font-weight:700;">Browse Products</a>
            </div>
        `;
        if (resumenFilas) resumenFilas.innerHTML = "<p style='color:var(--ink-soft)'>No items in cart</p>";
        if (totalPrecioEl) totalPrecioEl.textContent = formatearPrecio(0);
        actualizarEstadoTarjeta(tarjetaStatusEl);
        if (btnComprar) btnComprar.disabled = true;
        return;
    }

    if (btnComprar) btnComprar.disabled = false;

    // Separar compras estándar de alquileres
    const comprasIDs = [];
    const alquileres = [];

    rawCart.forEach((item, index) => {
        if (typeof item === "number") {
            comprasIDs.push(item);
        } else if (item && typeof item === "object" && item.tipo === "alquiler") {
            alquileres.push({ index, rentalObj: item });
        }
    });

    const conteoCompras = {};
    comprasIDs.forEach(id => {
        conteoCompras[id] = (conteoCompras[id] || 0) + 1;
    });

    fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-cache" })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(datos => {
            let htmlGrid = "";
            let total = 0;
            let filasHTML = "";

            // 1. Render compras estándar
            const uniqueIDs = Object.keys(conteoCompras).map(Number);
            const productosCompras = datos.productos.filter(p => uniqueIDs.includes(p.id));

            productosCompras.forEach(p => {
                const cantidad = conteoCompras[p.id];
                const precioUnitario = (p.precio_oferta !== -1 && p.precio_oferta > 0) ? p.precio_oferta : p.precio;
                const subtotal = precioUnitario * cantidad;
                total += subtotal;

                htmlGrid += crearTarjetaCarrito(p, cantidad);
                filasHTML += `
                    <div class="resumen-fila">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 12rem;">${p.titulo} (${cantidad}x)</span>
                        <strong>${formatearPrecio(subtotal)}</strong>
                    </div>
                `;
            });

            // 2. Render órdenes de alquiler por día
            alquileres.forEach(({ index, rentalObj }) => {
                const producto = datos.productos.find(p => p.id === rentalObj.id);
                if (!producto) return;

                const subtotal = rentalObj.totalAlquiler;
                total += subtotal;

                htmlGrid += crearTarjetaAlquiler(producto, rentalObj, index);
                filasHTML += `
                    <div class="resumen-fila">
                        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 12rem;">${producto.titulo} (Rental ${rentalObj.dias}d)</span>
                        <strong>${formatearPrecio(subtotal)}</strong>
                    </div>
                `;
            });

            // 3. Cálculo de Costo de Envío (5% si subtotal < $10.000.000, Gratis si >= $10.000.000)
            const subtotalTotal = total;
            let costoEnvio = 0;
            const envioPrecioEl = document.getElementById("envioPrecio");

            if (subtotalTotal < 10000000) {
                costoEnvio = Math.round(subtotalTotal * 0.05);
                if (envioPrecioEl) {
                    envioPrecioEl.innerHTML = `<strong>${formatearPrecio(costoEnvio)}</strong> <span style="font-size:.72rem; color:var(--ink-soft); font-weight:normal;">(5%)</span>`;
                }
            } else {
                costoEnvio = 0;
                if (envioPrecioEl) {
                    envioPrecioEl.innerHTML = `<strong style="color:var(--brand-deep);">FREE</strong> <span style="font-size:.72rem; color:var(--ink-soft); font-weight:normal;">(Order ≥ $10M)</span>`;
                }
            }

            const totalFinal = subtotalTotal + costoEnvio;

            contenedorGrid.innerHTML = htmlGrid;
            if (resumenFilas) resumenFilas.innerHTML = filasHTML;
            if (totalPrecioEl) totalPrecioEl.textContent = formatearPrecio(totalFinal);

            actualizarEstadoTarjeta(tarjetaStatusEl);
        })
        .catch(err => {
            console.error("Error loading cart products:", err);
            contenedorGrid.innerHTML = "<p style='color:var(--danger)'>Error loading shopping cart.</p>";
        });
}

/* ── Credit Card Verification ─────────────────────────────── */

function actualizarEstadoTarjeta(contenedor) {
    if (!contenedor) return;

    const tarjeta = localStorage.getItem("tarjeta");
    const tipoTarjeta = localStorage.getItem("tipoTarjeta") || "Card";
    const calle = localStorage.getItem("direccionCalle");
    const ciudad = localStorage.getItem("direccionCiudad");
    const cp = localStorage.getItem("direccionCodigoPostal");

    if (tarjeta && tarjeta.length >= 16) {
        const ultimos4 = tarjeta.slice(-4);
        const direccionTexto = (calle && ciudad) ? `<br><small style="color:var(--ink-soft); font-weight:600;">Ship to: ${calle}, ${ciudad} (${cp || ''})</small>` : '';
        contenedor.className = "tarjeta-status tarjeta-status--ok";
        contenedor.innerHTML = `
            <strong>Card & Address Registered</strong>
            <span>${tipoTarjeta} **** ${ultimos4}${direccionTexto}</span>
        `;
    } else {
        contenedor.className = "tarjeta-status tarjeta-status--vacio";
        contenedor.innerHTML = `
            <strong>No registered credit card / address</strong>
            <span>You need to register your card and shipping address before checking out.</span>
            <a href="logins/CreditCard.html" style="font-weight:700; color:#805000; margin-top:.3rem; display:inline-block;">+ Add Card & Shipping Details</a>
        `;
    }
}

/* ── Checkout Process ─────────────────────────────────────── */

function realizarCompra() {
    const rawCart = obtenerCarrito();
    if (rawCart.length === 0) {
        alert("Your shopping cart is empty.");
        return;
    }

    const tarjeta = localStorage.getItem("tarjeta");
    if (!tarjeta) {
        alert("Please register a credit card before completing your purchase.");
        window.location.href = "logins/CreditCard.html";
        return;
    }

    alert("Thank you for your order! Your purchase / rental order has been processed successfully.");
    guardarCarrito([]);
    if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
    cargarCarrito();
}

// Global functions
window.modificarCantidad = modificarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.eliminarItemPorIndice = eliminarItemPorIndice;
window.realizarCompra = realizarCompra;

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", cargarCarrito);
