// ==================== CONFIGURACIÓN ==================== 
const ADMIN_PASSWORD = "admin123"; // En producción, usar autenticación segura
let productoEnEdicion = null;
let imagenesCargadas = []; // Array para almacenar imágenes durante la edición
let imagenesCargadasBase64 = []; // Array para almacenar imágenes en Base64 mientras se agregan

// ==================== FUNCIONES DE FORMATO ==================== 
function formatearPrecio(valor) {
    if (!valor && valor !== 0) return "$0,00";
    // Convertir a string con 2 decimales
    let str = parseFloat(valor).toFixed(2).toString();
    // Separar parte entera y decimal
    let [entero, decimal] = str.split('.');
    // Agregar puntos cada 3 dígitos en la parte entera
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    // Retornar formato final
    return "$" + entero + "," + decimal;
}

function formatearNumero(valor) {
    if (!valor && valor !== 0) return "0,00";
    // Convertir a string con 2 decimales
    let str = parseFloat(valor).toFixed(2).toString();
    // Separar parte entera y decimal
    let [entero, decimal] = str.split('.');
    // Agregar puntos cada 3 dígitos
    entero = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    // Retornar formato
    return entero + "," + decimal;
}

function formatearEstadistica(valor) {
    valor = parseFloat(valor);
    if (valor >= 1000000000) {
        return (valor / 1000000000).toFixed(2).replace(".", ",") + "B";
    } else if (valor >= 1000000) {
        return (valor / 1000000).toFixed(2).replace(".", ",") + "M";
    } else if (valor >= 1000) {
        return (valor / 1000).toFixed(2).replace(".", ",") + "k";
    }
    return valor.toFixed(2).replace(".", ",");
}

// ==================== INICIALIZACIÓN ==================== 
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    inicializarEventos();
    cargarProductos();
    actualizarEstadisticas();
    
    // Validación para PRECIO (dígitos y punto, máx 2 decimales)
    document.getElementById('precio').addEventListener('input', function() {
        validarPrecio(this);
    });
    
    document.getElementById('editPrecio').addEventListener('input', function() {
        validarPrecio(this);
    });
    
    // Validación para DESCUENTO (solo dígitos, máx 3 caracteres)
    document.getElementById('descuento').addEventListener('input', function() {
        validarDescuento(this);
    });
    
    document.getElementById('editDescuento').addEventListener('input', function() {
        validarDescuento(this);
    });
    
    // Validación para STOCK (solo dígitos, sin límite de caracteres)
    document.getElementById('stock').addEventListener('input', function() {
        validarStock(this);
    });
    
    document.getElementById('editStock').addEventListener('input', function() {
        validarStock(this);
    });
});

// Valida PRECIO: solo dígitos y un punto, máx 2 decimales
function validarPrecio(input) {
    let valor = input.value;
    
    // Solo permite dígitos y puntos
    valor = valor.replace(/[^\d.]/g, '');
    
    // Solo un punto, si hay más, elimina todo menos el primero
    const partes = valor.split('.');
    if (partes.length > 2) {
        valor = partes[0] + '.' + partes.slice(1).join('');
    }
    
    // Máximo 2 decimales
    if (valor.includes('.')) {
        const [entero, decimal] = valor.split('.');
        if (decimal.length > 2) {
            valor = entero + '.' + decimal.substring(0, 2);
        }
    }
    
    input.value = valor;
}

// Valida DESCUENTO: solo dígitos, máx 3 caracteres, max 100
function validarDescuento(input) {
    let valor = input.value;
    let posicionCursor = input.selectionStart;
    
    // Remueve cualquier carácter que no sea dígito
    valor = valor.replace(/[^\d]/g, '');
    
    // Limitar a 3 caracteres
    if (valor.length > 3) {
        valor = valor.substring(0, 3);
    }
    
    // Asegurar que no sea mayor a 100
    if (valor && parseInt(valor) > 100) {
        valor = '100';
    }
    
    input.value = valor;
    
    // Restaurar posición del cursor después de que el navegador procese el cambio
    setTimeout(() => {
        const nuevaPosicion = Math.min(posicionCursor, input.value.length);
        input.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }, 0);
}

