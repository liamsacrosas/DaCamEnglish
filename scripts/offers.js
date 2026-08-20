/* offers.js — Carga y renderiza SOLO los productos en oferta en offers.html */

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";
const PRODUCTOS_POR_PAGINA = 12;

let todosLosProductos = []; // solo los que tienen oferta
let paginaActual = 1;

/* ── Helpers ──────────────────────────────────────────────── */

/** Calcula el porcentaje de descuento */
function calcularDescuento(precioOriginal, precioOferta) {
    if (!precioOriginal || !precioOferta) return 0;
    return Math.round(((precioOriginal - precioOferta) / precioOriginal) * 100);
}

/** Genera la cadena de estrellas */
function generarEstrellas(calificacion) {
    if (typeof calificacion !== "number" || calificacion <= 0) return "★★★★★";
    const llenas = Math.floor(calificacion);
    const media = calificacion % 1 >= 0.5 ? 1 : 0;
    const vacias = Math.max(0, 5 - llenas - media);
    return "★".repeat(Math.max(0, llenas)) + (media ? "½" : "") + "☆".repeat(vacias);
}

/** Formatea un número como precio en pesos argentinos */
function formatearPrecio(num) {
    return num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });
}

/* ── Ordenamiento ─────────────────────────────────────────── */

function ordenarProductos(lista, criterio) {
    const copia = [...lista];
    switch (criterio) {
        case "mayor-descuento":
            return copia.sort((a, b) =>
                calcularDescuento(b.precio, b.precio_oferta) - calcularDescuento(a.precio, a.precio_oferta)
            );
        case "menor-descuento":
            return copia.sort((a, b) =>
                calcularDescuento(a.precio, a.precio_oferta) - calcularDescuento(b.precio, b.precio_oferta)
            );
        case "precio-mayor":
            return copia.sort((a, b) => b.precio_oferta - a.precio_oferta);
        case "precio-menor":
            return copia.sort((a, b) => a.precio_oferta - b.precio_oferta);
        default:
            return copia;
    }
}

/* ── Render ───────────────────────────────────────────────── */

/** Crea el HTML de una tarjeta de producto en oferta */
function crearTarjeta(producto) {
    const descuento = calcularDescuento(producto.precio, producto.precio_oferta);
    const ahorro = producto.precio - producto.precio_oferta;

    const imgSrc = (Array.isArray(producto.imagenes) && producto.imagenes.length > 0)
        ? producto.imagenes[0]
        : `https://picsum.photos/seed/dacam${producto.id}/600/800`;

    const ratingVal = producto.calificacion === -1 ? "New" : producto.calificacion.toFixed(1);
    const reviewsVal = producto.cantidad_calificaciones === -1 ? "" : `(${producto.cantidad_calificaciones})`;

    return `
        <a class="producto producto--oferta" href="compra.html?id=${producto.id}" id="prod-${producto.id}">
            <span class="oferta-badge">-${descuento}% OFF</span>
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
                    <span>${ratingVal} ${reviewsVal}</span>
                </div>
                <p class="producto__precio">
                    <span class="precio-oferta-valor">${formatearPrecio(producto.precio_oferta)}</span>
                    <span class="producto__precio--original"> ${formatearPrecio(producto.precio)}</span>
                    <span class="precio-ahorro">You save ${formatearPrecio(ahorro)}</span>
                </p>
            </div>
        </a>
    `;
}

/** Renderiza la página actual de productos */
function renderizarProductos(lista) {
    const contenedor = document.getElementById("products");
    const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    const pagina = lista.slice(inicio, fin);

    contenedor.innerHTML = pagina.length
        ? pagina.map(crearTarjeta).join("")
        : `<p style="grid-column:1/-1;color:var(--ink-soft)">No products on sale right now. Check back soon!</p>`;

    renderizarPaginacion(lista.length);
}

/* ── Paginación ───────────────────────────────────────────── */

function renderizarPaginacion(total) {
    const contenedor = document.getElementById("pagination");
    const totalPaginas = Math.ceil(total / PRODUCTOS_POR_PAGINA);

    if (totalPaginas <= 1) {
        contenedor.innerHTML = "";
        return;
    }

    let html = "";

    html += `<button
        class="pag-btn"
        onclick="cambiarPagina(${paginaActual - 1})"
        ${paginaActual === 1 ? "disabled" : ""}
        aria-label="Previous page">&#8249;</button>`;

    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button
            class="pag-btn ${i === paginaActual ? "pag-btn--activa" : ""}"
            onclick="cambiarPagina(${i})"
            aria-current="${i === paginaActual ? "page" : "false"}">${i}</button>`;
    }

    html += `<button
        class="pag-btn"
        onclick="cambiarPagina(${paginaActual + 1})"
        ${paginaActual === totalPaginas ? "disabled" : ""}
        aria-label="Next page">&#8250;</button>`;

    contenedor.innerHTML = html;
}

/** Cambia la página */
function cambiarPagina(nuevaPagina) {
    const criterio = document.getElementById("filter").value;
    const lista = ordenarProductos(todosLosProductos, criterio);
    const total = Math.ceil(lista.length / PRODUCTOS_POR_PAGINA);

    if (nuevaPagina < 1 || nuevaPagina > total) return;

    paginaActual = nuevaPagina;
    renderizarProductos(lista);
    document.getElementById("products").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Evento de ordenamiento ───────────────────────────────── */

function ordenarProd(criterio) {
    paginaActual = 1;
    renderizarProductos(ordenarProductos(todosLosProductos, criterio));
}

/* ── Actualizar UI de stats ───────────────────────────────── */

function actualizarStats(productos) {
    const countEl = document.getElementById("offer-count");
    const maxDiscEl = document.getElementById("max-discount");

    if (countEl) countEl.textContent = productos.length;

    if (maxDiscEl && productos.length > 0) {
        const maxDesc = Math.max(
            ...productos.map(p => calcularDescuento(p.precio, p.precio_oferta))
        );
        maxDiscEl.textContent = `${maxDesc}%`;
    }
}

/* ── Fetch ────────────────────────────────────────────────── */

fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-cache" })
    .then(respuesta => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
    })
    .then(datos => {
        // Filtrar SOLO los productos con precio_oferta válido
        todosLosProductos = datos.productos.filter(
            p => p.precio_oferta !== -1 && p.precio_oferta > 0 && p.precio_oferta < p.precio
        );

        actualizarStats(todosLosProductos);

        const criterioInicial = document.getElementById("filter").value;
        renderizarProductos(ordenarProductos(todosLosProductos, criterioInicial));
    })
    .catch(err => {
        console.error("Error loading offers:", err);
        document.getElementById("products").innerHTML =
            `<p style="grid-column:1/-1;color:var(--danger)">
                Error loading offers. Please try again later.
            </p>`;
    });
