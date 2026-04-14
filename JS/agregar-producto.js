// ==================== FUNCIONALIDAD DE AGREGAR PRODUCTO ====================

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

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('productoForm');
    const precioInput = document.getElementById('precio');
    const stockInput = document.getElementById('stock');
    const descuentoInput = document.getElementById('descuento');
    const imagenesInput = document.getElementById('imagenes');
    const imagenesPreview = document.getElementById('imagenesPreview');
    const btnAgregar = document.querySelector('.btn-agregar');

    let imagenesFiles = []; // Array de File objects

    // VALIDACIÓN PRECIO EN TIEMPO REAL
    precioInput.addEventListener('input', (e) => {
        let valor = e.target.value;
        // Solo permitir números y coma
        valor = valor.replace(/[^0-9,]/g, '');
        // Solo una coma
        if ((valor.match(/,/g) || []).length > 1) {
            valor = valor.substring(0, valor.lastIndexOf(','));
        }
        // Máximo 2 decimales
        if (valor.includes(',')) {
            const partes = valor.split(',');
            if (partes[1].length > 2) {
                valor = partes[0] + ',' + partes[1].substring(0, 2);
            }
        }
        e.target.value = valor;
    });

    // VALIDACIÓN STOCK EN TIEMPO REAL
    stockInput.addEventListener('input', (e) => {
        let valor = e.target.value;
        // Solo números
        valor = valor.replace(/[^0-9]/g, '');
        // Máximo 15 dígitos
        if (valor.length > 15) {
            valor = valor.substring(0, 15);
        }
        e.target.value = valor;
    });

    // VALIDACIÓN DESCUENTO EN TIEMPO REAL
    descuentoInput.addEventListener('input', (e) => {
        let valor = e.target.value;
        // Solo números
        valor = valor.replace(/[^0-9]/g, '');
        // Máximo 100
        if (parseInt(valor) > 100) {
            valor = '100';
        }
        e.target.value = valor;
    });

    // Preview de imágenes
    imagenesInput.addEventListener('change', (e) => {
        const newFiles = Array.from(e.target.files);
        
        // Agregar nuevos archivos al array existente
        imagenesFiles = [...imagenesFiles, ...newFiles];
        
        // Limitar a máximo 5 imágenes
        if (imagenesFiles.length > 5) {
            imagenesFiles = imagenesFiles.slice(0, 5);
            mostrarNotificacion('Máximo 5 imágenes permitidas. Se han limitado a 5.', 'error');
        }
        
        renderPreviews();
        // Limpiar el input para permitir seleccionar nuevamente
        imagenesInput.value = '';
    });

    function renderPreviews() {
        imagenesPreview.innerHTML = '';
        imagenesFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'imagen-item';
                imgDiv.style.position = 'relative';
                const starColor = index === 0 ? 'gold' : 'green';
                const star = document.createElement('span');
                star.className = 'star';
                star.textContent = '★';
                star.style.color = starColor;
                star.style.cursor = index !== 0 ? 'pointer' : 'default';
                if (index !== 0) {
                    star.addEventListener('click', () => {
                        // Intercambiar con la primera
                        [imagenesFiles[0], imagenesFiles[index]] = [imagenesFiles[index], imagenesFiles[0]];
                        renderPreviews();
                    });
                }
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = `Imagen ${index + 1}`;
                
                // Botón para eliminar imagen
                const deleteBtn = document.createElement('button');
                deleteBtn.type = 'button';
                deleteBtn.textContent = '✕';
                deleteBtn.style.position = 'absolute';
                deleteBtn.style.top = '5px';
                deleteBtn.style.left = '5px';
                deleteBtn.style.cursor = 'pointer';
                deleteBtn.style.background = 'rgba(255, 0, 0, 0.8)';
                deleteBtn.style.color = 'white';
                deleteBtn.style.border = 'none';
                deleteBtn.style.width = '25px';
                deleteBtn.style.height = '25px';
                deleteBtn.style.borderRadius = '50%';
                deleteBtn.style.fontSize = '16px';
                deleteBtn.style.padding = '0';
                deleteBtn.addEventListener('click', () => {
                    imagenesFiles.splice(index, 1);
                    renderPreviews();
                });
                
                imgDiv.appendChild(star);
                imgDiv.appendChild(img);
                imgDiv.appendChild(deleteBtn);
                imagenesPreview.appendChild(imgDiv);
            };
            reader.readAsDataURL(file);
        });
    }

    // Validación y envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener valores
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const imagenesFilesArray = Array.from(imagenesInput.files);

        // Verificar si el producto ya existe
        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        const productoExiste = productos.some(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        
        if (productoExiste) {
            mostrarNotificacion('Error: Ya existe un producto con ese nombre.', 'error');
            return;
        }

        // Deshabilitar botón mientras procesa
        btnAgregar.disabled = true;
        btnAgregar.textContent = 'Agregando...';

        const precio = parseFloat(precioInput.value.replace(',', '.'));
        const stock = parseInt(stockInput.value);
        const descuento = parseInt(descuentoInput.value) || 0;

        // Convertir imágenes a base64
        let imagenesBase64 = [];
        let filesProcessed = 0;

        for (let i = 0; i < imagenesFilesArray.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagenesBase64.push(e.target.result);
                filesProcessed++;
                if (filesProcessed === imagenesFilesArray.length) {
                    crearProducto(nombre, precio, descripcion, stock, descuento, imagenesBase64);
                }
            };
            reader.readAsDataURL(imagenesFilesArray[i]);
        }
    });

    function crearProducto(nombre, precio, descripcion, stock, descuento, imagenesBase64) {
        // Crear objeto producto
        const producto = {
            id: 'custom_' + Date.now(),
            nombre: nombre,
            precio: parseFloat(precio),
            descripcion: descripcion,
            stock: parseInt(stock),
            descuento: parseInt(descuento),
            imagen: imagenesBase64[0], // Primera es principal
            imagenesAdicionales: imagenesBase64.slice(1), // Resto adicionales
            tipo: 'Novedad' // Todos los nuevos productos van a Novedades y Recomendados
        };

        // Guardar en localStorage
        let productosActualizados = JSON.parse(localStorage.getItem('productos')) || [];
        productosActualizados.push(producto);
        localStorage.setItem('productos', JSON.stringify(productosActualizados));

        // Mostrar notificación de éxito
        mostrarNotificacion('Producto agregado exitosamente.', 'success');

        // Redirigir después de 1.5 segundos
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 1500);
    }
});