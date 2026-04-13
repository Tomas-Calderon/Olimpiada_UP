// ==================== CONFIGURACIÓN ==================== 
const ADMIN_PASSWORD = "admin123"; // En producción, usar autenticación segura
let productoEnEdicion = null;

// ==================== INICIALIZACIÓN ==================== 
document.addEventListener('DOMContentLoaded', () => {
    verificarAutenticacion();
    inicializarEventos();
    cargarProductos();
    actualizarEstadisticas();
});

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
    preview.innerHTML = '';

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const div = document.createElement('div');
                div.className = 'preview-imagen';
                div.innerHTML = `
                    <img src="${e.target.result}" alt="">
                    <button type="button" class="btn-eliminar-imagen" onclick="this.parentElement.remove()">×</button>
                `;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });

    // Limpiar mensaje de error
    document.getElementById('error-imagenes').textContent = '';
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
    const precioAnterior = document.getElementById('precioAnterior').value 
        ? parseFloat(document.getElementById('precioAnterior').value) 
        : null;
    const stock = parseInt(document.getElementById('stock').value);
    const imagenes = document.getElementById('imagenes').files;

    // Validación
    if (!nombre || !descripcion || !precio || !stock || imagenes.length === 0) {
        mostrarMensajeError('Por favor completa todos los campos requeridos');
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

    // Procesar imágenes
    procesarImagenes(imagenes, (imagenesBase64) => {
        if (!imagenesBase64 || imagenesBase64.length === 0) {
            mostrarMensajeError('Error al procesar las imágenes');
            return;
        }

        // Crear producto
        const nuevoProducto = {
            id: Date.now(),
            nombre,
            descripcion,
            precio,
            precioAnterior,
            stock,
            imagenes: imagenesBase64,
            fechaCreacion: new Date().toISOString()
        };

        // Guardar en localStorage
        productos.push(nuevoProducto);
        guardarProductosEnLocal(productos);

        // Mostrar éxito
        mostrarMensajeExito();
        document.getElementById('formularioProducto').reset();
        document.getElementById('imagenesPreview').innerHTML = '';

        // Actualizar lista y estadísticas
        cargarProductos();
        actualizarEstadisticas();

        // Cambiar a sección de gestión automáticamente
        setTimeout(() => {
            document.querySelector('[data-section="productos"]').click();
        }, 2000);
    });
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
        
        const primeraImagen = producto.imagenes[0] || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999" font-size="18"%3ESin imagen%3C/text%3E%3C/svg%3E';

        card.innerHTML = `
            <img src="${primeraImagen}" alt="${producto.nombre}" class="producto-admin-imagen">
            <div class="producto-admin-info">
                <h3>${producto.nombre}</h3>
                <p>${producto.descripcion.substring(0, 100)}...</p>
                <div class="producto-admin-precio">$${producto.precio.toFixed(2)}</div>
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

    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editDescripcion').value = producto.descripcion;
    document.getElementById('editPrecio').value = producto.precio;
    document.getElementById('editStock').value = producto.stock;

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

    // Actualizar producto
    productos[indice].nombre = nombreNuevo;
    productos[indice].descripcion = document.getElementById('editDescripcion').value.trim();
    productos[indice].precio = parseFloat(document.getElementById('editPrecio').value);
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
    const valorTotal = productos.reduce((sum, p) => sum + (p.precio * p.stock), 0);

    document.getElementById('totalProductos').textContent = totalProductos;
    document.getElementById('productosEnStock').textContent = productosEnStock;
    document.getElementById('productosSinStock').textContent = productosSinStock;
    document.getElementById('valorTotal').textContent = '$' + valorTotal.toFixed(2);
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
            precioAnterior: 129.99,
            stock: 15,
            imagenes: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FF6B6B" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EZapatillas%3C/text%3E%3C/svg%3E'],
            fechaCreacion: new Date().toISOString()
        },
        {
            id: 2,
            nombre: "Malla Deportiva Mujer",
            descripcion: "Malla deportiva de alta calidad con tecnología de transpiración. Perfecta para yoga, fitness y entrenamientos.",
            precio: 34.99,
            precioAnterior: null,
            stock: 25,
            imagenes: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%234ECDC4" width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="white" font-size="24"%3EMalla%3C/text%3E%3C/svg%3E'],
            fechaCreacion: new Date().toISOString()
        }
    ];

    guardarProductosEnLocal(productosEjemplo);
    cargarProductos();
    actualizarEstadisticas();
    alert('✅ Datos de ejemplo cargados');
}
