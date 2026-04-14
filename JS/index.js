// Toggle del menú en dispositivos móviles
const menuToggle = document.getElementById('menuToggle');
const headerNav = document.getElementById('headerNav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
});

// Cerrar menú al hacer clic en un botón
const buttons = document.querySelectorAll('.header-der button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('active');
    });
});

// Cerrar menú al hacer resize si vuelve a resolución desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('active');
    }
});

// ==================== FUNCIONALIDAD DE PRODUCTOS ====================
// Agregar event listeners a los productos
const productosPorPagina = 5;
let paginaRecomendados = 1;
let paginaOfertas = 1;
let paginaNovedades = 1;
let productosRecomendadosAleatorios = []; // Almacenar los 10 productos aleatorios
let productosOfertasAleatorios = []; // Almacenar los 10 productos de ofertas aleatorios
let productosNovedadesAleatorios = []; // Almacenar los 10 productos de novedades aleatorios

// Función para obtener 10 productos aleatorios sin repetir
function obtenerProductosAleatorios(productos, cantidad = 10) {
    // Si hay menos productos que la cantidad solicitada, devolver todos
    if (productos.length <= cantidad) {
        return productos.sort(() => Math.random() - 0.5);
    }
    
    // Crear una copia del array
    const productosDisponibles = [...productos];
    const productosSeleccionados = [];
    
    // Seleccionar 'cantidad' productos aleatorios sin repetir
    for (let i = 0; i < cantidad; i++) {
        const indiceAleatorio = Math.floor(Math.random() * productosDisponibles.length);
        productosSeleccionados.push(productosDisponibles[indiceAleatorio]);
        // Remover el producto seleccionado para no repetir
        productosDisponibles.splice(indiceAleatorio, 1);
    }
    
    return productosSeleccionados;
}