// Valida STOCK: solo dígitos, sin límite de caracteres
function validarStock(input) {
    let valor = input.value;
    let posicionCursor = input.selectionStart;
    
    // Remueve cualquier carácter que no sea dígito
    valor = valor.replace(/[^\d]/g, '');
    
    input.value = valor;
    
    // Restaurar posición del cursor después de que el navegador procese el cambio
    setTimeout(() => {
        const nuevaPosicion = Math.min(posicionCursor, input.value.length);
        input.setSelectionRange(nuevaPosicion, nuevaPosicion);
    }, 0);
}

// ==================== AUTENTICACIÓN ==================== 
function verificarAutenticacion() {
    const adminAutenticado = sessionStorage.getItem('adminAutenticado');
    if (!adminAutenticado) {
        mostrarLoginAdmin();
    }
}

function mostrarLoginAdmin() {
    const password = prompt('Ingresa la contraseña del panel de administración:');
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAutenticado', 'true');
    } else if (password !== null) {
        alert('Contraseña incorrecta');
        location.href = 'main.html';
    } else {
        location.href = 'main.html';
    }
}

function cerrarAdmin() {
    sessionStorage.removeItem('adminAutenticado');
    location.href = 'main.html';
}

// ==================== EVENTOS DE NAVEGACIÓN ==================== 
function inicializarEventos() {
    // Navegación del sidebar
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sectionId = btn.getAttribute('data-section') + '-section';
            cambiarSeccion(sectionId);
            
            // Actualizar botón activo
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Formulario de producto
    document.getElementById('formularioProducto').addEventListener('submit', guardarProducto);

    // Drag and drop para imágenes
    const uploadArea = document.querySelector('.imagen-upload-area');
    setupDragAndDrop(uploadArea);

    // Click en área de upload
    uploadArea.addEventListener('click', () => {
        document.getElementById('imagenes').click();
    });

    // Cambio de imágenes
    document.getElementById('imagenes').addEventListener('change', mostrarPreviewsImagenes);

    // Formulario de edición
    document.getElementById('formularioEditar').addEventListener('submit', guardarEdicion);

    // Toggle menú móvil
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.querySelector('.admin-sidebar').classList.toggle('active');
        });
    }
}

// ==================== NAVEGACIÓN ENTRE SECCIONES ==================== 
function cambiarSeccion(sectionId) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.add('active');
    }

    // Actualizar estadísticas si es necesario
    if (sectionId === 'estadisticas-section') {
        actualizarEstadisticas();
    }

    // Ocultar sidebar en móvil después de seleccionar
    if (window.innerWidth <= 768) {
        document.querySelector('.admin-sidebar').classList.remove('active');
    }
}

// ==================== GESTIÓN DE IMÁGENES ==================== 
function setupDragAndDrop(area) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        area.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    area.addEventListener('dragover', () => {
        area.classList.add('drag-over');
    });

    area.addEventListener('dragleave', () => {
        area.classList.remove('drag-over');
    });

    area.addEventListener('drop', (e) => {
        area.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        document.getElementById('imagenes').files = files;
        mostrarPreviewsImagenes({ target: { files } });
    });
}

