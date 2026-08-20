/* products.js — Carga y renderiza las tarjetas de productos en products.html */

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";
const PRODUCTOS_POR_PAGINA = 12;

let todosLosProductos = [];
let paginaActual = 1;

/* ── Helpers ──────────────────────────────────────────────── */

/** Genera la cadena de estrellas (llenas, medias, vacías) */
function generarEstrellas(calificacion) {
    const llenas = Math.floor(calificacion);
    const media = calificacion % 1 >= 0.5 ? 1 : 0;
    const vacias = 5 - llenas - media;

    return "★".repeat(llenas) + (media ? "½" : "") + "☆".repeat(vacias);
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
        case "mejor-peor": return copia.sort((a, b) => b.calificacion - a.calificacion);
        case "peor-mejor": return copia.sort((a, b) => a.calificacion - b.calificacion);
        case "precio-mayor": return copia.sort((a, b) => b.precio - a.precio);
        case "precio-menor": return copia.sort((a, b) => a.precio - b.precio);
        default: return copia;
    }
}

/* ── Render ───────────────────────────────────────────────── */

/** Crea el HTML de una tarjeta .producto */
function crearTarjeta(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    const precioHTML = tieneOferta
        ? `<p class="producto__precio">
               ${formatearPrecio(producto.precio_oferta)}
               <span class="producto__precio--oferta">Antes: ${formatearPrecio(producto.precio)}</span>
           </p>`
        : `<p class="producto__precio">${formatearPrecio(producto.precio)}</p>`;

    // Imagen generada con picsum basada en el id del producto
    const imgSrc = `https://picsum.photos/seed/dacam${producto.id}/600/800`;

    return `
        <a class="producto" href="compra.html?id=${producto.id}" id="prod-${producto.id}">
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
                    <span>${producto.calificacion} (${producto.cantidad_calificaciones.toLocaleString("es-AR")})</span>
                </div>
                ${precioHTML}
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
        : `<p style="grid-column:1/-1;color:var(--ink-soft)">No hay productos disponibles.</p>`;

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

    // Botón anterior
    html += `<button
        class="pag-btn"
        onclick="cambiarPagina(${paginaActual - 1})"
        ${paginaActual === 1 ? "disabled" : ""}
        aria-label="Página anterior">‹</button>`;

    // Páginas numeradas
    for (let i = 1; i <= totalPaginas; i++) {
        html += `<button
            class="pag-btn ${i === paginaActual ? "pag-btn--activa" : ""}"
            onclick="cambiarPagina(${i})"
            aria-current="${i === paginaActual ? "page" : "false"}">${i}</button>`;
    }

    // Botón siguiente
    html += `<button
        class="pag-btn"
        onclick="cambiarPagina(${paginaActual + 1})"
        ${paginaActual === totalPaginas ? "disabled" : ""}
        aria-label="Página siguiente">›</button>`;

    contenedor.innerHTML = html;
}

/** Cambia la página y hace scroll suave al tope del grid */
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

/* ── Fetch ────────────────────────────────────────────────── */

fetch(API_URL)
    .then(respuesta => {
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        return respuesta.json();
    })
    .then(datos => {
        todosLosProductos = datos.productos;
        const criterioInicial = document.getElementById("filter").value;
        renderizarProductos(ordenarProductos(todosLosProductos, criterioInicial));
    })
    .catch(err => {
        console.error("Error cargando productos:", err);
        document.getElementById("products").innerHTML =
            `<p style="grid-column:1/-1;color:var(--danger)">
                Error al cargar los productos. Intentá de nuevo más tarde.
            </p>`;
    });