function renderProductos(seccion, pagina) {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    let productosFiltrados = [];
    
    if (seccion === 'recomendados') {
        // Si no tenemos los productos aleatorios cargados, generarlos
        if (productosRecomendadosAleatorios.length === 0) {
            productosRecomendadosAleatorios = obtenerProductosAleatorios(productos, 10);
        }
        productosFiltrados = productosRecomendadosAleatorios;
    } else if (seccion === 'ofertas') {
        const productosConOferta = productos.filter(p => p.precioAnterior);
        // Si no tenemos los productos aleatorios cargados, generarlos
        if (productosOfertasAleatorios.length === 0) {
            productosOfertasAleatorios = obtenerProductosAleatorios(productosConOferta, 10);
        }
        productosFiltrados = productosOfertasAleatorios;
    } else if (seccion === 'novedades') {
        const productosNuevos = productos.filter(p => p.tipo === 'Novedad');
        // Si no tenemos los productos aleatorios cargados, generarlos
        if (productosNovedadesAleatorios.length === 0) {
            productosNovedadesAleatorios = obtenerProductosAleatorios(productosNuevos, 10);
        }
        productosFiltrados = productosNovedadesAleatorios;
    }
    
    const totalProductos = productosFiltrados.length;
    const totalPaginas = Math.ceil(totalProductos / productosPorPagina);
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosPagina = productosFiltrados.slice(inicio, fin);
    const lista = document.getElementById(`productos-${seccion}`);
    lista.innerHTML = '';
    productosPagina.forEach(producto => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.style.cursor = 'pointer';
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">$${producto.precio.toFixed(2).replace('.', ',')}</p>
            ${producto.precioAnterior ? `<p class="precio-anterior">$${producto.precioAnterior.toFixed(2).replace('.', ',')}</p>` : ''}
        `;
        productoDiv.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });
        lista.appendChild(productoDiv);
    });
    // Actualizar paginación
    const info = document.getElementById(`pagina-info-${seccion}`);
    info.textContent = `Página ${pagina} de ${totalPaginas || 1}`;
    const btnInicio = document.getElementById(`btn-inicio-${seccion}`);
    const btnAnterior = document.getElementById(`btn-anterior-${seccion}`);
    const btnSiguiente = document.getElementById(`btn-siguiente-${seccion}`);
    btnInicio.disabled = pagina === 1;
    btnAnterior.disabled = pagina === 1;
    btnSiguiente.disabled = pagina === totalPaginas || totalPaginas === 0;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

function cargarProductos() {
    // Salir si no hay secciones de productos (como en agregar-producto.html)
    if (!document.getElementById('productos-recomendados')) {
        return;
    }
    renderProductos('recomendados', paginaRecomendados);
    renderProductos('ofertas', paginaOfertas);
    renderProductos('novedades', paginaNovedades);
    // Agregar event listeners para paginación
    // Recomendados
    document.getElementById('btn-inicio-recomendados').addEventListener('click', () => {
        paginaRecomendados = 1;
        renderProductos('recomendados', paginaRecomendados);
    });
    document.getElementById('btn-anterior-recomendados').addEventListener('click', () => {
        if (paginaRecomendados > 1) {
            paginaRecomendados--;
            renderProductos('recomendados', paginaRecomendados);
        }
    });
    document.getElementById('btn-siguiente-recomendados').addEventListener('click', () => {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const totalPaginas = Math.ceil(productos.length / productosPorPagina);
        if (paginaRecomendados < totalPaginas) {
            paginaRecomendados++;
            renderProductos('recomendados', paginaRecomendados);
        }
    });
    // Ofertas
    document.getElementById('btn-inicio-ofertas').addEventListener('click', () => {
        paginaOfertas = 1;
        renderProductos('ofertas', paginaOfertas);
    });
    document.getElementById('btn-anterior-ofertas').addEventListener('click', () => {
        if (paginaOfertas > 1) {
            paginaOfertas--;
            renderProductos('ofertas', paginaOfertas);
        }
    });
    document.getElementById('btn-siguiente-ofertas').addEventListener('click', () => {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productosFiltrados = productos.filter(p => p.precioAnterior);
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaOfertas < totalPaginas) {
            paginaOfertas++;
            renderProductos('ofertas', paginaOfertas);
        }
    });
    // Novedades
    document.getElementById('btn-inicio-novedades').addEventListener('click', () => {
        paginaNovedades = 1;
        renderProductos('novedades', paginaNovedades);
    });
    document.getElementById('btn-anterior-novedades').addEventListener('click', () => {
        if (paginaNovedades > 1) {
            paginaNovedades--;
            renderProductos('novedades', paginaNovedades);
        }
    });
    document.getElementById('btn-siguiente-novedades').addEventListener('click', () => {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productosFiltrados = productos.filter(p => p.tipo === 'Novedad');
        const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
        if (paginaNovedades < totalPaginas) {
            paginaNovedades++;
            renderProductos('novedades', paginaNovedades);
        }
    });
}

// ==================== FUNCIONALIDAD DE INICIO DE SESIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    const btnSesion = document.querySelector('.btn-sesion');
    const userModal = document.getElementById('userModal');
    const btnAdmin = document.getElementById('btnAdmin');
    const btnUser = document.getElementById('btnUser');

    // Verificar si ya hay un tipo de usuario guardado
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
        addPanel();
    } else {
        removePanel();
    }

    // Mostrar modal al hacer clic en "Iniciar sesión"
    btnSesion.addEventListener('click', () => {
        userModal.style.display = 'flex';
    });

    // Seleccionar Administrador
    btnAdmin.addEventListener('click', () => {
        localStorage.setItem('userType', 'admin');
        addPanel();
        userModal.style.display = 'none';
        alert('Sesión iniciada como Administrador');
    });

    // Seleccionar Usuario
    btnUser.addEventListener('click', () => {
        localStorage.setItem('userType', 'user');
        removePanel();
        userModal.style.display = 'none';
        alert('Sesión iniciada como Usuario');
    });

    // Cerrar modal al hacer clic fuera
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });
});

function addPanel() {
    // Remover si ya existe
    removePanel();
    const categoriasDiv = document.querySelector('.categorias');
    const panelDiv = document.createElement('div');
    panelDiv.className = 'panel';
    panelDiv.innerHTML = `
        <span class="panel-label">Panel</span>
        <div class="panel-dropdown">
            <a href="#" class="panel-item" id="agregar-producto">Agregar Producto</a>
            <a href="#" class="panel-item" id="modificar-productos">Modificar productos</a>
            <a href="#" class="panel-item" id="estadisticas">Estadísticas</a>
        </div>
    `;
    categoriasDiv.insertAdjacentElement('afterend', panelDiv);

    // Event listeners para panel
    document.getElementById('agregar-producto').addEventListener('click', () => {
        window.location.href = 'agregar-producto.html';
    });
    document.getElementById('modificar-productos').addEventListener('click', () => {
        window.location.href = 'modificar-productos.html';
    });
    document.getElementById('estadisticas').addEventListener('click', () => {
        window.location.href = 'estadisticas.html';
    });
}

function removePanel() {
    const panel = document.querySelector('.panel');
    if (panel) {
        panel.remove();
    }
}

