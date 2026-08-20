const track = document.querySelector('.carousel-track');
const slides = track ? Array.from(track.children) : [];
const prevButton = document.querySelector('.carousel-button.prev');
const nextButton = document.querySelector('.carousel-button.next');

let currentIndex = 0;

function updateCarousel() {
  if (!slides.length) return;
  const slideWidth = slides[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

if (nextButton) {
  nextButton.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateCarousel();
  });
}

if (prevButton) {
  prevButton.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateCarousel();
  });
}

function send() {
  let content = document.getElementById("email");
  if (content) content.value = '';
  alert("Email sent");
}

/* ── Carga Dinámica de los 4 Anuncios de la Tienda ───────── */

const API_URL = "https://liamsacrosas.github.io/dacamdata/productos_dacam.json";

function formatearPrecio(num) {
    return num.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0,
    });
}

function cargarAnuncios() {
    fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-cache" })
        .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
        })
        .then(datos => {
            const productos = datos.productos;
            if (!productos || !productos.length) return;

            // 1. Cámara más barata
            const masBarata = [...productos].sort((a, b) => {
                const pA = (a.precio_oferta > 0 && a.precio_oferta !== -1) ? a.precio_oferta : a.precio;
                const pB = (b.precio_oferta > 0 && b.precio_oferta !== -1) ? b.precio_oferta : b.precio;
                return pA - pB;
            })[0];

            // 2. Mejor valuada (si calificacion es -1, se toma el flagship de mayor calidad)
            const mejorValuada = [...productos].sort((a, b) => {
                if (b.calificacion !== a.calificacion) return b.calificacion - a.calificacion;
                return b.precio - a.precio;
            })[0];

            // 3. Más vendida (producto flagship / mas destacado)
            const masVendida = [...productos].sort((a, b) => b.precio - a.precio)[0];

            // 4. Combo recomendación
            const combo = productos.find(p => p.id === 1) || productos[0];

            // Actualizar 1: Cámara más barata
            if (masBarata) {
                const p = (masBarata.precio_oferta > 0 && masBarata.precio_oferta !== -1) ? masBarata.precio_oferta : masBarata.precio;
                const desc = document.getElementById("desc-barata");
                const link = document.getElementById("link-barata");
                if (desc) desc.textContent = `${masBarata.titulo} — ${formatearPrecio(p)}`;
                if (link) link.href = `compra.html?id=${masBarata.id}`;
            }

            // Actualizar 2: Mejor valuada
            if (mejorValuada) {
                const desc = document.getElementById("desc-valuada");
                const link = document.getElementById("link-valuada");
                const rating = mejorValuada.calificacion === -1 ? "5.0 ★" : `★ ${mejorValuada.calificacion}`;
                if (desc) desc.textContent = `${mejorValuada.titulo} — ${rating}`;
                if (link) link.href = `compra.html?id=${mejorValuada.id}`;
            }

            // Actualizar 3: Más vendida
            if (masVendida) {
                const desc = document.getElementById("desc-vendida");
                const link = document.getElementById("link-vendida");
                if (desc) desc.textContent = `${masVendida.titulo} — Best Seller Flagship`;
                if (link) link.href = `compra.html?id=${masVendida.id}`;
            }

            // Actualizar 4: Combo recomendación
            if (combo) {
                const desc = document.getElementById("desc-combo");
                const link = document.getElementById("link-combo");
                if (desc) desc.textContent = `${combo.titulo} — Pro Kit Edition`;
                if (link) link.href = `compra.html?id=${combo.id}`;
            }
        })
        .catch(err => console.error("Error loading announcements:", err));
}

// Inicializar
if (slides.length) updateCarousel();
cargarAnuncios();