function mostrarPreviewsImagenes(evento) {
    const files = evento.target.files;
    const preview = document.getElementById('imagenesPreview');

    // Procesar cada archivo
    Array.from(files).forEach((file) => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const base64 = e.target.result;
                // Agregar al array (no reemplazar)
                imagenesCargadasBase64.push(base64);
                
                // Crear preview
                const div = document.createElement('div');
                const index = imagenesCargadasBase64.length - 1;
                div.className = 'preview-imagen' + (index === 0 ? ' image-principal' : '');
                div.innerHTML = `
                    <img src="${base64}" alt="">
                    <button type="button" class="btn-eliminar-imagen" onclick="eliminarImagenPreview(${index})">×</button>
                    ${index !== 0 ? `<button type="button" class="btn-hacer-principal" onclick="hacerPrincipalPorIndice(${index}); return false;">★</button>` : ''}
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });

    // Limpiar el input para permitir cargar el mismo archivo nuevamente
    evento.target.value = '';
    // Limpiar mensaje de error
    document.getElementById('error-imagenes').textContent = '';
}

function eliminarImagenPreview(index) {
    imagenesCargadasBase64.splice(index, 1);
    // Redibujar previews
    const preview = document.getElementById('imagenesPreview');
    preview.innerHTML = '';
    
    imagenesCargadasBase64.forEach((base64, idx) => {
        const div = document.createElement('div');
        div.className = 'preview-imagen' + (idx === 0 ? ' image-principal' : '');
        div.innerHTML = `
            <img src="${base64}" alt="">
            <button type="button" class="btn-eliminar-imagen" onclick="eliminarImagenPreview(${idx})">×</button>
            ${idx !== 0 ? `<button type="button" class="btn-hacer-principal" onclick="hacerPrincipalPorIndice(${idx}); return false;">★</button>` : ''}
        `;
        preview.appendChild(div);
    });
}

function hacerPrincipalPorIndice(index) {
    if (index !== 0) {
        // Mover la imagen seleccionada al inicio
        const imagen = imagenesCargadasBase64.splice(index, 1)[0];
        imagenesCargadasBase64.unshift(imagen);
        
        // Redibujar previews
        const preview = document.getElementById('imagenesPreview');
        preview.innerHTML = '';
        
        imagenesCargadasBase64.forEach((base64, idx) => {
            const div = document.createElement('div');
            div.className = 'preview-imagen' + (idx === 0 ? ' image-principal' : '');
            div.innerHTML = `
                <img src="${base64}" alt="">
                <button type="button" class="btn-eliminar-imagen" onclick="eliminarImagenPreview(${idx})">×</button>
                ${idx !== 0 ? `<button type="button" class="btn-hacer-principal" onclick="hacerPrincipalPorIndice(${idx}); return false;">★</button>` : ''}
            `;
            preview.appendChild(div);
        });
    }
}

// ==================== GESTIÓN DE PRODUCTOS ==================== 
function obtenerProductos() {
    const productos = localStorage.getItem('productos');
    return productos ? JSON.parse(productos) : [];
}

function guardarProductosEnLocal(productos) {
    localStorage.setItem('productos', JSON.stringify(productos));
}

function guardarProducto(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const descuento = document.getElementById('descuento').value 
        ? parseInt(document.getElementById('descuento').value) 
        : 0;
    const stock = parseInt(document.getElementById('stock').value);

    // Validación
    if (!nombre || !descripcion || !precio || !stock) {
        mostrarMensajeError('Por favor completa todos los campos requeridos');
        return;
    }

    if (imagenesCargadasBase64.length === 0) {
        document.getElementById('error-imagenes').textContent = '❌ Debes cargar al menos una imagen';
        return;
    }

    // Validar nombre único
    const productos = obtenerProductos();
    if (productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
        document.getElementById('error-nombre').textContent = 
            '❌ Este nombre de producto ya existe. Por favor elige otro.';
        return;
    }
    document.getElementById('error-nombre').textContent = '';

    // Validar descuento
    if (descuento > 100) {
        document.getElementById('descuento').value = 100;
        mostrarMensajeError('El descuento no puede ser mayor a 100%');
        return;
    }

    // Calcular precio con descuento
    const precioConDescuento = descuento > 0 ? precio * (1 - descuento / 100) : precio;

    // Crear producto
    const nuevoProducto = {
        id: Date.now(),
        nombre,
        descripcion,
        precio: parseFloat(precio.toFixed(2)),
        precioConDescuento: parseFloat(precioConDescuento.toFixed(2)),
        descuento,
        stock,
        imagenes: [...imagenesCargadasBase64],
        imagenPrincipal: imagenesCargadasBase64[0],
        fechaCreacion: new Date().toISOString()
    };

    // Guardar en localStorage
    productos.push(nuevoProducto);
    guardarProductosEnLocal(productos);

    // Mostrar éxito
    mostrarMensajeExito();
    document.getElementById('formularioProducto').reset();
    document.getElementById('imagenesPreview').innerHTML = '';
    imagenesCargadasBase64 = []; // Limpiar array de imágenes

    // Actualizar lista y estadísticas
    cargarProductos();
    actualizarEstadisticas();

    // Cambiar a sección de gestión automáticamente
    setTimeout(() => {
        document.querySelector('[data-section="productos"]').click();
    }, 2000);
}

function procesarImagenes(files, callback) {
    const imagenesBase64 = [];
    let procesadas = 0;

    if (files.length === 0) {
        callback([]);
        return;
    }

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagenesBase64.push(e.target.result);
                procesadas++;

                if (procesadas === files.length) {
                    callback(imagenesBase64);
                }
            };
            reader.readAsDataURL(file);
        } else {
            procesadas++;
            if (procesadas === files.length) {
                callback(imagenesBase64);
            }
        }
    });
}

function cargarProductos() {
    const productos = obtenerProductos();
    const container = document.getElementById('productosAdminList');
    container.innerHTML = '';

    if (productos.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No hay productos. ¡Crea uno nuevo!</p>';
        return;
    }

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-admin-card';
        
        const stockClass = producto.stock > 0 ? 'en-stock' : 'sin-stock';
        const stockText = producto.stock > 0 ? `${producto.stock} en stock` : 'Sin stock';
        
        const primeraImagen = producto.imagenPrincipal || producto.imagenes[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18"%3ESin imagen%3C/text%3E%3C/svg%3E';

        // Mostrar precio con descuento si existe
        let precioHTML = `<div class="producto-admin-precio">${formatearPrecio(producto.precio)}</div>`;
        if (producto.descuento > 0) {
            precioHTML = `
                <div class="producto-admin-precio-original" style="text-decoration: line-through; color: #999; font-size: 0.9rem;">${formatearPrecio(producto.precio)}</div>
                <div class="producto-admin-precio">${formatearPrecio(producto.precioConDescuento)} (-${Math.round(producto.descuento)}%)</div>
            `;
        }

        card.innerHTML = `
            <img src="${primeraImagen}" alt="${producto.nombre}" class="producto-admin-imagen">
            <div class="producto-admin-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion.substring(0, 100)}${producto.descripcion.length > 100 ? '...' : ''}</p>
                ${precioHTML}
                <span class="producto-admin-stock ${stockClass}">${stockText}</span>
                <p style="color: #999; font-size: 0.85rem;">
                    ${producto.imagenes.length} imagen(es)
                </p>
                <div class="producto-admin-acciones">
                    <button class="btn-editar" onclick="abrirModalEditar(${producto.id})">✏️ Editar</button>
                    <button class="btn-eliminar-product" onclick="confirmarEliminar(${producto.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==================== EDICIÓN DE PRODUCTOS ==================== 
function abrirModalEditar(productoId) {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === productoId);

    if (!producto) return;

    productoEnEdicion = productoId;
    imagenesCargadas = [...(producto.imagenes || [])];

    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editDescripcionEdit').value = producto.descripcion;
    document.getElementById('editPrecio').value = producto.precio.toFixed(2);
    document.getElementById('editStock').value = producto.stock;
    document.getElementById('editDescuento').value = Math.round(producto.descuento || 0);

    document.getElementById('modalEditar').classList.add('active');
}

function cerrarModalEditar() {
    document.getElementById('modalEditar').classList.remove('active');
    productoEnEdicion = null;
}

function guardarEdicion(evento) {
    evento.preventDefault();

    if (!productoEnEdicion) return;

    const productos = obtenerProductos();
    const indice = productos.findIndex(p => p.id === productoEnEdicion);

    if (indice === -1) return;

    const nombreNuevo = document.getElementById('editNombre').value.trim();
    const nombreAnterior = productos[indice].nombre;

    // Validar nombre único (si cambió)
    if (nombreNuevo.toLowerCase() !== nombreAnterior.toLowerCase()) {
        if (productos.some(p => p.nombre.toLowerCase() === nombreNuevo.toLowerCase())) {
            alert('❌ Este nombre ya existe. Por favor elige otro.');
            return;
        }
    }

    const descuento = parseInt(document.getElementById('editDescuento').value) || 0;
    const precio = parseFloat(document.getElementById('editPrecio').value);
    
    // Validar descuento
    if (descuento > 100) {
        alert('El descuento no puede ser mayor a 100%');
        document.getElementById('editDescuento').value = 100;
        return;
    }

    const precioConDescuento = descuento > 0 ? precio * (1 - descuento / 100) : precio;

    // Actualizar producto
    productos[indice].nombre = nombreNuevo;
    productos[indice].descripcion = document.getElementById('editDescripcionEdit').value.trim();
    productos[indice].precio = parseFloat(precio.toFixed(2));
    productos[indice].precioConDescuento = parseFloat(precioConDescuento.toFixed(2));
    productos[indice].descuento = descuento;
    productos[indice].stock = parseInt(document.getElementById('editStock').value);

    guardarProductosEnLocal(productos);
    cargarProductos();
    actualizarEstadisticas();
    cerrarModalEditar();

    alert('✅ Producto actualizado correctamente');
}

// ==================== ELIMINACIÓN DE PRODUCTOS ==================== 
function confirmarEliminar(productoId) {
    productoEnEdicion = productoId;
    document.getElementById('modalConfirmar').classList.add('active');
}

function cerrarModal() {
    document.getElementById('modalConfirmar').classList.remove('active');
    productoEnEdicion = null;
}

document.getElementById('btnConfirmarEliminar')?.addEventListener('click', () => {
    if (!productoEnEdicion) return;

    let productos = obtenerProductos();
    productos = productos.filter(p => p.id !== productoEnEdicion);
    guardarProductosEnLocal(productos);

    cargarProductos();
    actualizarEstadisticas();
    cerrarModal();

    alert('✅ Producto eliminado correctamente');
});

// ==================== ESTADÍSTICAS ==================== 
function actualizarEstadisticas() {
    const productos = obtenerProductos();

    const totalProductos = productos.length;
    const productosEnStock = productos.filter(p => p.stock > 0).length;
    const productosSinStock = productos.filter(p => p.stock === 0).length;
    const valorTotal = productos.reduce((sum, p) => {
        const precioUnitario = p.descuento > 0 ? p.precioConDescuento : p.precio;
        return sum + (precioUnitario * p.stock);
    }, 0);

    document.getElementById('totalProductos').textContent = totalProductos;
    document.getElementById('productosEnStock').textContent = productosEnStock;
    document.getElementById('productosSinStock').textContent = productosSinStock;
    document.getElementById('valorTotal').textContent = "$" + formatearEstadistica(valorTotal);
}

// ==================== MENSAJES ==================== 
function mostrarMensajeExito() {
    const mensaje = document.getElementById('mensaje-exito');
    const error = document.getElementById('mensaje-error');
    
    error.style.display = 'none';
    mensaje.style.display = 'block';

    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 3000);
}

