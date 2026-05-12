// ==================== BARRA DE BÚSQUEDA FUNCIONAL ====================

document.addEventListener('DOMContentLoaded', function() {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const dropdownList = document.getElementById('busquedaDropdownList');

  if (!inputBusqueda || !dropdownList) return;

  // Evento de entrada de texto
  inputBusqueda.addEventListener('input', function(e) {
    const texto = e.target.value.trim();
    const sugerencias = texto.length > 0 ? obtenerSugerencias(texto) : [];
    mostrarDropdown(sugerencias, texto);
  });

  // Focus en el input abre opciones de fechas y sugerencias
  inputBusqueda.addEventListener('focus', function() {
    const texto = inputBusqueda.value.trim();
    const sugerencias = texto.length > 0 ? obtenerSugerencias(texto) : [];
    mostrarDropdown(sugerencias, texto);
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (!inputBusqueda.contains(e.target) && !dropdownList.contains(e.target)) {
      cerrarDropdown();
    }
  });

  // Esc y Enter
  inputBusqueda.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      cerrarDropdown();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      realizarBusqueda(inputBusqueda.value.trim());
    }
  });

  // Aplicar fechas desde el dropdown
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnAplicarFechas') {
      realizarBusqueda(inputBusqueda.value.trim());
    }
  });
});

// ==================== OBTENER SUGERENCIAS ====================
function obtenerSugerencias(texto) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const textoNormalizado = texto.toLowerCase();

  const coincidencias = productos.filter(p => {
    const nombre = p.nombre.toLowerCase();
    const descripcion = p.descripcion.toLowerCase();
    return nombre.includes(textoNormalizado) || descripcion.includes(textoNormalizado);
  });

  coincidencias.sort((a, b) => {
    const aEnNombre = a.nombre.toLowerCase().includes(textoNormalizado) ? 0 : 1;
    const bEnNombre = b.nombre.toLowerCase().includes(textoNormalizado) ? 0 : 1;
    return aEnNombre - bEnNombre;
  });

  return coincidencias.slice(0, 8);
}

function obtenerFechasBusqueda() {
  const fechaInicio = document.getElementById('fechaInicio')?.value || '';
  const fechaFin = document.getElementById('fechaFin')?.value || '';
  return { fechaInicio, fechaFin };
}

function cerrarDropdown() {
  const dropdownList = document.getElementById('busquedaDropdownList');
  if (dropdownList) {
    dropdownList.innerHTML = '';
    dropdownList.style.display = 'none';
  }
}

// ==================== MOSTRAR DROPDOWN ====================
function mostrarDropdown(sugerencias, textoBusqueda) {
  const dropdownList = document.getElementById('busquedaDropdownList');
  if (!dropdownList) return;

  const fechas = obtenerFechasBusqueda();
  const hasTexto = textoBusqueda && textoBusqueda.length > 0;

  let sugerenciasHtml = '';
  if (sugerencias.length === 0) {
    sugerenciasHtml = `<div class="busqueda-sin-resultados">${hasTexto ? 'No se encontraron productos' : 'Escribe para buscar productos'}</div>`;
  } else {
    sugerenciasHtml = sugerencias.map(producto => `
      <div class="busqueda-sugerencia" onclick="seleccionarProducto('${producto.id}')">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="busqueda-sugerencia-img">
        <div class="busqueda-sugerencia-info">
          <div class="busqueda-sugerencia-nombre">${producto.nombre}</div>
          <div class="busqueda-sugerencia-precio">$${producto.precio.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>
    `).join('');
  }

  dropdownList.innerHTML = `
    <div class="busqueda-fechas-dropdown">
      <div class="busqueda-fecha-grupo-dropdown">
        <label for="fechaInicio">Desde:</label>
        <input type="date" id="fechaInicio" class="busqueda-fecha-input" value="${fechas.fechaInicio}">
      </div>
      <div class="busqueda-fecha-grupo-dropdown">
        <label for="fechaFin">Hasta:</label>
        <input type="date" id="fechaFin" class="busqueda-fecha-input" value="${fechas.fechaFin}">
      </div>
      <button type="button" class="busqueda-boton-aplicar" id="btnAplicarFechas">Aplicar</button>
    </div>
    <div class="busqueda-sugerencias-contenedor">
      ${sugerenciasHtml}
    </div>
  `;

  dropdownList.style.display = 'block';
}

