/* compra.js — Rellena los campos de compra.html con los datos del producto */

/* ── Galería de miniaturas ────────────────────────────────── */

function generarImagenes(idProducto, imagenesProducto, cantidad = 5) {
    if (Array.isArray(imagenesProducto) && imagenesProducto.length > 0) {
        return imagenesProducto.map(url => ({ thumb: url, full: url }));
    }
    const semillas = Array.from({ length: cantidad }, (_, i) =>
        `dacam${idProducto}-${i}`
    );
    return semillas.map(s => ({
        thumb: `https://picsum.photos/seed/${s}/120/160`,
        full: `https://picsum.photos/seed/${s}/600/800`,
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
                aria-label="View image ${i + 1}"
                type="button"
            >
                <img src="${img.thumb}" alt="View ${i + 1}" loading="lazy">
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

/* ── Tarjetas reutilizables (.producto) ───────────────────── */

function crearTarjeta(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    const precioHTML = tieneOferta
        ? `<p class="producto__precio">
               ${formatearPrecio(producto.precio_oferta)}
               <span class="producto__precio--oferta">Was: ${formatearPrecio(producto.precio)}</span>
           </p>`
        : `<p class="producto__precio">${formatearPrecio(producto.precio)}</p>`;

    const imgSrc = (Array.isArray(producto.imagenes) && producto.imagenes.length > 0)
        ? producto.imagenes[0]
        : `https://picsum.photos/seed/dacam${producto.id}/600/800`;

    const ratingVal = producto.calificacion === -1 ? "New" : producto.calificacion.toFixed(1);

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
                    <span>${ratingVal}</span>
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

window.left = function () {
    scrollCarrousel(-1);
};

window.right = function () {
    scrollCarrousel(1);
};

/* ── Relleno de campos ────────────────────────────────────── */

function rellenarPagina(producto) {
    const tieneOferta = producto.precio_oferta !== -1 && producto.precio_oferta > 0;

    // Imagen principal + galería de miniaturas
    const imagenes = generarImagenes(producto.id, producto.imagenes, 5);
    const buyImage = document.getElementById("buyImage");
    if (buyImage) {
        buyImage.src = imagenes[0].full;
        buyImage.alt = producto.titulo;
        buyImage.style.transition = "opacity 150ms ease";
    }
    rellenarMiniaturas(imagenes);

    // Título
    document.getElementById("ProductTittle").textContent = producto.titulo;

    // Estrellas
    const estrellas = generarEstrellas(producto.calificacion);
    document.getElementById("stars").textContent = estrellas;
    document.getElementById("starSecond").textContent = estrellas;

    // Precio
    if (tieneOferta) {
        document.getElementById("buyPrice").textContent = formatearPrecio(producto.precio_oferta);
        document.getElementById("buyPriceOffer").textContent =
            `Was: ${formatearPrecio(producto.precio)}`;
    } else {
        document.getElementById("buyPrice").textContent = formatearPrecio(producto.precio);
        document.getElementById("buyPriceOffer").textContent = "";
    }

    // Características resumidas
    const specsResume = document.getElementById("specsResume");
    if (specsResume && Array.isArray(producto.resumen_caracteristicas)) {
        specsResume.innerHTML = producto.resumen_caracteristicas
            .map(c => `<li>${c}</li>`)
            .join("");
    }

    // Stock y envío
    const stockText = (producto.stock === "unavailable" || !producto.stock)
        ? "Check availability"
        : `${producto.stock} units available`;
    document.getElementById("buyStock").textContent = stockText;

    document.getElementById("DeliveryPrice").textContent = "Free shipping Nationwide";

    // Garantía
    const garantiaText = (producto.garantia === "unavailable" || !producto.garantia)
        ? "Standard 1-Year Warranty Included"
        : `Warranty: ${producto.garantia}`;
    document.getElementById("warranty").textContent = garantiaText;

    // Calificación numérica
    const ratingNum = producto.calificacion === -1 ? "5.0" : producto.calificacion.toFixed(1);
    const ratingCount = producto.cantidad_calificaciones === -1 ? "New arrival" : `${producto.cantidad_calificaciones} ratings`;
    document.getElementById("ratingNumber").textContent = ratingNum;
    document.getElementById("numberOfRatings").textContent = ratingCount;

    // Detalle de características avanzadas (caracteristicas object)
    const otherSpecs = document.getElementById("otherSpecs");
    if (otherSpecs && producto.caracteristicas) {
        const c = producto.caracteristicas;
        otherSpecs.innerHTML = `
            <h3>Technical Specifications</h3>
            <ul style="list-style:none; padding:0; margin-top:.75rem; display:flex; flex-direction:column; gap:.4rem; font-size:.85rem; color:var(--ink-soft);">
                ${c.sensor ? `<li><strong>Sensor:</strong> ${c.sensor}</li>` : ""}
                ${c.resolucion || c.resolution ? `<li><strong>Resolution:</strong> ${c.resolucion || c.resolution}</li>` : ""}
                ${c.video || c["video-options"] ? `<li><strong>Video:</strong> ${c.video || c["video-options"]}</li>` : ""}
                ${c.rango_iso || c["iso-range"] ? `<li><strong>ISO Range:</strong> ${c.rango_iso || c["iso-range"]}</li>` : ""}
                ${c.rafaga || c.burst ? `<li><strong>Burst:</strong> ${c.rafaga || c.burst}</li>` : ""}
                ${c.montura || c.mount ? `<li><strong>Mount:</strong> ${c.montura || c.mount}</li>` : ""}
                ${c.peso || c.weight ? `<li><strong>Weight:</strong> ${c.peso || c.weight}</li>` : ""}
                ${c["standout-comment"] ? `<li style="margin-top:.5rem; font-style:italic;">"${c["standout-comment"]}"</li>` : ""}
            </ul>
        `;
    }

    // Comentarios
    const ratingsContainer = document.getElementById("ratingsContainer");
    if (ratingsContainer) {
        if (Array.isArray(producto.comentarios) && producto.comentarios.length > 0) {
            ratingsContainer.innerHTML = producto.comentarios
                .map(c => `
                    <div class="rating-item">
                        <div class="rating-item__header">
                            <span class="rating-item__estrellas">${generarEstrellas(c.calificacion)}</span>
                            <span class="rating-item__lugar">${c.lugar}</span>
                            <span class="rating-item__fecha">${new Date(c.fecha).toLocaleDateString("en-US")}</span>
                        </div>
                        <p class="rating-item__comentario">${c.comentario}</p>
                    </div>
                `)
                .join("");
        } else {
            ratingsContainer.innerHTML = `<p style="color:var(--ink-soft); font-size:.9rem;">No reviews yet for this product. Be the first to leave one!</p>`;
        }
    }

    // Cálculo del Alquiler (2.5% del precio por día, máximo 30 días)
    const precioBase = (producto.precio_oferta > 0 && producto.precio_oferta !== -1) ? producto.precio_oferta : producto.precio;
    const tarifaDiaria = Math.round(precioBase * 0.025);

    const rentalControls = document.getElementById("rentalControls");
    const rentalDaysInput = document.getElementById("rentalDaysInput");
    const dailyRatePrice = document.getElementById("dailyRatePrice");
    const totalRentalPrice = document.getElementById("totalRentalPrice");
    const btnAddCart = document.getElementById("buyAddToCart");
    const btnBuyMain = document.getElementById("buyButtonMain");
    const modeRadios = document.querySelectorAll('input[name="purchaseMode"]');

    function calcularAlquiler() {
        if (!rentalDaysInput) return { dias: 1, total: tarifaDiaria };
        let dias = parseInt(rentalDaysInput.value, 10);
        if (isNaN(dias) || dias < 1) dias = 1;
        if (dias > 30) dias = 30;
        rentalDaysInput.value = dias;

        const totalAlquiler = tarifaDiaria * dias;
        if (dailyRatePrice) dailyRatePrice.textContent = formatearPrecio(tarifaDiaria);
        if (totalRentalPrice) totalRentalPrice.textContent = formatearPrecio(totalAlquiler);

        return { dias, total: totalAlquiler };
    }

    function obtenerModo() {
        const checked = document.querySelector('input[name="purchaseMode"]:checked');
        return checked ? checked.value : "buy";
    }

    function actualizarInterfazModo() {
        const modo = obtenerModo();
        if (modo === "rent") {
            if (rentalControls) rentalControls.classList.remove("hidden");
            if (btnBuyMain) btnBuyMain.textContent = "Rent Now";
            if (btnAddCart) btnAddCart.textContent = "Add Rental to Cart";
            calcularAlquiler();
        } else {
            if (rentalControls) rentalControls.classList.add("hidden");
            if (btnBuyMain) btnBuyMain.textContent = "Buy Now";
            if (btnAddCart) btnAddCart.textContent = "Add to Cart";
        }
    }

    if (modeRadios) {
        modeRadios.forEach(radio => radio.addEventListener("change", actualizarInterfazModo));
    }

    if (rentalDaysInput) {
        rentalDaysInput.addEventListener("input", calcularAlquiler);
        rentalDaysInput.addEventListener("change", calcularAlquiler);
    }

    actualizarInterfazModo();

    // Botones de compra y carrito
    if (btnAddCart) {
        btnAddCart.onclick = () => {
            const modo = obtenerModo();
            let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

            if (modo === "rent") {
                const { dias, total } = calcularAlquiler();
                carrito.push({
                    id: producto.id,
                    tipo: "alquiler",
                    dias: dias,
                    tarifaDiaria: tarifaDiaria,
                    totalAlquiler: total
                });
                alert(`"${producto.titulo}" (${dias} day rental) was added to your cart.`);
            } else {
                carrito.push(producto.id);
                alert(`"${producto.titulo}" was added to your cart.`);
            }

            localStorage.setItem("carrito", JSON.stringify(carrito));
            if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
        };
    }

    if (btnBuyMain) {
        btnBuyMain.onclick = () => {
            const modo = obtenerModo();
            let carrito = JSON.parse(localStorage.getItem("carrito") || "[]");

            if (modo === "rent") {
                const { dias, total } = calcularAlquiler();
                carrito.push({
                    id: producto.id,
                    tipo: "alquiler",
                    dias: dias,
                    tarifaDiaria: tarifaDiaria,
                    totalAlquiler: total
                });
            } else {
                carrito.push(producto.id);
            }

            localStorage.setItem("carrito", JSON.stringify(carrito));
            if (window.actualizarContadorCarrito) window.actualizarContadorCarrito();
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
    window.location.href = "products.html";
} else {
    fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-cache" })
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
            console.error("Error loading product:", err);
            document.querySelector(".mainshop").innerHTML =
                `<p style="color:var(--danger);padding:2rem">
                    Error loading product details. <a href="products.html">Return to shop</a>
                </p>`;
        });
}