function mostrarMensajeError(texto) {
    const mensaje = document.getElementById('mensaje-error');
    const exito = document.getElementById('mensaje-exito');
    
    exito.style.display = 'none';
    mensaje.textContent = '❌ ' + texto;
    mensaje.style.display = 'block';

    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 3000);
}

// ==================== EXPORTAR PRODUCTOS COMO JSON ==================== 
function exportarProductos() {
    const productos = obtenerProductos();
    const dataStr = JSON.stringify(productos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'productos_' + new Date().toISOString().split('T')[0] + '.json';
    link.click();
}

// ==================== CARGAR DATOS DE EJEMPLO ==================== 
function cargarDatosEjemplo() {
    const productosEjemplo = [
        {
            id: 1,
            nombre: "Zapatillas Running Pro",
            descripcion: "Zapatillas premium para correr con tecnología de amortiguación avanzada. Diseñadas para máximo confort y rendimiento.",
            precio: 89.99,
            precioConDescuento: 64.99,
            descuento: 28,
            stock: 15,
            imagenes: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FF6B6B" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EZapatillas%3C/text%3E%3C/svg%3E'],
            imagenPrincipal: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FF6B6B" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EZapatillas%3C/text%3E%3C/svg%3E',
            fechaCreacion: new Date().toISOString()
        },
        {
            id: 2,
            nombre: "Malla Deportiva Mujer",
            descripcion: "Malla deportiva de alta calidad con tecnología de transpiración. Perfecta para yoga, fitness y entrenamientos.",
            precio: 34.99,
            precioConDescuento: 34.99,
            descuento: 0,
            stock: 25,
            imagenes: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%234ECDC4" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EMalla%3C/text%3E%3C/svg%3E'],
            imagenPrincipal: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%234ECDC4" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EMalla%3C/text%3E%3C/svg%3E',
            fechaCreacion: new Date().toISOString()
        }
    ];

    guardarProductosEnLocal(productosEjemplo);
    cargarProductos();
    actualizarEstadisticas();
    alert('✅ Datos de ejemplo cargados');
}
