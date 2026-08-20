/* compra.js — Rellena los campos de compra.html con los datos del producto */

/* ── Galería de miniaturas ────────────────────────────────── */

/**
 * Genera URLs de imagen usando picsum con semillas distintas
 * para simular varias fotos del mismo producto.
 */
function generarImagenes(idProducto, cantidad = 5) {
    const semillas = Array.from({ length: cantidad }, (_, i) =>
        `dacam${idProducto}-${i}`
    );
    return semillas.map(s => ({
        thumb: `https://picsum.photos/seed/${s}/120/160`,
        full:  `https://picsum.photos/seed/${s}/600/800`,
    }));
}

/** Construye la columna de miniaturas y conecta el evento de cambio */
function rellenarMiniaturas(imagenes) {
    const contenedor = document.querySelector(".miniImgs");
    const imgPrincipal = document.getElementById("buyImage");

    if (!contenedor || !imgPrincipal) return;

    contenedor.innerHTML = imagenes
        .map((img, i) => `
            <button
                class="mini-thumb ${i === 0 ? "mini-thumb--activa" : ""}"
                data-src="${img.full}"
                aria-label="Ver imagen ${i + 1}"
                type="button"
            >
                <img src="${img.thumb}" alt="Vista ${i + 1}" loading="lazy">
            </button>
        `)
        .join("");

    // Evento delegado en el contenedor
    contenedor.addEventListener("click", e => {
        const btn = e.target.closest(".mini-thumb");
        if (!btn) return;

        // Cambiar imagen principal con fade
        imgPrincipal.style.opacity = "0";
        setTimeout(() => {
            imgPrincipal.src = btn.dataset.src;
            imgPrincipal.style.opacity = "1";
        }, 150);

        // Actualizar estado activo
        contenedor.querySelectorAll(".mini-thumb").forEach(b =>
            b.classList.remove("mini-thumb--activa")
        );
        btn.classList.add("mini-thumb--activa");
    });
}

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";

/* ── Helpers ──────────────────────────────────────────────── */

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

/* ── Tarjetas reutilizables (.producto) ───────────────────── */

function crearTarjeta(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    const precioHTML = tieneOferta
        ? `<p class="producto__precio">
               ${formatearPrecio(producto.precio_oferta)}
               <span class="producto__precio--oferta">Antes: ${formatearPrecio(producto.precio)}</span>
           </p>`
        : `<p class="producto__precio">${formatearPrecio(producto.precio)}</p>`;

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

function rellenarOtrosProductos(productos, idActual) {
    const contenedor = document.getElementById("carrouselContainer");
    if (!contenedor) return;

    // Filtrar el producto actual
    const otros = productos.filter(p => p.id !== idActual);

    contenedor.innerHTML = otros.map(crearTarjeta).join("");
}

/* ── Navegación del Carrusel ──────────────────────────────── */

function scrollCarrousel(direccion) {
    const container = document.getElementById("carrouselContainer");
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
        left: direccion * scrollAmount,
        behavior: "smooth",
    });
}

window.left = function() {
    scrollCarrousel(-1);
};

window.right = function() {
    scrollCarrousel(1);
};

/* ── Relleno de campos ────────────────────────────────────── */

function rellenarPagina(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    // Imagen principal + galería de miniaturas
    const imagenes = generarImagenes(producto.id, 5);
    const buyImage = document.getElementById("buyImage");
    if (buyImage) {
        buyImage.src = imagenes[0].full;
        buyImage.alt = producto.titulo;
        buyImage.style.transition = "opacity 150ms ease";
    }
    rellenarMiniaturas(imagenes);

    // Título
    document.getElementById("ProductTittle").textContent = producto.titulo;

    // Estrellas (dos lugares: specs y ratings)
    const estrellas = generarEstrellas(producto.calificacion);
    document.getElementById("stars").textContent = estrellas;
    document.getElementById("starSecond").textContent = estrellas;

    // Precio
    if (tieneOferta) {
        document.getElementById("buyPrice").textContent = formatearPrecio(producto.precio_oferta);
        document.getElementById("buyPriceOffer").textContent =
            `Antes: ${formatearPrecio(producto.precio)}`;
    } else {
        document.getElementById("buyPrice").textContent = formatearPrecio(producto.precio);
        document.getElementById("buyPriceOffer").textContent = "";
    }

    // Características resumidas
    const specsResume = document.getElementById("specsResume");
    specsResume.innerHTML = producto.resumen_caracteristicas
        .map(c => `<li>${c}</li>`)
        .join("");

    // Stock y envío
    document.getElementById("buyStock").textContent =
        producto.stock > 0
            ? `Stock disponible: ${producto.stock} unidades`
            : "Sin stock";

    document.getElementById("DeliveryPrice").textContent = "Envío gratis a todo el país";

    // Garantía
    document.getElementById("warranty").textContent = `Garantía: ${producto.garantia}`;

    // Calificación numérica
    document.getElementById("ratingNumber").textContent = producto.calificacion.toFixed(1);
    document.getElementById("numberOfRatings").textContent =
        `${producto.cantidad_calificaciones.toLocaleString("es-AR")} calificaciones`;

    // Comentarios
    const ratingsContainer = document.getElementById("ratingsContainer");
    ratingsContainer.innerHTML = producto.comentarios
        .map(c => `
            <div class="rating-item">
                <div class="rating-item__header">
                    <span class="rating-item__estrellas">${generarEstrellas(c.calificacion)}</span>
                    <span class="rating-item__lugar">${c.lugar}</span>
                    <span class="rating-item__fecha">${new Date(c.fecha).toLocaleDateString("es-AR")}</span>
                </div>
                <p class="rating-item__comentario">${c.comentario}</p>
            </div>
        `)
        .join("");

    // Botones de compra y carrito
    const btnAddCart = document.getElementById("buyAddToCart");
    if (btnAddCart) {
        btnAddCart.onclick = () => {
            let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            if (!carrito.includes(producto.id)) {
                carrito.push(producto.id);
                localStorage.setItem("carrito", JSON.stringify(carrito));
            }
            alert(`"${producto.titulo}" fue agregado al carrito.`);
        };
    }

    const btnBuyMain = document.getElementById("buyButtonMain");
    if (btnBuyMain) {
        btnBuyMain.onclick = () => {
            let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");
            if (!carrito.includes(producto.id)) {
                carrito.push(producto.id);
                localStorage.setItem("carrito", JSON.stringify(carrito));
            }
            window.location.href = "carrito.html";
        };
    }

    // Título de la pestaña
    document.title = `${producto.titulo} — DaCam`;
}

/* ── Fetch ────────────────────────────────────────────────── */

const params = new URLSearchParams(window.location.search);
const idProducto = parseInt(params.get("id"), 10);

if (!idProducto) {
    // Si no hay id en la URL, redirigir a la tienda
    window.location.href = "products.html";
} else {
    fetch(API_URL)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(datos => {
            const producto = datos.productos.find(p => p.id === idProducto);

            if (!producto) {
                window.location.href = "products.html";
                return;
            }

            rellenarPagina(producto);
            rellenarOtrosProductos(datos.productos, idProducto);
        })
        .catch(err => {
            console.error("Error cargando el producto:", err);
            document.querySelector(".mainshop").innerHTML =
                `<p style="color:var(--danger);padding:2rem">
                    Error al cargar el producto. <a href="products.html">Volver a la tienda</a>
                </p>`;
        });
}