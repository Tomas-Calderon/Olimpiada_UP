// ==================== FUNCIONALIDAD DE ADMINISTRAR CARACTERÍSTICAS ====================

let caracteristicaEnEdicion = null;
let caracteristicasListenerConfigurado = false;
let imagenCaracteristicaBase64 = null;

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'error') {
    const notification = document.getElementById('notification');
    notification.textContent = mensaje;
    notification.className = `notification ${tipo}`;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 4000);
}

// Función para comprimir imagen
function comprimirImagen(base64, callback) {
    const img = new Image();
    img.src = base64;
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const maxWidth = 100;
        const maxHeight = 100;
        let width = img.width;
        let height = img.height;

        // Calcular nuevas dimensiones manteniendo proporción
        if (width > height) {
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const base64Comprimido = canvas.toDataURL('image/jpeg', 0.8);
        callback(base64Comprimido);
    };
}

// Función para manejar la carga de imagen
function manejarCargaImagen(evento) {
    const file = evento.target.files[0];
    if (!file) {
        imagenCaracteristicaBase64 = null;
        document.getElementById('previewImagen').style.display = 'none';
        return;
    }

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Original = e.target.result;
            
            // Comprimir la imagen
            comprimirImagen(base64Original, (base64Comprimido) => {
                imagenCaracteristicaBase64 = base64Comprimido;
                
                // Mostrar preview
                const previewImg = document.getElementById('previewImg');
                previewImg.src = base64Comprimido;
                document.getElementById('previewImagen').style.display = 'block';
            });
        };
        reader.readAsDataURL(file);
    } else {
        mostrarNotificacion('Por favor selecciona un archivo de imagen válido', 'error');
        evento.target.value = '';
    }
}

