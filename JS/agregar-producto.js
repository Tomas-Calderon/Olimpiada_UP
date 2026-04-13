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
    const imagenInput = document.getElementById('imagen');
    const imagenPreview = document.getElementById('imagenPreview');
    const btnAgregar = document.querySelector('.btn-agregar');

    // Preview de imagen
    imagenInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagenPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.innerHTML = '';
        }
    });

    // Validación y envío del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener valores
        const nombre = document.getElementById('nombre').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        const descripcion = document.getElementById('descripcion').value.trim();
        const stock = parseInt(document.getElementById('stock').value);
        const imagenFile = imagenInput.files[0];

        // Validaciones
        let errores = [];

        if (!nombre) {
            errores.push('El nombre es obligatorio.');
        }

        if (isNaN(precio) || precio <= 0) {
            errores.push('El precio debe ser un número positivo.');
        }

        if (!descripcion) {
            errores.push('La descripción es obligatoria.');
        }

        if (isNaN(stock) || stock < 0) {
            errores.push('La cantidad en stock debe ser un número entero no negativo.');
        }

        if (!imagenFile) {
            errores.push('Debe seleccionar una imagen.');
        } else {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedTypes.includes(imagenFile.type)) {
                errores.push('La imagen debe ser PNG o JPG.');
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

        // Convertir imagen a base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const imagenBase64 = e.target.result;

            // Crear objeto producto
            const producto = {
                id: 'custom_' + Date.now(),
                nombre: nombre,
                precio: precio,
                descripcion: descripcion,
                stock: stock,
                imagen: imagenBase64,
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
        };
        reader.readAsDataURL(imagenFile);
    });
});