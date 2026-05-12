// ==================== GESTIÓN DE PRODUCTOS EN INDEX ====================

// Variables globales para paginación
let paginas = {
    recomendados: 1,
    ofertas: 1,
    novedades: 1
};

const PRODUCTOS_POR_PAGINA = 4;

let productosPorCategoria = {
    recomendados: [],
    ofertas: [],
    novedades: []
};

// ==================== OBTENER RUTA CORRECTA A PRODUCTO.HTML ====================

function obtenerRutaProducto() {
    const currentPath = window.location.pathname;
    return currentPath.includes('/html/') ? 'producto.html' : 'html/producto.html';
}

// ==================== CARGAR Y CATEGORIZAR PRODUCTOS ====================

function cargarYCategorizarProductos() {
    // Cargar productos del localStorage
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    // Limpiar categorías
    productosPorCategoria.recomendados = [];
    productosPorCategoria.ofertas = [];
    productosPorCategoria.novedades = [];
    
    // Categorizar productos
    productos.forEach(producto => {
        // Ofertas: productos con descuento > 0
        if (producto.descuento && producto.descuento > 0) {
            productosPorCategoria.ofertas.push(producto);
        } else {
            // Recomendados: productos sin descuento
            productosPorCategoria.recomendados.push(producto);
        }
        
        // Novedades: productos con tipo 'Novedad'
        if (producto.tipo === 'Novedad') {
            productosPorCategoria.novedades.push(producto);
        }
    });
    
    // Ordenar novedades por fecha (más recientes primero)
    productosPorCategoria.novedades.sort((a, b) => {
        const fechaA = new Date(a.fechaCreacion || 0);
        const fechaB = new Date(b.fechaCreacion || 0);
        return fechaB - fechaA;
    });
    
    // Resetear páginas
    paginas.recomendados = 1;
    paginas.ofertas = 1;
    paginas.novedades = 1;
    
    // Renderizar todas las categorías
    renderizarCategoria('recomendados');
    renderizarCategoria('ofertas');
    renderizarCategoria('novedades');
}

// ==================== RENDERIZAR CATEGORÍA ====================

function renderizarCategoria(categoria) {
    const productos = productosPorCategoria[categoria];
    const contenedor = document.getElementById(`productos-${categoria}`);
    const paginacion = document.getElementById(`paginacion-${categoria}`);
    
    if (!contenedor) return;
    
    // Calcular página actual
    const pagina = paginas[categoria];
    const inicio = (pagina - 1) * PRODUCTOS_POR_PAGINA;
    const fin = inicio + PRODUCTOS_POR_PAGINA;
    const productosPagina = productos.slice(inicio, fin);
    
    // Renderizar productos
    contenedor.innerHTML = '';
    
    if (productosPagina.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; color: #999; grid-column: 1/-1;">No hay productos en esta categoría</p>';
    } else {
        productosPagina.forEach(producto => {
            const div = document.createElement('div');
            div.className = 'producto';
            div.style.position = 'relative';
            const rutaProducto = obtenerRutaProducto();
            div.onclick = (e) => {
                if (e.target.classList.contains('btn-favorito')) return;
                window.location.href = `${rutaProducto}?id=${producto.id}`;
            };
            
            // Calcular precio con descuento
            let precioMostrado = producto.precio;
            let precioOriginal = '';
            
            if (producto.descuento && producto.descuento > 0) {
                precioMostrado = producto.precio * (1 - producto.descuento / 100);
                precioOriginal = `<p class="precio-anterior">$${producto.precio.toFixed(2).replace('.', ',')}</p>`;
            }

            const sesionActual = JSON.parse(localStorage.getItem('usuario_autenticado') || '{}');
            const esAdmin = sesionActual.role === 'admin';
            const estaAutenticado = !!(sesionActual.id || sesionActual.email);
            const botonFavorito = estaAutenticado ? crearBotonFavorito(producto.id, esAdmin) : '';
            
            div.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
                ${botonFavorito}
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${precioOriginal}
                    <p class="producto-precio" style="margin: 0;">$${precioMostrado.toFixed(2).replace('.', ',')}</p>
                </div>
            `;
            
            contenedor.appendChild(div);
        });
    }
    
    // Actualizar paginación
    actualizarPaginacion(categoria, productos.length);
}

// ==================== ACTUALIZAR PAGINACIÓN ====================

function actualizarPaginacion(categoria, totalProductos) {
    const totalPaginas = Math.ceil(totalProductos / PRODUCTOS_POR_PAGINA);
    const paginaActual = paginas[categoria];
    
    // Obtener elementos
    const btnInicio = document.getElementById(`btn-inicio-${categoria}`);
    const btnAnterior = document.getElementById(`btn-anterior-${categoria}`);
    const btnSiguiente = document.getElementById(`btn-siguiente-${categoria}`);
    const paginaInfo = document.getElementById(`pagina-info-${categoria}`);
    
    if (!btnInicio) return;
    
    // Actualizar texto de información
    if (paginaInfo) {
        paginaInfo.textContent = `Página ${paginaActual} de ${totalPaginas}`;
    }
    
    // Habilitar/deshabilitar botones
    if (btnInicio) btnInicio.disabled = paginaActual === 1;
    if (btnAnterior) btnAnterior.disabled = paginaActual === 1;
    if (btnSiguiente) btnSiguiente.disabled = paginaActual === totalPaginas || totalPaginas === 0;
    
    // Agregar eventos si no están agregados
    if (!btnInicio.dataset.eventoAgregado) {
        btnInicio.addEventListener('click', () => {
            paginas[categoria] = 1;
            renderizarCategoria(categoria);
        });
        btnAnterior.addEventListener('click', () => {
            if (paginas[categoria] > 1) {
                paginas[categoria]--;
                renderizarCategoria(categoria);
            }
        });
        btnSiguiente.addEventListener('click', () => {
            if (paginas[categoria] < totalPaginas) {
                paginas[categoria]++;
                renderizarCategoria(categoria);
            }
        });
        btnInicio.dataset.eventoAgregado = true;
    }
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    if (typeof gestorFavoritos !== 'undefined' && gestorFavoritos) {
        gestorFavoritos.inicializar();
    }
    cargarYCategorizarProductos();
    if (typeof inicializarBotonesFavorito === 'function') {
        inicializarBotonesFavorito();
    }
    
    // Observar cambios en localStorage para recargar cuando se agreguen productos
    window.addEventListener('storage', function(e) {
        if (e.key === 'productos') {
            cargarYCategorizarProductos();
        }
    });
});

// Recargar productos cuando se enfoca la ventana (por si se agregaron productos en otra pestaña)
window.addEventListener('focus', function() {
    cargarYCategorizarProductos();
});