// Cargar características desde localStorage
function cargarCaracteristicas() {
    const caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
    const container = document.getElementById('caracteristicasContainer');
    container.innerHTML = '';

    if (caracteristicas.length === 0) {
        container.innerHTML = '<p class="sin-caracteristicas">No hay características. ¡Crea una nueva!</p>';
        return;
    }

    caracteristicas.forEach(caracteristica => {
        const card = document.createElement('div');
        card.className = 'caracteristica-card';
        card.innerHTML = `
            <div class="caracteristica-info">
                <div class="caracteristica-icono">
                    <img src="${caracteristica.icono}" alt="${caracteristica.nombre}" style="width: 30px; height: 30px; object-fit: contain;">
                </div>
                <div class="caracteristica-detalles">
                    <h3>${caracteristica.nombre}</h3>
                    <p>ID: ${caracteristica.id}</p>
                </div>
            </div>
            <div class="caracteristica-acciones">
                <button class="btn-editar" data-id="${caracteristica.id}">Editar</button>
                <button class="btn-eliminar" data-id="${caracteristica.id}">Eliminar</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Abrir modal para agregar nueva característica
function abrirModalAgregar() {
    caracteristicaEnEdicion = null;
    document.getElementById('modalTitulo').textContent = 'Añadir Nueva Característica';
    document.getElementById('formCaracteristica').reset();
    document.getElementById('modalCaracteristica').style.display = 'flex';
}

// Abrir modal para editar característica
function editarCaracteristica(id) {
    const caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
    const caracteristica = caracteristicas.find(c => c.id === id);

    if (!caracteristica) {
        mostrarNotificacion('Característica no encontrada', 'error');
        return;
    }

    caracteristicaEnEdicion = id;
    document.getElementById('modalTitulo').textContent = 'Editar Característica';
    document.getElementById('nombreCaracteristica').value = caracteristica.nombre;
    
    // Mostrar imagen actual en preview
    imagenCaracteristicaBase64 = caracteristica.icono;
    const previewImg = document.getElementById('previewImg');
    previewImg.src = caracteristica.icono;
    document.getElementById('previewImagen').style.display = 'block';
    
    // Limpiar el input file
    document.getElementById('iconoCaracteristica').value = '';
    
    document.getElementById('modalCaracteristica').style.display = 'flex';
}

// Eliminar característica
function eliminarCaracteristica(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta característica?')) {
        return;
    }

    let caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
    caracteristicas = caracteristicas.filter(c => c.id !== id);
    localStorage.setItem('caracteristicas', JSON.stringify(caracteristicas));

    // Eliminar la característica de los productos que la tengan
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    productos.forEach(producto => {
        if (producto.caracteristicas && Array.isArray(producto.caracteristicas)) {
            producto.caracteristicas = producto.caracteristicas.filter(c => c !== id);
        }
    });
    localStorage.setItem('productos', JSON.stringify(productos));

    mostrarNotificacion('Característica eliminada correctamente', 'success');
    cargarCaracteristicas();
}

// Guardar característica (nueva o editada)
function guardarCaracteristica(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombreCaracteristica').value.trim();
    const icono = imagenCaracteristicaBase64;

    if (!nombre || !icono) {
        mostrarNotificacion('Por favor completa todos los campos', 'error');
        return;
    }

    let caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');

    if (caracteristicaEnEdicion) {
        // Editar característica existente
        const index = caracteristicas.findIndex(c => c.id === caracteristicaEnEdicion);
        if (index !== -1) {
            caracteristicas[index].nombre = nombre;
            caracteristicas[index].icono = icono;
        }
        mostrarNotificacion('Característica actualizada correctamente', 'success');
    } else {
        // Agregar nueva característica
        // Verificar que no exista con el mismo nombre
        if (caracteristicas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
            mostrarNotificacion('Ya existe una característica con este nombre', 'error');
            return;
        }

        const nuevaCaracteristica = {
            id: 'caracteristica_' + Date.now(),
            nombre: nombre,
            icono: icono
        };
        caracteristicas.push(nuevaCaracteristica);
        mostrarNotificacion('Característica creada correctamente', 'success');
    }

    localStorage.setItem('caracteristicas', JSON.stringify(caracteristicas));
    cerrarModal();
    cargarCaracteristicas();
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('modalCaracteristica').style.display = 'none';
    document.getElementById('formCaracteristica').reset();
    document.getElementById('previewImagen').style.display = 'none';
    imagenCaracteristicaBase64 = null;
    caracteristicaEnEdicion = null;
}

// Inicializar cuando carga el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Verificar permisos de admin
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual || sesionActual.role !== 'admin') {
        alert('Acceso denegado. Solo los administradores pueden administrar características.');
        window.location.href = 'index.html';
        return;
    }

    // Cargar características
    cargarCaracteristicas();

    // Configurar botones
    const btnAgregarCaracteristica = document.getElementById('btnAgregarCaracteristica');
    if (btnAgregarCaracteristica) {
        btnAgregarCaracteristica.addEventListener('click', abrirModalAgregar);
    }

    // Configurar form
    const formCaracteristica = document.getElementById('formCaracteristica');
    if (formCaracteristica) {
        formCaracteristica.addEventListener('submit', guardarCaracteristica);
    }

    // Configurar input de imagen
    const inputImagen = document.getElementById('iconoCaracteristica');
    if (inputImagen) {
        inputImagen.addEventListener('change', manejarCargaImagen);
    }

    // Delegar eventos de editar/eliminar una sola vez
    const container = document.getElementById('caracteristicasContainer');
    if (container && !caracteristicasListenerConfigurado) {
        container.addEventListener('click', (event) => {
            const editarBtn = event.target.closest('.btn-editar');
            const eliminarBtn = event.target.closest('.btn-eliminar');

            if (editarBtn) {
                const id = editarBtn.getAttribute('data-id');
                editarCaracteristica(id);
            }

            if (eliminarBtn) {
                const id = eliminarBtn.getAttribute('data-id');
                eliminarCaracteristica(id);
            }
        });
        caracteristicasListenerConfigurado = true;
    }

    // Configurar botón cancelar
    const btnCancelarModal = document.getElementById('btnCancelarModal');
    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModal);
    }

    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modalCaracteristica');
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });
});
