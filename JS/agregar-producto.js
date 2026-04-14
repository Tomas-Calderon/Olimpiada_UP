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
    const imagenesInput = document.getElementById('imagenes');
    const imagenesPreview = document.getElementById('imagenesPreview');
    const btnAgregar = document.querySelector('.btn-agregar');

    let imagenesFiles = []; // Array de File objects

    // Preview de imágenes
    imagenesInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        imagenesFiles = files;
        renderPreviews();
    });

    function renderPreviews() {
        imagenesPreview.innerHTML = '';
        imagenesFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'imagen-item';
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
                imgDiv.appendChild(star);
                imgDiv.appendChild(img);
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
        const precio = document.getElementById('precio').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const stock = document.getElementById('stock').value.trim();
        const descuento = document.getElementById('descuento').value.trim();
        const imagenesFiles = Array.from(imagenesInput.files);

        // Validaciones
        let errores = [];

        if (!nombre || nombre.length > 50) {
            errores.push('El nombre es obligatorio y no puede superar 50 caracteres.');
        }

        const precioRegex = /^\d+(\.\d{1,2})?$/;
        if (!precio || precio.length > 15 || !precioRegex.test(precio) || parseFloat(precio) <= 0) {
            errores.push('El precio debe ser un número positivo con máximo 2 decimales y 15 caracteres.');
        }

        if (!descripcion || descripcion.length > 300) {
            errores.push('La descripción es obligatoria y no puede superar 300 caracteres.');
        }

        if (!stock || isNaN(stock) || parseInt(stock) < 0 || stock.includes('.') || stock.length > 15) {
            errores.push('La cantidad en stock debe ser un número entero no negativo, sin decimales y máximo 15 caracteres.');
        }

        if (!descuento || isNaN(descuento) || parseInt(descuento) < 0 || parseInt(descuento) > 100 || descuento.includes('.') || descuento.includes(/[^0-9]/)) {
            errores.push('El descuento debe ser un número entero entre 0 y 100, sin decimales ni caracteres especiales.');
        }

        if (imagenesFiles.length < 1) {
            errores.push('Debe seleccionar al menos una imagen.');
        } else {
            for (let file of imagenesFiles) {
                if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
                    errores.push('Todas las imágenes deben ser PNG o JPG.');
                    break;
                }
            }
        }

        if (errores.length > 0) {
            mostrarNotificacion(errores[0], 'error');
            return;
        }

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

        // Convertir imágenes a base64
        let imagenesBase64 = [];
        let filesProcessed = 0;

        for (let i = 0; i < imagenesFiles.length; i++) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagenesBase64.push(e.target.result);
                filesProcessed++;
                if (filesProcessed === imagenesFiles.length) {
                    crearProducto(imagenesBase64);
                }
            };
            reader.readAsDataURL(imagenesFiles[i]);
        }
    });

    function crearProducto(imagenesBase64) {
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