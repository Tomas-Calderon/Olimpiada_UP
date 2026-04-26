// ==================== GESTIÓN DE SESIÓN ====================

/**
 * Obtiene las iniciales de nombre y apellido
 */
function obtenerInicialesUsuario(nombre, apellido) {
    const inicial1 = nombre.charAt(0).toUpperCase();
    const inicial2 = apellido.charAt(0).toUpperCase();
    return inicial1 + inicial2;
}

/**
 * Actualiza la interfaz según el estado de autenticación
 */
function actualizarInterfazAutenticacion() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    const botonesNoAutenticado = document.getElementById('botones-no-autenticado');
    const usuarioAutenticado = document.getElementById('usuario-autenticado');
    
    if (sesionActual) {
        // Usuario autenticado
        if (botonesNoAutenticado) botonesNoAutenticado.style.display = 'none';
        if (usuarioAutenticado) usuarioAutenticado.style.display = 'flex';
        
        // Mostrar nombre del usuario
        const usuarioNombreEl = document.getElementById('usuarioNombre');
        if (usuarioNombreEl) {
            usuarioNombreEl.textContent = sesionActual.nombre;
        }
        
        // Mostrar iniciales en avatar
        const avatarInicialesEl = document.getElementById('avatarIniciales');
        if (avatarInicialesEl) {
            avatarInicialesEl.textContent = obtenerInicialesUsuario(
                sesionActual.nombre,
                sesionActual.apellido
            );
        }
    } else {
        // Usuario no autenticado
        if (botonesNoAutenticado) botonesNoAutenticado.style.display = 'flex';
        if (usuarioAutenticado) usuarioAutenticado.style.display = 'none';
    }
}

/**
 * Maneja el dropdown del usuario
 */
function configurarDropdown() {
    const btnAvatar = document.getElementById('btnAvatar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    
    if (btnAvatar) {
        btnAvatar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
            }
        });
    }
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (btnAvatar && !btnAvatar.contains(e.target) && dropdownMenu && !dropdownMenu.contains(e.target)) {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        }
    });
    
    // Mi Perfil
    const miPerfil = document.getElementById('miPerfil');
    if (miPerfil) {
        miPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'mi-perfil.html';
        });
    }

    // Cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('sesionActual');
                window.location.href = 'main.html';
            }
        });
    }
}

/**
 * Configura los botones de navegación
 */
function configurarBotonesNavegacion() {
    const btnCrearCuenta = document.getElementById('btnCrearCuenta');
    const btnIniciarSesion = document.getElementById('btnIniciarSesion');
    
    if (btnCrearCuenta) {
        btnCrearCuenta.addEventListener('click', () => {
            window.location.href = 'crear-cuenta.html';
        });
    }
    
    if (btnIniciarSesion) {
        btnIniciarSesion.addEventListener('click', () => {
            window.location.href = 'iniciar-sesion.html';
        });
    }
}

/**
 * Agrega un panel de administración para usuarios autenticados
 */
function agregarPanelUsuario() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual) {
        return;
    }

    // Remover si ya existe
    const panelExistente = document.querySelector('.panel-usuario');
    if (panelExistente) {
        panelExistente.remove();
    }

    const categoriasDiv = document.querySelector('.categorias');
    if (!categoriasDiv) return;

    const panelDiv = document.createElement('div');
    panelDiv.className = 'panel-usuario';
    panelDiv.innerHTML = `
        <span class="panel-label">Mis Productos</span>
        <div class="panel-dropdown">
            <a href="agregar-producto.html" class="panel-item" id="agregar-producto">Agregar Producto</a>
            <a href="modificar-productos.html" class="panel-item" id="modificar-productos">Mis Productos</a>
        </div>
    `;
    categoriasDiv.insertAdjacentElement('afterend', panelDiv);
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfazAutenticacion();
    configurarDropdown();
    configurarBotonesNavegacion();
    agregarPanelUsuario();
});

// Toggle del menú en dispositivos móviles
const menuToggle = document.getElementById('menuToggle');
const headerNav = document.getElementById('headerNav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
    
    // Cerrar dropdown cuando se abre el menú hamburguesa
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
    }
});

// Cerrar menú al hacer clic en un botón
const buttons = document.querySelectorAll('.botones button, .botones a');
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

// Redirigir al formulario de crear cuenta
document.addEventListener('DOMContentLoaded', () => {
    const btnCrear = document.querySelector('.btn-cuenta');
    if (btnCrear) {
        btnCrear.addEventListener('click', () => {
            window.location.href = 'crear-cuenta.html';
        });
    }
});

