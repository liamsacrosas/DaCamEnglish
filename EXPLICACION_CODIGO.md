# 📸 Documentación Completa del Código — DaCam English

Este documento explica de forma detallada la arquitectura, estructura de archivos, algoritmos clave, flujo de datos y manejo de estado local de la tienda de tecnología **DaCam English**.

---

## 📑 Tabla de Contenidos
1. [Arquitectura General](#1-arquitectura-general)
2. [Estructura del Proyecto y Archivos](#2-estructura-del-proyecto-y-archivos)
3. [Flujo de Datos y API JSON](#3-flujo-de-datos-y-api-json)
4. [Manejo de Estado en LocalStorage](#4-manejo-de-estado-en-localstorage)
5. [Explicación de Módulos y Funcionalidades Clave](#5-explicación-de-módulos-y-funcionalidades-clave)
   - [Buscador con Algoritmo de Búsqueda Lineal (`search.js`)](#a-buscador-con-algoritmo-de-búsqueda-lineal-searchjs)
   - [Contador Global de Carrito (`actualizarContadorCarrito`)](#b-contador-global-de-carrito-actualizarcontadorcarrito)
   - [Tienda y Paginación (`products.js`)](#c-tienda-y-paginación-productsjs)
   - [Página de Producto y Galería (`compra.js`)](#d-página-de-producto-y-galería-comprajs)
   - [Carrito de Compras y Cantidades (`carrito.js`)](#e-carrito-de-compras-y-cantidades-carritojs)
   - [Flujo de Autenticación y Tarjetas (`logins/`)](#f-flujo-de-autenticación-y-tarjetas-logins)
6. [Manejo de Errores y Casos Borde](#6-manejo-de-errores-y-casos-borde)

---

## 1. Arquitectura General

El proyecto está diseñado como una **Web App de Arquitectura Modular Front-end** construida con tecnologías nativas (Vanilla Standard):
- **HTML5 Semántico**: Estructura limpia y accesible.
- **CSS3 Vanilla**: Sistema de diseño basado en variables CSS (`custom properties`), CSS Grid y Flexbox.
- **JavaScript ES6+**: Scripts cliente asíncronos (`fetch`, `async/await`), eventos delegados y persistencia en navegador.

```
┌────────────────────────────────────────────────────────┐
│                   Cliente Browser                      │
├───────────────┬────────────────────────┬───────────────┤
│  HTML Pages   │   Componentes JS       │  CSS System   │
│ (index, etc)  │ (search, carrito, etc) │ (style.css)   │
└───────┬───────┴───────────┬────────────┴───────┬───────┘
        │                   │                    │
        ▼                   ▼                    ▼
┌───────────────┐   ┌────────────────┐   ┌───────────────┐
│ LocalStorage  │   │  API Endpoint  │   │ Picsum Seeds  │
│(Carrito/User) │   │ (GitHub Pages) │   │  (Imágenes)   │
└───────────────┘   └────────────────┘   └───────────────┘
```

---

## 2. Estructura del Proyecto y Archivos

```
DaCamEnglish/
├── index.html              # Página de inicio con Carrusel de anuncios y ofertas
├── products.html           # Catálogo general con ordenamiento y paginación
├── compra.html             # Vista detallada de producto, miniaturas y carrusel de recomendación
├── carrito.html            # Gestor de carrito, subtotales, cantidades y pago
├── EXPLICACION_CODIGO.md   # Documentación del sistema
├── styles/
│   └── style.css           # Hoja de estilos global y componentes compartidos
├── scripts/
│   ├── script.js           # Lógica del carrusel index y carga dinámica de anuncios
│   ├── products.js         # Carga, renderizado y paginación de la lista de productos
│   ├── compra.js           # Lógica de miniatura, especificaciones avanzadas y botón de compra
│   ├── carrito.js          # Control de carrito, suma de subtotales y cantidades (- / +)
│   └── search.js           # Buscador expandible, Búsqueda Lineal y contador global del carrito
└── logins/
    ├── email.html          # Paso 1: Ingreso de correo y clave
    ├── verifCode.html      # Paso 2: Verificación de código de 6 dígitos
    ├── CreditCard.html     # Paso 3: Validación de tarjeta de crédito (Titular, Número, Exp, CVV)
    ├── style.css           # Estilos responsivos del flujo de login
    ├── login.js            # Validación y almacenamiento de credenciales
    ├── verif.js            # Lógica de código de verificación
    └── CreditCard.js       # Validación BIN (Visa/Mastercard) y formulario completo
```

---

## 3. Flujo de Datos y API JSON

El proyecto consume el catálogo de productos alojado en GitHub Pages:
**URL**: `https://liamsacrosas.github.io/dacamdata/productos_dacam.json`

### Prevención de Caché (Cache Busting)
Para garantizar que cualquier actualización en el archivo JSON se refleje de inmediato en el navegador del cliente sin depender de la caché del servidor CDN, cada petición incluye un parámetro de timestamp dinámico y la directiva `no-cache`:

```javascript
fetch(`${API_URL}?t=${Date.now()}`, { cache: "no-cache" })
    .then(res => res.json())
    .then(data => { ... });
```

---

## 4. Manejo de Estado en LocalStorage

La aplicación no utiliza un backend para mantener la sesión ni la cesta de compra. En su lugar, utiliza el objeto nativo `localStorage`:

| Clave LocalStorage | Tipo | Descripción |
| :--- | :--- | :--- |
| `"carrito"` | `Array<number>` | Arreglo de IDs de productos seleccionados (ej: `[1, 1, 3]`). Permite elementos repetidos. |
| `"usuario"` | `Object` | Objeto JSON con el perfil del usuario activo, tarjeta registrada y estado de sesión. |
| `"tarjeta"` | `string` | Número de tarjeta guardada de 16 dígitos (ej: `"4509123456789012"`). |
| `"tipoTarjeta"`| `string` | Marca identificada (`"Visa"` o `"Mastercard"`). |
| `"tarjetaTitular"`| `string` | Nombre del titular de la tarjeta. |
| `"tarjetaExp"`| `string` | Fecha de expiración en formato `"MM/YY"`. |
| `"isLoggedIn"`| `"true" \| "false"` | Indicador de sesión iniciada. |

---

## 5. Explicación de Módulos y Funcionalidades Clave

### A. Buscador con Algoritmo de Búsqueda Lineal (`scripts/search.js`)

Al presionar el botón `#search` en la cabecera, se despliega una barra expandible inline en el header.

#### Algoritmo de Búsqueda Lineal ($O(n)$)
Recorre el arreglo completo de productos elemento por elemento comparando la búsqueda contra el **título** y contra el **arreglo de características resumidas**:

```javascript
function busquedaLineal(lista, termino) {
    const query = termino.toLowerCase().trim();
    if (!query) return [];

    const resultados = [];
    // Recorrido lineal secuencial
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
```

---

### B. Contador Global de Carrito (`actualizarContadorCarrito`)

Ubicado en `scripts/search.js` (incluido en todas las páginas), crea un badge `.cart-count` posicionado sobre el ícono del carrito `#cart`:

```javascript
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
```

---

### C. Tienda y Paginación (`scripts/products.js`)

1. **Ordenamiento de Productos**:
   - `ordenarProductos(lista, criterio)` permite ordenar por precio mayor/menor o por calificación.
2. **Paginación Dinámica**:
   - Muestra **12 productos por página** (`PRODUCTOS_POR_PAGINA = 12`).
   - Calcula el total de páginas `Math.ceil(total / 12)` y genera botones navegables.

---

### D. Página de Producto y Galería (`scripts/compra.js`)

1. **Parámetro URL**:
   - Lee `window.location.search` para obtener el ID: `new URLSearchParams(location.search).get("id")`.
2. **Galería de Miniaturas**:
   - Genera 5 miniaturas. Al hacer click en una miniatura, desvanece la imagen central (`opacity: 0`), cambia la fuente (`src`) y vuelve a mostrarla (`opacity: 1`).
3. **Ficha Técnica Avanzada**:
   - Renderiza automáticamente los detalles del objeto `caracteristicas` (Sensor, Resolución, ISO, Ráfaga, Peso, Montura).
4. **Carrusel "Other users bought"**:
   - Reutiliza la clase `.producto` para mostrar recomendaciones alternativas con desplazamiento horizontal mediante `scrollBy()`.

---

### E. Carrito de Compras y Cantidades (`scripts/carrito.js`)

Permite almacenar múltiples unidades de la misma cámara:

1. **Agrupamiento de Unidades**:
   ```javascript
   const conteo = {};
   cartIDs.forEach(id => {
       conteo[id] = (conteo[id] || 0) + 1;
   });
   ```
2. **Controles de Cantidad (`modificarCantidad`)**:
   - Botón `[-]`: Elimina 1 unidad mediante `carrito.splice(index, 1)`.
   - Botón `[+]`: Añade 1 unidad mediante `carrito.push(id)`.
   - Botón `Remove All`: Elimina todas las instancias mediante `filter()`.

---

### F. Flujo de Autenticación y Tarjetas (`logins/`)

En `logins/CreditCard.js`, el formulario de pago requiere **4 validaciones en tiempo real** antes de habilitar el botón de envío (`#enviar.disabled = false`):

1. **Titular (`tarjetaTitular`)**: Longitud `>= 3`.
2. **Número de Tarjeta (`TarjetaCod`)**: Exactly 16 dígitos.
   - Detecta **Visa** si inicia con `4`.
   - Detecta **Mastercard** si los primeros 4 dígitos están en rango `5100-5599` o `2221-2720`.
3. **Fecha de Expiración (`tarjetaExp`)**: Formato `MM/YY`. Valida que el mes esté entre `01` y `12` y que la fecha sea mayor o igual al mes y año actual.
4. **CVV (`tarjetaCVV`)**: Exactly 3 dígitos numéricos.

---

## 6. Manejo de Errores y Casos Borde

### A. Calificaciones Negativas (`calificacion: -1`)
Para evitar excepciones `RangeError: Invalid count value: -1` al intentar repetir caracteres en las estrellas (`"★".repeat(...)`), todas las funciones de formateo incluyen una guarda de seguridad:

```javascript
function generarEstrellas(calificacion) {
    if (typeof calificacion !== "number" || calificacion <= 0) return "★★★★★";
    const llenas = Math.floor(calificacion);
    const media = calificacion % 1 >= 0.5 ? 1 : 0;
    const vacias = Math.max(0, 5 - llenas - media);
    const countLlenas = Math.max(0, llenas);
    return "★".repeat(countLlenas) + (media ? "½" : "") + "☆".repeat(vacias);
}
```

### B. Ofertas Nulas (`precio_oferta: -1`)
Si `precio_oferta === -1`, el sistema omite el tachado del precio anterior y renderiza únicamente el precio base del producto.

---

*Documentación generada para DaCam English — 2026© Todos los derechos reservados.*
