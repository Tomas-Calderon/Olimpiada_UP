// Datos de productos (cargados desde localStorage)
let productosData = {};
let productoStockMax = 99;

// ==================== OBTENER RUTAS CORRECTAS ====================
function obtenerRutaIndex() {
    const currentPath = window.location.pathname;
    return currentPath.includes('/html/') ? '../index.html' : 'index.html';
}

function obtenerRutaCarrito() {
    return 'carrito.html'; // Siempre está en la misma carpeta (html/)
}

function obtenerRutaProducto(id) {
    return `producto.html?id=${id}`;
}

function cargarProductosDesdeStorage() {
    productosData = {};
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.forEach(producto => {
        productosData[producto.id] = {
            nombre: producto.nombre,
            imagen: producto.imagen,
            imagenesAdicionales: producto.imagenesAdicionales || [],
            precio: producto.precio,
            precioAnterior: null,
            descripcion: producto.descripcion,
            stock: producto.stock,
            descuento: producto.descuento || 0,
            tipo: producto.tipo,
            caracteristicas: producto.caracteristicas || [],
            disponibilidad: producto.disponibilidad || { inicio: null, fin: null }
        };
    });
}

// Obtener el ID del producto desde la URL
function obtenerProductoDelURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar datos del producto
function cargarProducto() {
    cargarProductosDesdeStorage();
    
    const productoId = obtenerProductoDelURL();
    
    if (!productoId || !productosData[productoId]) {
        // Si no hay producto válido, redirigir a inicio
        window.location.href = obtenerRutaIndex();
        return;
    }

    const producto = productosData[productoId];

    // Actualizar HTML con datos del producto
    document.getElementById('productoNombre').textContent = producto.nombre;
    document.getElementById('headerProductoNombre').textContent = producto.nombre;
    document.getElementById('productoImagen').src = producto.imagen;
    document.getElementById('productoPrecio').textContent = `$${producto.precio.toFixed(2).replace('.', ',')}`;
    document.getElementById('productoDescripcion').textContent = producto.descripcion;

    // Mostrar características si existen
    if (producto.caracteristicas && producto.caracteristicas.length > 0) {
        const caracteristicasDiv = document.getElementById('caracteristicasProducto');
        const listaCaracteristicas = document.getElementById('listaCaracteristicas');
        
        // Obtener todas las características del localStorage
        const todasLasCaracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
        
        listaCaracteristicas.innerHTML = '';
        producto.caracteristicas.forEach(caracteristicaId => {
            const caracteristica = todasLasCaracteristicas.find(c => c.id === caracteristicaId.id || c.id === caracteristicaId);
            if (caracteristica) {
                const tag = document.createElement('span');
                tag.className = 'caracteristica-tag';
                
                // Si el icono es una URL de imagen, mostrar solo la imagen
                if (caracteristica.icono && (caracteristica.icono.startsWith('data:image') || caracteristica.icono.startsWith('http') || caracteristica.icono.match(/\.(png|jpe?g|gif|svg)$/i))) {
                    tag.innerHTML = `<img src="${caracteristica.icono}" alt="${caracteristica.nombre}" class="caracteristica-icono-img" style="width: 20px; height: 20px; vertical-align: middle; border-radius: 3px;" title="${caracteristica.nombre}">`;
                } else {
                    // Si es emoji, mostrar emoji + nombre
                    tag.innerHTML = `<span style="font-size: 1.1em; margin-right: 5px; vertical-align: middle;">${caracteristica.icono}</span>${caracteristica.nombre}`;
                }
                
                listaCaracteristicas.appendChild(tag);
            }
        });
        
        caracteristicasDiv.style.display = 'block';
    }

    // Calcular precio con descuento
    let precioFinal = producto.precio;
    if (producto.descuento > 0) {
        precioFinal = producto.precio * (1 - producto.descuento / 100);
        document.getElementById('productoPrecio').textContent = `$${precioFinal.toFixed(2).replace('.', ',')}`;
        document.getElementById('productoPrecioAnterior').textContent = `$${producto.precio.toFixed(2).replace('.', ',')}`;
        document.getElementById('productoPrecioAnterior').style.display = 'block';
    }

    // Mostrar imágenes adicionales
    const imagenesAdicionalesContainer = document.getElementById('imagenesAdicionales');
    imagenesAdicionalesContainer.innerHTML = '';
    producto.imagenesAdicionales.forEach((img, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = img;
        imgElement.alt = `Imagen adicional ${index + 1}`;
        imgElement.className = 'imagen-adicional';
        imgElement.addEventListener('click', () => {
            document.getElementById('productoImagen').src = img;
        });
        imagenesAdicionalesContainer.appendChild(imgElement);
    });

    // Agregar eventos a los botones de cantidad
    document.getElementById('incrementBtn').addEventListener('click', incrementarCantidad);
    document.getElementById('decrementBtn').addEventListener('click', decrementarCantidad);
    const cantidadInput = document.getElementById('cantidad');
    cantidadInput.addEventListener('change', validarCantidad);
    cantidadInput.setAttribute('max', producto.stock || 99);
    productoStockMax = producto.stock || 0;

    // Agregar eventos a botones de compra
    document.querySelector('.btn-agregar-carrito').addEventListener('click', agregarAlCarrito);
    document.querySelector('.btn-comprar-ahora').addEventListener('click', comprarAhora);
    
    // Agregar evento al botón de favoritos
    const btnAgregarFavoritos = document.getElementById('btnAgregarFavoritos');
    if (btnAgregarFavoritos) {
        btnAgregarFavoritos.addEventListener('click', () => toggleFavorito(productoId));
        // Actualizar estado visual del botón
        actualizarEstadoBotonFavorito(productoId);
    }

    const btnReservar = document.getElementById('btnReservar');
    if (btnReservar) {
        btnReservar.addEventListener('click', () => {
            const contenedorReserva = document.getElementById('contenedorReservaProducto');
            if (!contenedorReserva) return;
            const abierto = contenedorReserva.style.display === 'block';
            contenedorReserva.style.display = abierto ? 'none' : 'block';
            btnReservar.textContent = abierto ? 'Reservar' : 'Ocultar reserva';
        });
    }

    configurarReserva(producto);

    // Agregar evento al botón eliminar
    document.getElementById('eliminarProductoBtn').addEventListener('click', eliminarProducto);

    // Cargar productos relacionados
    cargarProductosRelacionados(productoId);

    // Cargar disponibilidad de fechas
    cargarDisponibilidad(productoId);
    const disponibilidadTexto = document.getElementById('productoDisponibilidadTexto');
    if (disponibilidadTexto) {
        disponibilidadTexto.textContent = obtenerTextoDisponibilidad(producto);
    }
    const stockTexto = document.getElementById('productoStockTexto');
    if (stockTexto) {
        stockTexto.textContent = `Stock disponible: ${producto.stock}`;
    }

    // Mostrar botón eliminar si es admin
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (sesionActual && sesionActual.role === 'admin') {
        document.getElementById('eliminarProductoBtn').style.display = 'block';
    } else {
        document.getElementById('eliminarProductoBtn').style.display = 'none';
    }
}

