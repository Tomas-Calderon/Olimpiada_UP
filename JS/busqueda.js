// ==================== BARRA DE BÚSQUEDA FUNCIONAL ====================

document.addEventListener('DOMContentLoaded', function() {
  const inputBusqueda = document.getElementById('inputBusqueda');
  const dropdownList = document.getElementById('busquedaDropdownList');
  const dropdownContainer = document.getElementById('busquedaDropdownContainer');

  if (!inputBusqueda) return;

  // Evento de entrada de texto
  inputBusqueda.addEventListener('input', function(e) {
    const texto = e.target.value.trim();

    if (texto.length > 0) {
      const sugerencias = obtenerSugerencias(texto);
      mostrarSugerencias(sugerencias, dropdownList);
      dropdownContainer.style.display = 'block';
    } else {
      dropdownList.innerHTML = '';
      dropdownContainer.style.display = 'none';
    }
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener('click', function(e) {
    if (!inputBusqueda.contains(e.target) && !dropdownContainer.contains(e.target)) {
      dropdownList.innerHTML = '';
      dropdownContainer.style.display = 'none';
    }
  });

  // Cerrar dropdown con Escape
  inputBusqueda.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      dropdownList.innerHTML = '';
      dropdownContainer.style.display = 'none';
    }

    // Enter para buscar
    if (e.key === 'Enter') {
      e.preventDefault();
      realizarBusqueda(inputBusqueda.value);
    }
  });

  // Focus en el input abre opciones si hay texto
  inputBusqueda.addEventListener('focus', function() {
    if (inputBusqueda.value.trim().length > 0) {
      const sugerencias = obtenerSugerencias(inputBusqueda.value.trim());
      mostrarSugerencias(sugerencias, dropdownList);
      dropdownContainer.style.display = 'block';
    } else {
      // Si no hay texto, mostrar solo calendarios
      dropdownContainer.style.display = 'block';
      dropdownList.innerHTML = '';
    }
  });
});

// ==================== OBTENER SUGERENCIAS ====================
function obtenerSugerencias(texto) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const textoNormalizado = texto.toLowerCase();

  // Filtrar productos que coincidan
  const coincidencias = productos.filter(p => {
    const nombre = p.nombre.toLowerCase();
    const descripcion = p.descripcion.toLowerCase();
    return nombre.includes(textoNormalizado) || descripcion.includes(textoNormalizado);
  });

  // Ordenar por relevancia (coincidencias en nombre primero)
  coincidencias.sort((a, b) => {
    const aEnNombre = a.nombre.toLowerCase().includes(textoNormalizado) ? 0 : 1;
    const bEnNombre = b.nombre.toLowerCase().includes(textoNormalizado) ? 0 : 1;
    return aEnNombre - bEnNombre;
  });

  // Retornar máximo 8 sugerencias
  return coincidencias.slice(0, 8);
}

// ==================== MOSTRAR SUGERENCIAS ====================
function mostrarSugerencias(sugerencias, dropdownList) {
  if (sugerencias.length === 0) {
    dropdownList.innerHTML = '<div class="busqueda-sin-resultados">No se encontraron productos</div>';
  } else {
    dropdownList.innerHTML = sugerencias.map(producto => `
      <div class="busqueda-sugerencia" onclick="seleccionarProducto('${producto.id}')">
        <img src="${producto.imagen}" alt="${producto.nombre}" class="busqueda-sugerencia-img">
        <div class="busqueda-sugerencia-info">
          <div class="busqueda-sugerencia-nombre">${producto.nombre}</div>
          <div class="busqueda-sugerencia-precio">$${producto.precio.toFixed(2).replace('.', ',')}</div>
        </div>
      </div>
    `).join('');
  }

  dropdownList.style.display = 'block';
}

// ==================== SELECCIONAR PRODUCTO ====================
function seleccionarProducto(productoId) {
  window.location.href = `html/producto.html?id=${productoId}`;
}

// ==================== REALIZAR BÚSQUEDA ====================
function realizarBusqueda(texto) {
  const productos = JSON.parse(localStorage.getItem('productos')) || [];
  const textoNormalizado = texto.toLowerCase();

  // Filtrar productos
  const resultados = productos.filter(p => {
    const nombre = p.nombre.toLowerCase();
    const descripcion = p.descripcion.toLowerCase();
    return nombre.includes(textoNormalizado) || descripcion.includes(textoNormalizado);
  });

  // Mostrar sección de búsqueda en la página principal
  mostrarResultadosBusqueda(resultados, texto);
}

// ==================== MOSTRAR RESULTADOS EN PÁGINA ====================
function mostrarResultadosBusqueda(productos, texto) {
  // Obtener o crear sección de resultados
  let seccionResultados = document.getElementById('seccion-resultados-busqueda');

  if (!seccionResultados) {
    seccionResultados = document.createElement('section');
    seccionResultados.id = 'seccion-resultados-busqueda';
    seccionResultados.className = 'productos-section';

    // Insertar después del hero
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
        <div class="producto" onclick="window.location.href='html/producto.html?id=${producto.id}'">
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

  // Scroll a la sección
  seccionResultados.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