// ==================== SELECCIONAR PRODUCTO ====================
function seleccionarProducto(productoId) {
  const currentPath = window.location.pathname;
  let rutaProducto = 'producto.html';
  if (!currentPath.includes('/html/')) {
    rutaProducto = 'html/producto.html';
  }
  window.location.href = `${rutaProducto}?id=${productoId}`;
}

// ==================== REALIZAR BÚSQUEDA ====================
function realizarBusqueda(texto) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const textoNormalizado = texto.toLowerCase();
  const { fechaInicio, fechaFin } = obtenerFechasBusqueda();

  const resultados = productos.filter(p => {
    const nombre = p.nombre.toLowerCase();
    const descripcion = p.descripcion.toLowerCase();
    const cumpleTexto = nombre.includes(textoNormalizado) || descripcion.includes(textoNormalizado);

    if (!cumpleTexto) {
      return false;
    }

    if (!fechaInicio && !fechaFin) {
      return true;
    }

    if (!p.fechaCreacion) {
      return false;
    }

    const fechaProducto = new Date(p.fechaCreacion).setHours(0, 0, 0, 0);
    if (fechaInicio) {
      const desde = new Date(fechaInicio).setHours(0, 0, 0, 0);
      if (fechaProducto < desde) return false;
    }
    if (fechaFin) {
      const hasta = new Date(fechaFin).setHours(23, 59, 59, 999);
      if (fechaProducto > hasta) return false;
    }

    return true;
  });

  mostrarResultadosBusqueda(resultados, texto);
}

// ==================== MOSTRAR RESULTADOS EN PÁGINA ====================
function mostrarResultadosBusqueda(productos, texto) {
  const currentPath = window.location.pathname;
  const rutaProducto = currentPath.includes('/html/') ? 'producto.html' : 'html/producto.html';

  let seccionResultados = document.getElementById('seccion-resultados-busqueda');
  if (!seccionResultados) {
    seccionResultados = document.createElement('section');
    seccionResultados.id = 'seccion-resultados-busqueda';
    seccionResultados.className = 'productos-section';
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.insertAdjacentElement('afterend', seccionResultados);
    }
  }

  if (productos.length === 0) {
    seccionResultados.innerHTML = `
      <h2 class="seccion-titulo">Resultados de búsqueda para "${texto}"</h2>
      <div style="text-align: center; padding: 2rem; color: #888;">
        <p>No se encontraron productos que coincidan con tu búsqueda.</p>
      </div>
    `;
  } else {
    let html = `
      <h2 class="seccion-titulo">Resultados de búsqueda (${productos.length})</h2>
      <div class="productos-lista">
    `;

    productos.forEach(producto => {
      let precioMostrado = producto.precio;
      let precioOriginal = '';
      if (producto.descuento > 0) {
        precioMostrado = producto.precioConDescuento || (producto.precio * (1 - producto.descuento / 100));
        precioOriginal = `<p class="precio-anterior">$${producto.precio.toFixed(2).replace('.', ',')}</p>`;
      }
      html += `
        <div class="producto" onclick="window.location.href='${rutaProducto}?id=${producto.id}'">
          <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
          <h3 class="producto-nombre">${producto.nombre}</h3>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${precioOriginal}
            <p class="producto-precio" style="margin: 0;">$${precioMostrado.toFixed(2).replace('.', ',')}</p>
          </div>
        </div>
      `;
    });
    html += '</div>';
    seccionResultados.innerHTML = html;
  }

  seccionResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