function obtenerReservasProducto(productoId) {
    try {
        const reservasStorage = JSON.parse(localStorage.getItem('reservas') || '{}');
        return reservasStorage[productoId] || [];
    } catch (error) {
        throw new Error('Error al leer las reservas del almacenamiento');
    }
}

function cargarDisponibilidad(productoId) {
    const errorContenedor = document.getElementById('errorDisponibilidad');
    const calendarios = document.getElementById('disponibilidadCalendarios');
    if (!calendarios || !errorContenedor) return;

    try {
        const producto = productosData[productoId];
        const reservas = obtenerReservasProducto(productoId);
        renderizarDisponibilidadCalendarios(reservas, producto);
        errorContenedor.style.display = 'none';
        calendarios.style.display = 'grid';
    } catch (error) {
        console.error(error);
        calendarios.style.display = 'none';
        errorContenedor.style.display = 'block';
    }
}

function renderizarDisponibilidadCalendarios(reservas, producto) {
    const container = document.getElementById('disponibilidadCalendarios');
    const rangoTexto = document.getElementById('productoDisponibilidadRango');
    if (!container) return;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let mesInicio = new Date(hoy);
    let mesFin = new Date(hoy);
    mesFin.setMonth(mesFin.getMonth() + 1);

    if (producto && producto.disponibilidad) {
        const disponibilidad = producto.disponibilidad;
        if (disponibilidad.inicio) {
            const fechaInicio = new Date(disponibilidad.inicio);
            fechaInicio.setHours(0, 0, 0, 0);
            if (fechaInicio > hoy) {
                mesInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), 1);
            } else {
                mesInicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
            }
        }
        if (disponibilidad.fin) {
            const fechaFin = new Date(disponibilidad.fin);
            fechaFin.setHours(0, 0, 0, 0);
            mesFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth() + 1, 1);
        }
    }

    const meses = [];
    let mesActual = new Date(mesInicio);
    while (mesActual < mesFin && meses.length < 3) {
        meses.push(new Date(mesActual));
        mesActual.setMonth(mesActual.getMonth() + 1);
    }

    if (meses.length === 0) {
        container.innerHTML = '<p style="color: #ddd;">Sin disponibilidad.</p>';
        if (rangoTexto) rangoTexto.style.display = 'none';
        return;
    }

    const fechasReservadas = reservas.map(item => {
        const fecha = typeof item === 'string' ? item : item.fecha;
        const d = new Date(fecha);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    });

    let mostrarRangoCompleto = false;
    if (producto && producto.disponibilidad && producto.disponibilidad.fin) {
        const disponibilidadInicio = producto.disponibilidad.inicio ? new Date(producto.disponibilidad.inicio) : new Date(hoy);
        const disponibilidadFin = new Date(producto.disponibilidad.fin);
        disponibilidadInicio.setHours(0, 0, 0, 0);
        disponibilidadFin.setHours(0, 0, 0, 0);

        let mesesTotales = 0;
        const mesContador = new Date(disponibilidadInicio.getFullYear(), disponibilidadInicio.getMonth(), 1);
        const mesLimite = new Date(disponibilidadFin.getFullYear(), disponibilidadFin.getMonth() + 1, 1);
        while (mesContador < mesLimite) {
            mesesTotales += 1;
            mesContador.setMonth(mesContador.getMonth() + 1);
        }

        mostrarRangoCompleto = mesesTotales > 3;

        if (mostrarRangoCompleto && rangoTexto) {
            rangoTexto.textContent = `Rango completo: ${formatDate(disponibilidadInicio.toISOString().split('T')[0])} a ${formatDate(producto.disponibilidad.fin)}`;
            rangoTexto.style.display = 'block';
        }
    }

    if (!mostrarRangoCompleto && rangoTexto) {
        rangoTexto.style.display = 'none';
    }

    container.innerHTML = meses.map(mes => crearCalendarioMes(mes, fechasReservadas, producto)).join('');
}

