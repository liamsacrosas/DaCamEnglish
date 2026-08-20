/* search.js — Despliega la barra de búsqueda inline y ejecuta búsqueda lineal sobre productos */

const SEARCH_API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";
let productosCache = null;

/* ── Algoritmo de Búsqueda Lineal (O(n)) ─────────────────── */

/**
 * Recorre linealmente el arreglo de productos para encontrar
 * coincidencias en título o resumen de características.
 * @param {Array} lista - Lista completa de productos
 * @param {string} termino - Término ingresado por el usuario
 * @returns {Array} Productos coincidentes
 */
function busquedaLineal(lista, termino) {
    const query = termino.toLowerCase().trim();
    if (!query) return [];

    const resultados = [];
    // Algoritmo de recorrido lineal O(n)
    for (let i = 0; i < lista.length; i++) {
        const prod = lista[i];
        const tituloCoincide = prod.titulo.toLowerCase().indexOf(query) !== -1;
        const specsCoinciden = Array.isArray(prod.resumen_caracteristicas)
            ? prod.resumen_caracteristicas.some(s => s.toLowerCase().indexOf(query) !== -1)
            : false;

        if (tituloCoincide || specsCoinciden) {
            resultados.push(prod);
        }
    }
    return resultados;
}

/* ── Carga de Productos ───────────────────────────────────── */

async function obtenerProductos() {
    if (productosCache) return productosCache;
    try {
        const res = await fetch(`${SEARCH_API_URL}?t=${Date.now()}`, { cache: "no-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        productosCache = data.productos || [];
        return productosCache;
    } catch (err) {
        console.error("Error al cargar productos para la búsqueda:", err);
        return [];
    }
}

/* ── Formatear precio ─────────────────────────────────────── */

function formatearPrecioSearch(num) {
    return num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });
}

/* ── Render del Dropdown ──────────────────────────────────── */

function renderizarResultadosBusqueda(resultados, contenedor) {
    if (!contenedor) return;

    if (resultados.length === 0) {
        contenedor.innerHTML = `<div class="search-dropdown-empty">No products found matching your search.</div>`;
        return;
    }

    contenedor.innerHTML = resultados
        .map(prod => {
            const precio = (prod.precio_oferta > 0 && prod.precio_oferta !== -1) ? prod.precio_oferta : prod.precio;
            const imgSrc = (Array.isArray(prod.imagenes) && prod.imagenes.length > 0)
                ? prod.imagenes[0]
                : `https://picsum.photos/seed/dacam${prod.id}/120/120`;

            return `
                <a href="compra.html?id=${prod.id}" class="search-dropdown-item">
                    <img src="${imgSrc}" alt="${prod.titulo}" loading="lazy">
                    <div class="search-dropdown-info">
                        <span class="search-dropdown-title">${prod.titulo}</span>
                        <span class="search-dropdown-price">${formatearPrecioSearch(precio)}</span>
                    </div>
                </a>
            `;
        })
        .join("");
}

/* ── Inicialización del Buscador Inline ──────────────────── */

function inicializarBuscador() {
    const searchBtn = document.getElementById("search");
    if (!searchBtn) return;

    // Crear el contenedor inline wrapping el botón #search
    let searchBox = document.getElementById("searchBoxInline");

    if (!searchBox) {
        searchBox = document.createElement("div");
        searchBox.id = "searchBoxInline";
        searchBox.className = "search-box-inline";

        const parent = searchBtn.parentNode;
        parent.insertBefore(searchBox, searchBtn);

        // Input expandible
        const input = document.createElement("input");
        input.type = "text";
        input.id = "headerSearchInput";
        input.className = "search-input-inline";
        input.placeholder = "Search cameras...";
        input.setAttribute("aria-label", "Search cameras");
        input.autocomplete = "off";

        searchBox.appendChild(input);
        searchBox.appendChild(searchBtn);

        // Contenedor Dropdown
        const dropdown = document.createElement("div");
        dropdown.id = "searchDropdownResults";
        dropdown.className = "search-dropdown hidden";
        searchBox.appendChild(dropdown);
    }

    const input = document.getElementById("headerSearchInput");
    const dropdown = document.getElementById("searchDropdownResults");

    // Toggle al hacer click en el botón de búsqueda
    searchBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isActive = searchBox.classList.contains("active");

        if (!isActive) {
            searchBox.classList.add("active");
            input.focus();
            await obtenerProductos();
        } else {
            if (input.value.trim()) {
                const lista = await obtenerProductos();
                const resultados = busquedaLineal(lista, input.value);
                if (resultados.length > 0) {
                    window.location.href = `compra.html?id=${resultados[0].id}`;
                }
            } else {
                searchBox.classList.remove("active");
                dropdown.classList.add("hidden");
            }
        }
    });

    // Escuchar el evento de tipeo y ejecutar la Búsqueda Lineal
    if (input) {
        input.addEventListener("click", (e) => e.stopPropagation());

        input.addEventListener("input", async (e) => {
            const termino = e.target.value;
            if (!termino.trim()) {
                dropdown.classList.add("hidden");
                dropdown.innerHTML = "";
                return;
            }

            const lista = await obtenerProductos();
            // Ejecutar Búsqueda Lineal O(n)
            const resultados = busquedaLineal(lista, termino);
            dropdown.classList.remove("hidden");
            renderizarResultadosBusqueda(resultados, dropdown);
        });

        input.addEventListener("keydown", async (e) => {
            if (e.key === "Enter") {
                const termino = input.value.trim();
                if (!termino) return;

                const lista = await obtenerProductos();
                const resultados = busquedaLineal(lista, termino);

                if (resultados.length > 0) {
                    window.location.href = `compra.html?id=${resultados[0].id}`;
                }
            }
            if (e.key === "Escape") {
                searchBox.classList.remove("active");
                dropdown.classList.add("hidden");
            }
        });
    }

    // Cerrar al hacer clic fuera
    document.addEventListener("click", (e) => {
        if (!searchBox.contains(e.target)) {
            searchBox.classList.remove("active");
            dropdown.classList.add("hidden");
        }
    });
}

/* ── Contador global de items del Carrito ────────────────── */

function actualizarContadorCarrito() {
    const cartBtn = document.getElementById("cart");
    if (!cartBtn) return;

    let badge = document.getElementById("cartCount");
    if (!badge) {
        badge = document.createElement("span");
        badge.id = "cartCount";
        badge.className = "cart-count hidden";
        cartBtn.appendChild(badge);
    }

    const cartIDs = JSON.parse(localStorage.getItem("carrito") || "[]");
    const total = Array.isArray(cartIDs) ? cartIDs.length : 0;

    if (total > 0) {
        badge.textContent = total;
        badge.classList.remove("hidden");
    } else {
        badge.classList.add("hidden");
    }
}

window.actualizarContadorCarrito = actualizarContadorCarrito;
window.addEventListener("storage", actualizarContadorCarrito);

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
    inicializarBuscador();
    actualizarContadorCarrito();
});
