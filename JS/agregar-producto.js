1// ==================== FUNCIONALIDAD DE AGREGAR PRODUCTO ====================

// Función para mostrar notificaciones personalizadas
function mostrarNotificacion(mensaje, tipo = 'error') {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    // Auto-ocultar después de 4 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Variable global para almacenar la imagen
let imagenCargadaBase64 = null;

// ==================== FUNCIONES PARA CARACTERÍSTICAS ====================

function cargarCaracteristicas() {
    const caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
    const container = document.getElementById('caracteristicasContainer');
    container.innerHTML = '';

    if (caracteristicas.length === 0) {
        container.innerHTML = '<p style="color: #999;">No hay características creadas. Crea algunas en "Administrar Características"</p>';
        return;
    }

    caracteristicas.forEach(caracteristica => {
        const checkbox = document.createElement('label');
        checkbox.className = 'caracteristica-checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'caracteristica';
        input.value = caracteristica.id;
        input.dataset.nombre = caracteristica.nombre;

        const labelSpan = document.createElement('span');
        labelSpan.className = 'checkbox-label';

        if (caracteristica.icono && caracteristica.icono.startsWith('data:image')) {
            const iconImg = document.createElement('img');
            iconImg.src = caracteristica.icono;
            iconImg.alt = caracteristica.nombre;
            iconImg.className = 'checkbox-icono';
            labelSpan.appendChild(iconImg);
            labelSpan.appendChild(document.createTextNode(caracteristica.nombre));
        } else if (caracteristica.icono && (caracteristica.icono.startsWith('http') || caracteristica.icono.match(/\.(png|jpe?g|gif|svg)$/i))) {
            const iconImg = document.createElement('img');
            iconImg.src = caracteristica.icono;
            iconImg.alt = caracteristica.nombre;
            iconImg.className = 'checkbox-icono';
            labelSpan.appendChild(iconImg);
            labelSpan.appendChild(document.createTextNode(caracteristica.nombre));
        } else if (caracteristica.icono) {
            labelSpan.textContent = caracteristica.icono + ' ' + caracteristica.nombre;
        } else {
            labelSpan.textContent = caracteristica.nombre;
        }

        checkbox.appendChild(input);
        checkbox.appendChild(labelSpan);
        container.appendChild(checkbox);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // ==================== VERIFICAR PERMISOS DE ADMIN ====================
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual || sesionActual.role !== 'admin') {
        // Redirigir a index.html si no es admin
        alert('⚠️ Acceso denegado. Solo los administradores pueden agregar productos.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar características
    cargarCaracteristicas();

    const form = document.getElementById('productoForm');
    const precioInput = document.getElementById('precio');
    const stockInput = document.getElementById('stock');
    const descuentoInput = document.getElementById('descuento');
    const imagenesInput = document.getElementById('imagenes');
    const imagenesPreview = document.getElementById('imagenesPreview');
    const btnAgregar = document.querySelector('.btn-agregar');

    // VALIDACIÓN PRECIO EN TIEMPO REAL
    precioInput.addEventListener('input', function() {
        validarPrecio(this);
    });

    // VALIDACIÓN STOCK EN TIEMPO REAL
    stockInput.addEventListener('input', function() {
        validarStock(this);
    });

    // VALIDACIÓN DESCUENTO EN TIEMPO REAL
    descuentoInput.addEventListener('input', function() {
        validarDescuento(this);
    });

    // Preview de imágenes
    imagenesInput.addEventListener('change', mostrarPreviewsImagenes);

    // Validación y envío del formulario
    form.addEventListener('submit', guardarProducto);
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

// Función auxiliar para actualizar el contador de imágenes
function actualizarContadorImagenes() {
    const countDiv = document.getElementById('imagenesCount');
    const cantidad = imagenesCargadasBase64.length;
    
    if (cantidad === 0) {
        countDiv.textContent = '';
    } else if (cantidad === 1) {
        countDiv.textContent = '✓ 1 imagen cargada';
    } else {
        countDiv.textContent = `✓ ${cantidad} imágenes cargadas`;
    }
}

// Función para actualizar el estado visual del input de imágenes
function actualizarEstadoInputImagenes() {
    const inputImagenes = document.getElementById('imagenes');
    const countDiv = document.getElementById('imagenesCount');
    
    if (imagenCargadaBase64) {
        // Mostrar que el campo está completo
        inputImagenes.classList.add('completo');
        countDiv.innerHTML = `✓ Imagen cargada`;
    } else {
        inputImagenes.classList.remove('completo');
        countDiv.textContent = '';
    }
}

// Función auxiliar para redibujar el preview
function redibujarPreviews() {
    const preview = document.getElementById('imagenesPreview');
    preview.innerHTML = '';
    
    if (imagenCargadaBase64) {
        const div = document.createElement('div');
        div.className = 'preview-imagen image-principal';
        
        const img = document.createElement('img');
        img.src = imagenCargadaBase64;
        img.alt = 'Imagen del producto';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-eliminar-imagen';
        deleteBtn.textContent = '×';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            eliminarImagenPreview();
            return false;
        };
        
        div.appendChild(img);
        div.appendChild(deleteBtn);
        preview.appendChild(div);
    }
}

function mostrarPreviewsImagenes(evento) {
    const files = evento.target.files;
    
    if (!files || files.length === 0) {
        return;
    }

    const file = files[0];
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Original = e.target.result;
            
            // Comprimir la imagen
            comprimirImagen(base64Original, (base64Comprimido) => {
                // Guardar la imagen comprimida
                imagenCargadaBase64 = base64Comprimido;
                console.log('Imagen cargada y comprimida');
                
                // Redibujar preview
                redibujarPreviews();
                
                // Actualizar estado del input
                actualizarEstadoInputImagenes();
            });
        };
        reader.readAsDataURL(file);
    }
}

// Función para comprimir imagen
function comprimirImagen(base64, callback) {
    const img = new Image();
    img.src = base64;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 800;
        let width = img.width;
        let height = img.height;
        
        // Calcular nuevas dimensiones manteniendo aspecto
        if (width > height) {
            if (width > maxWidth) {
                height = height * (maxWidth / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = width * (maxHeight / height);
                height = maxHeight;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir a base64 con compresión (quality 0.7)
        const base64Comprimido = canvas.toDataURL('image/jpeg', 0.7);
        callback(base64Comprimido);
    };
}

function eliminarImagenPreview() {
    imagenCargadaBase64 = null;
    
    // Limpiar el input file
    document.getElementById('imagenes').value = '';
    
    // Redibujar previews
    redibujarPreviews();
    
    // Actualizar estado del input
    actualizarEstadoInputImagenes();
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
        mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
        return;
    }

    if (!imagenCargadaBase64) {
        mostrarNotificacion('Debes cargar una imagen', 'error');
        return;
    }

    // Validar nombre único
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    if (productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase())) {
        mostrarNotificacion('Este nombre de producto ya existe. Por favor elige otro.', 'error');
        return;
    }

    // Validar descuento
    if (descuento > 100) {
        mostrarNotificacion('El descuento no puede ser mayor a 100%', 'error');
        return;
    }

    // Obtener ID del creador desde la sesión actual
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    const creadorId = sesionActual ? sesionActual.usuarioId : null;

    // Calcular precio con descuento
    const precioConDescuento = descuento > 0 ? precio * (1 - descuento / 100) : precio;

    // Obtener características seleccionadas
    const checkboxes = document.querySelectorAll('input[name="caracteristica"]:checked');
    const caracteristicasSeleccionadas = Array.from(checkboxes).map(cb => ({
        id: cb.value,
        nombre: cb.getAttribute('data-nombre')
    }));

    // Crear producto
    const nuevoProducto = {
        id: 'custom_' + Date.now(),
        nombre,
        descripcion,
        precio: parseFloat(precio.toFixed(2)),
        precioConDescuento: parseFloat(precioConDescuento.toFixed(2)),
        descuento,
        stock,
        imagenes: [imagenCargadaBase64],
        imagen: imagenCargadaBase64,
        imagenPrincipal: imagenCargadaBase64,
        tipo: 'Novedad',
        fechaCreacion: new Date().toISOString(),
        creadorId: creadorId,
        caracteristicas: caracteristicasSeleccionadas
    };

    // Guardar en localStorage
    try {
        productos.push(nuevoProducto);
        localStorage.setItem('productos', JSON.stringify(productos));
        console.log('Producto guardado:', nuevoProducto);
    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarNotificacion('Error al guardar el producto. localStorage lleno o error desconocido.', 'error');
        return;
    }

    // Mostrar éxito
    mostrarNotificacion('Producto agregado exitosamente.', 'success');
    document.getElementById('productoForm').reset();
    document.getElementById('imagenesPreview').innerHTML = '';
    document.getElementById('imagenesCount').textContent = '';
    document.getElementById('imagenes').classList.remove('completo');
    imagenCargadaBase64 = null; // Limpiar imagen

    // Redirigir después de 1.5 segundos
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}