function crearCalendarioMes(mes, fechasReservadas, producto) {
    const nombreMes = mes.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
    const diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const primerDiaSemana = (new Date(mes.getFullYear(), mes.getMonth(), 1).getDay() + 6) % 7; // Ajuste para lunes como primer día
    const diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();

    const disponibilidadInicio = producto?.disponibilidad?.inicio ? new Date(producto.disponibilidad.inicio) : null;
    const disponibilidadFin = producto?.disponibilidad?.fin ? new Date(producto.disponibilidad.fin) : null;
    if (disponibilidadInicio) disponibilidadInicio.setHours(0, 0, 0, 0);
    if (disponibilidadFin) disponibilidadFin.setHours(0, 0, 0, 0);

    let diasHtml = '';
    for (let i = 0; i < primerDiaSemana; i++) {
        diasHtml += '<div class="calendario-dia calendario-dia-vacio"></div>';
    }

    for (let dia = 1; dia <= diasDelMes; dia++) {
        const fecha = new Date(mes.getFullYear(), mes.getMonth(), dia);
        fecha.setHours(0, 0, 0, 0);
        const timestamp = fecha.getTime();
        const reservado = fechasReservadas.includes(timestamp);

        let clase = 'calendario-disponible';
        let etiqueta = 'Disponible';

        if (reservado) {
            clase = 'calendario-ocupado';
            etiqueta = 'Reservado';
        } else if (disponibilidadInicio || disponibilidadFin) {
            const dentroRango = (!disponibilidadInicio || fecha >= disponibilidadInicio) && (!disponibilidadFin || fecha <= disponibilidadFin);
            if (!dentroRango) {
                clase = 'calendario-fuera-rango';
                etiqueta = 'Fuera de rango';
            }
        }

        diasHtml += `
            <button type="button" class="calendario-dia ${clase}" title="${etiqueta}">
                ${dia}
            </button>
        `;
    }

    return `
        <div class="calendario-mes">
            <div class="calendario-titulo">${nombreMes}</div>
            <div class="calendario-semana">${diasSemana.map(d => `<span>${d}</span>`).join('')}</div>
            <div class="calendario-dias">${diasHtml}</div>
        </div>
    `;
}

