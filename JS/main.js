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
    const btnCarrito = document.getElementById('btnCarrito');
    
    if (sesionActual) {
        // Usuario autenticado
        if (botonesNoAutenticado) botonesNoAutenticado.style.display = 'none';
        if (usuarioAutenticado) usuarioAutenticado.style.display = 'flex';
        if (btnCarrito) btnCarrito.style.display = 'inline-block';
        
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

        // Mostrar panel de usuario si es admin
        if (sesionActual.role === 'admin') {
            agregarPanelUsuario();
        } else {
            // Remover panel si existe y no es admin
            const panelExistente = document.querySelector('.panel-usuario');
            if (panelExistente) {
                panelExistente.remove();
            }
        }
    } else {
        // Usuario no autenticado
        if (botonesNoAutenticado) botonesNoAutenticado.style.display = 'flex';
        if (usuarioAutenticado) usuarioAutenticado.style.display = 'none';
        if (btnCarrito) btnCarrito.style.display = 'none';

        // Remover panel de usuario
        const panelExistente = document.querySelector('.panel-usuario');
        if (panelExistente) {
            panelExistente.remove();
        }
    }
}

/**
 * Maneja el dropdown del usuario
 */
function configurarDropdown() {
    const btnAvatar = document.getElementById('btnAvatar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
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

    // Mostrar botón de agregar producto solo para admins
    const agregarProductoBtn = document.getElementById('agregarProductoBtn');
    if (agregarProductoBtn) {
        if (sesionActual && sesionActual.role === 'admin') {
            agregarProductoBtn.style.display = 'block';
            agregarProductoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'agregar-producto.html';
            });
        } else {
            agregarProductoBtn.style.display = 'none';
        }
    }

    // Mostrar botón de gestionar usuarios solo para admins
    const gestionarUsuariosBtn = document.getElementById('gestionarUsuarios');
    if (gestionarUsuariosBtn) {
        if (sesionActual && sesionActual.role === 'admin') {
            gestionarUsuariosBtn.style.display = 'block';
            gestionarUsuariosBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'gestionar-usuarios.html';
            });
        } else {
            gestionarUsuariosBtn.style.display = 'none';
        }
    }

    // Mostrar botón de administrar características solo para admins
    const administrarCaracteristicasBtn = document.getElementById('administrarCaracteristicas');
    if (administrarCaracteristicasBtn) {
        if (sesionActual && sesionActual.role === 'admin') {
            administrarCaracteristicasBtn.style.display = 'block';
            administrarCaracteristicasBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'administrar-caracteristicas.html';
            });
        } else {
            administrarCaracteristicasBtn.style.display = 'none';
        }
    }

    // Mostrar botón de modificar productos solo para admins
    const modificarProductosBtn = document.getElementById('modificarProductos');
    if (modificarProductosBtn) {
        if (sesionActual && sesionActual.role === 'admin') {
            modificarProductosBtn.style.display = 'block';
            modificarProductosBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'modificar-productos.html';
            });
        } else {
            modificarProductosBtn.style.display = 'none';
        }
    }

    // Cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('sesionActual');
                window.location.href = 'index.html';
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
    
    if (!sesionActual || sesionActual.role !== 'admin') {
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
            <a href="administrar-caracteristicas.html" class="panel-item" id="administrar-caracteristicas">Administrar Características</a>
        </div>
    `;
    categoriasDiv.insertAdjacentElement('afterend', panelDiv);
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    actualizarInterfazAutenticacion();
    configurarDropdown();
    configurarBotonesNavegacion();
    
    // Configurar botón carrito
    const btnCarrito = document.getElementById('btnCarrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            window.location.href = 'carrito.html';
        });
    }
});

// Toggle del menú en dispositivos móviles
const menuToggle = document.getElementById('menuToggle');
const headerNav = document.getElementById('headerNav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
    
    // Cerrar dropdowns cuando se abre el menú hamburguesa
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (dropdownMenu) {
        dropdownMenu.classList.remove('show');
    }
    
    // Cerrar dropdown del panel de usuario
    const panelDropdown = document.querySelector('.panel-dropdown');
    if (panelDropdown) {
        panelDropdown.style.maxHeight = '0';
    }
});

// Cerrar menú al hacer clic en un botón
const buttons = document.querySelectorAll('.botones button, .botones a, .panel-item');
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

function obtenerIconosCaracteristicas(producto) {
    const todasLasCaracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
    const caracteristicasProducto = producto.caracteristicas || [];
    return caracteristicasProducto.reduce((icons, caracteristica) => {
        const id = typeof caracteristica === 'string' ? caracteristica : caracteristica.id;
        const caracteristicaData = todasLasCaracteristicas.find(c => c.id === id);
        if (caracteristicaData) {
            icons.push({
                imagen: caracteristicaData.icono,
                nombre: caracteristicaData.nombre
            });
        }
        return icons;
    }, []);
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
        const productosConOferta = productos.filter(p => p.descuento > 0);
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
        
        // Calcular precio con descuento
        let precioMostrado = producto.precio;
        let precioOriginalMostrado = '';
        
        if (producto.descuento > 0) {
            precioMostrado = producto.precioConDescuento || (producto.precio * (1 - producto.descuento / 100));
            precioOriginalMostrado = `<p class="precio-anterior">$${producto.precio.toFixed(2).replace('.', ',')}</p>`;
        }
        
        const caracteristicasIcons = obtenerIconosCaracteristicas(producto);
        const caracteristicasHtml = caracteristicasIcons.length > 0 ? `
            <div class="producto-caracteristicas">
                ${caracteristicasIcons.map(icono => `<img src="${icono.imagen}" alt="${icono.nombre}" class="producto-caracteristica-icono" title="${icono.nombre}">`).join('')}
            </div>
        ` : '';

        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">$${precioMostrado.toFixed(2).replace('.', ',')}</p>
            ${precioOriginalMostrado}
            ${caracteristicasHtml}
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
        const productosFiltrados = productos.filter(p => p.descuento > 0);
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