function inicializarDisponibilidad() {
    const btnReintentar = document.getElementById('btnReintentarDisponibilidad');
    if (!btnReintentar) return;

    btnReintentar.addEventListener('click', () => {
        const productoId = obtenerProductoDelURL();
        cargarDisponibilidad(productoId);
    });
}

// Cargar el producto cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarProducto();
    configurarBotonesAdicionales();
    inicializarDisponibilidad();
});

// Cargar productos relacionados
function cargarProductosRelacionados(productoId) {
    const relacionadosLista = document.querySelector('.productos-relacionados .productos-lista');
    relacionadosLista.innerHTML = '';

    const productos = Object.keys(productosData).filter(id => id !== productoId);
    
    // Mostrar hasta 4 productos relacionados
    productos.slice(0, 4).forEach(id => {
        const producto = productosData[id];
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.style.cursor = 'pointer';
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">$${producto.precio.toFixed(2).replace('.', ',')}</p>
        `;

        productoDiv.addEventListener('click', () => {
            window.location.href = obtenerRutaProducto(id);
        });

        relacionadosLista.appendChild(productoDiv);
    });
}

// Funciones de cantidad
function incrementarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    const max = parseInt(input.getAttribute('max')) || 99;
    if (valor < max) {
        input.value = valor + 1;
    }
}

function decrementarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    if (valor > 1) {
        input.value = valor - 1;
    }
}

function validarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    const max = parseInt(input.getAttribute('max')) || 99;
    
    if (valor < 1) {
        input.value = 1;
    } else if (valor > max) {
        input.value = max;
    }
}

function configurarReserva(producto) {
    const fechaReservaInput = document.getElementById('fechaReserva');
    const btnConfirmarReserva = document.getElementById('btnConfirmarReserva');
    const reservaInfo = document.getElementById('reservaInfo');
    const reservaError = document.getElementById('reservaError');
    const productoId = obtenerProductoDelURL();

    if (!fechaReservaInput || !btnConfirmarReserva || !reservaInfo) return;

    const hoy = new Date();
    const hoyIso = hoy.toISOString().split('T')[0];
    let minFecha = hoyIso;
    let maxFecha = null;

    if (producto.disponibilidad?.inicio) {
        minFecha = producto.disponibilidad.inicio > hoyIso ? producto.disponibilidad.inicio : hoyIso;
    }
    if (producto.disponibilidad?.fin) {
        maxFecha = producto.disponibilidad.fin;
    }

    fechaReservaInput.min = minFecha;
    fechaReservaInput.max = maxFecha || '';
    reservaInfo.textContent = obtenerTextoDisponibilidad(producto);

    if (maxFecha && minFecha > maxFecha) {
        fechaReservaInput.disabled = true;
        reservaInfo.textContent = 'No hay fechas disponibles para reservar en este producto.';
    }

    fechaReservaInput.addEventListener('change', () => {
        reservaError.style.display = 'none';
    });

    btnConfirmarReserva.addEventListener('click', () => reservarProducto(productoId, producto));
}

function formatDate(dateString) {
    if (!dateString) return '';
    const fecha = new Date(dateString);
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function obtenerTextoDisponibilidad(producto) {
    const inicio = producto.disponibilidad?.inicio;
    const fin = producto.disponibilidad?.fin;

    if (!inicio && !fin) {
        return 'Siempre disponible';
    }

    if (inicio && fin) {
        return `Disponible desde ${formatDate(inicio)} hasta ${formatDate(fin)}`;
    }

    if (inicio) {
        return `Disponible desde ${formatDate(inicio)}`;
    }

    return `Disponible hasta ${formatDate(fin)}`;
}

// Funciones de compra
function agregarAlCarrito() {
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const productoId = obtenerProductoDelURL();
    const producto = productosData[productoId];
    
    // Obtener carrito actual del localStorage
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    // Buscar si el producto ya existe en el carrito
    const indiceProducto = carrito.findIndex(item => item.id === productoId);

    if (indiceProducto !== -1) {
        carrito[indiceProducto].cantidad += cantidad;
    } else {
        carrito.push({
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            descuento: producto.descuento,
            precioConDescuento: producto.descuento > 0 ? producto.precio * (1 - producto.descuento / 100) : producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    alert(`${cantidad} unidad(es) de "${producto.nombre}" agregada(s) al carrito`);
}

function comprarAhora() {
    const cantidad = document.getElementById('cantidad').value;
    const productoId = obtenerProductoDelURL();
    const producto = productosData[productoId];

    alert(`Iniciando compra de ${cantidad} unidad(es) de "${producto.nombre}"`);
    // Aquí se podría redirigir al checkout
}

function validarFechaReserva(productoId) {
    const fechaReservaInput = document.getElementById('fechaReserva');
    const reservaError = document.getElementById('reservaError');
    if (!fechaReservaInput || !reservaError) return false;

    const fechaSeleccionada = fechaReservaInput.value;
    if (!fechaSeleccionada) {
        reservaError.textContent = 'Selecciona una fecha para reservar.';
        reservaError.style.display = 'block';
        return false;
    }

    const reservas = obtenerReservasProducto(productoId);
    const fechaYaReservada = reservas.some(item => {
        const fecha = typeof item === 'string' ? item : item.fecha;
        return fecha === fechaSeleccionada;
    });

    if (fechaYaReservada) {
        reservaError.textContent = 'Esa fecha ya está reservada.';
        reservaError.style.display = 'block';
        return false;
    }

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);
    const seleccion = new Date(fechaSeleccionada);
    seleccion.setHours(0, 0, 0, 0);

    if (seleccion < fechaActual) {
        reservaError.textContent = 'No puedes reservar una fecha pasada.';
        reservaError.style.display = 'block';
        return false;
    }

    const producto = productosData[productoId];
    if (producto && producto.disponibilidad) {
        const inicio = producto.disponibilidad.inicio ? new Date(producto.disponibilidad.inicio) : null;
        const fin = producto.disponibilidad.fin ? new Date(producto.disponibilidad.fin) : null;
        if (inicio) {
            inicio.setHours(0, 0, 0, 0);
            if (seleccion < inicio) {
                reservaError.textContent = 'La fecha debe estar dentro del periodo de disponibilidad del producto.';
                reservaError.style.display = 'block';
                return false;
            }
        }
        if (fin) {
            fin.setHours(0, 0, 0, 0);
            if (seleccion > fin) {
                reservaError.textContent = 'La fecha debe estar dentro del periodo de disponibilidad del producto.';
                reservaError.style.display = 'block';
                return false;
            }
        }
    }

    reservaError.style.display = 'none';
    return true;
}

function reservarProducto(productoId, producto) {
    const fechaReservaInput = document.getElementById('fechaReserva');
    const reservaError = document.getElementById('reservaError');
    if (!fechaReservaInput || !reservaError) return;

    if (!validarFechaReserva(productoId)) {
        return;
    }

    const fechaSeleccionada = fechaReservaInput.value;
    const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
    const max = producto.stock || 0;
    if (cantidad < 1 || cantidad > max) {
        reservaError.textContent = `La cantidad debe ser entre 1 y ${max}.`;
        reservaError.style.display = 'block';
        return;
    }

    let reservas = JSON.parse(localStorage.getItem('reservas') || '{}');
    reservas[productoId] = reservas[productoId] || [];
    reservas[productoId].push({ fecha: fechaSeleccionada, cantidad });
    localStorage.setItem('reservas', JSON.stringify(reservas));

    alert(`Reserva registrada para ${cantidad} unidad(es) el ${fechaSeleccionada}.`);
    fechaReservaInput.value = '';
    reservaError.style.display = 'none';
    cargarDisponibilidad(productoId);
}

// Función para eliminar producto
function eliminarProducto() {
    const productoId = obtenerProductoDelURL();
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto permanentemente?')) {
        // Obtener productos del localStorage
        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Filtrar para remover el producto
        productos = productos.filter(producto => producto.id !== productoId);
        
        // Guardar de vuelta
        localStorage.setItem('productos', JSON.stringify(productos));
        
        // Redirigir a index.html
        window.location.href = obtenerRutaIndex();
    }
}

// Agregar evento al botón de carrito
function configurarBotonesAdicionales() {
    const btnCarrito = document.getElementById('btnCarrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            window.location.href = obtenerRutaCarrito();
        });
    }
}

// ==================== GESTIÓN DE FAVORITOS ====================

/**
 * Obtiene los favoritos del usuario actual desde localStorage
 */
function obtenerFavoritosUsuario() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (!sesionActual) {
        return [];
    }
    
    const claveFavoritos = `favoritos_${sesionActual.usuarioId}`;
    return JSON.parse(localStorage.getItem(claveFavoritos) || '[]');
}

/**
 * Guarda los favoritos del usuario en localStorage
 */
function guardarFavoritosUsuario(favoritos) {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (!sesionActual) {
        return;
    }
    
    const claveFavoritos = `favoritos_${sesionActual.usuarioId}`;
    localStorage.setItem(claveFavoritos, JSON.stringify(favoritos));
}

/**
 * Alterna el estado de favorito de un producto
 */
function toggleFavorito(productoId) {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (!sesionActual) {
        alert('Debes iniciar sesión para agregar a favoritos');
        return;
    }
    
    let favoritos = obtenerFavoritosUsuario();
    const indice = favoritos.findIndex(f => f.id === productoId);
    
    if (indice !== -1) {
        // Ya está en favoritos, lo removemos
        favoritos.splice(indice, 1);
        alert('Producto removido de favoritos');
    } else {
        // No está en favoritos, lo agregamos
        const producto = productosData[productoId];
        favoritos.push({
            id: productoId,
            nombre: producto.nombre,
            precio: producto.precio,
            descuento: producto.descuento,
            imagen: producto.imagen,
            fechaAgregado: new Date().toISOString()
        });
        alert('Producto agregado a favoritos');
    }
    
    guardarFavoritosUsuario(favoritos);
    actualizarEstadoBotonFavorito(productoId);
}

/**
 * Actualiza el estado visual del botón de favoritos
 */
function actualizarEstadoBotonFavorito(productoId) {
    const btnFavorito = document.getElementById('btnAgregarFavoritos');
    if (!btnFavorito) return;
    
    const favoritos = obtenerFavoritosUsuario();
    const esFavorito = favoritos.some(f => f.id === productoId);
    
    if (esFavorito) {
        btnFavorito.classList.add('favorito-activo');
        btnFavorito.textContent = '♥ Quitar de Favoritos';
    } else {
        btnFavorito.classList.remove('favorito-activo');
        btnFavorito.textContent = '♥ Agregar a Favoritos';
    }
}

