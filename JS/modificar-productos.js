// ==================== FUNCIONALIDAD DE MODIFICAR PRODUCTOS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (!sesionActual) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'index.html';
        return;
    }

    cargarProductos();

    function cargarProductos() {
        const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
        const productosTodos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Filtrar solo los productos del usuario actual
        const productos = productosTodos.filter(p => p.creadorId === sesionActual.usuarioId);
        
        const lista = document.getElementById('productos-lista');
        lista.innerHTML = '';

        if (productos.length === 0) {
            lista.innerHTML = '<p class="sin-productos">No has creado ningún producto aún.</p>';
            return;
        }

        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto-modificar';
            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img-modificar">
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${producto.precio.toFixed(2).replace('.', ',')}</p>
                    <p>Stock: ${producto.stock}</p>
                    <p>Descuento: ${producto.descuento}%</p>
                </div>
                <button class="btn-editar" data-id="${producto.id}">Editar</button>
                <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
            `;
            lista.appendChild(productoDiv);
        });

        // Agregar event listeners a botones editar
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                editarProducto(id);
            });
        });

        // Agregar event listeners a botones eliminar
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
                    eliminarProducto(id);
                }
            });
        });
    }

    function editarProducto(id) {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const producto = productos.find(p => p.id === id);
        if (!producto) return;

        // Crear modal de edición
        const modal = document.createElement('div');
        modal.className = 'modal-editar';
        modal.innerHTML = `
            <div class="modal-content-editar">
                <h2>Editar Producto</h2>
                <form id="editarForm">
                    <label>Nombre:</label>
                    <input type="text" id="editNombre" value="${producto.nombre}" maxlength="50" required>
                    
                    <label>Precio:</label>
                    <input type="text" id="editPrecio" value="${producto.precio.toString().replace('.', ',')}" required>
                    
                    <label>Descripción:</label>
                    <textarea id="editDescripcion" maxlength="300" required>${producto.descripcion}</textarea>
                    
                    <label>Stock:</label>
                    <input type="text" id="editStock" value="${producto.stock}" required>
                    
                    <label>Descuento (%):</label>
                    <input type="text" id="editDescuento" value="${producto.descuento}">

                    <label>Características:</label>
                    <div class="caracteristicas-editar" id="caracteristicasEditarContainer"></div>
                    
                    <div class="crear-caracteristica-section-modal">
                        <h4>Agregar Nueva Característica</h4>
                        <div class="crear-caracteristica-form-modal">
                            <input type="text" id="nuevaCaracteristicaNombreModal" placeholder="Nombre" maxlength="30">
                            <input type="text" id="nuevaCaracteristicaIconoModal" placeholder="Emoji (ej: 🔥)" maxlength="5">
                            <button type="button" id="btnAgregarCaracteristicaModal" class="btn-agregar-caracteristica-modal">Agregar</button>
                        </div>
                    </div>
                    
                    <button type="submit">Guardar Cambios</button>
                    <button type="button" id="cancelarEditar">Cancelar</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

        const caracteristicasDisponibles = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
        const caracteristicasSeleccionadas = (producto.caracteristicas || []).map(c => typeof c === 'string' ? c : c.id);
        const caracteristicasEditarContainer = document.getElementById('caracteristicasEditarContainer');
        
        // Función local para recargar características en el modal
        const recargarCaracteristicasModal = () => {
            const caracteristicasActualizadas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
            if (caracteristicasEditarContainer) {
                if (caracteristicasActualizadas.length === 0) {
                    caracteristicasEditarContainer.innerHTML = '<p class="sin-caracteristicas">No hay características disponibles.</p>';
                } else {
                    caracteristicasEditarContainer.innerHTML = caracteristicasActualizadas.map(caracteristica => {
                        const seleccionado = caracteristicasSeleccionadas.includes(caracteristica.id) ? 'seleccionada' : '';
                        const esImagen = caracteristica.icono && (caracteristica.icono.startsWith('data:image') || caracteristica.icono.startsWith('http') || caracteristica.icono.match(/\.(png|jpe?g|gif|svg)$/i));
                        const iconHtml = esImagen
                            ? `<img src="${caracteristica.icono}" alt="${caracteristica.nombre}" class="caracteristica-icono">`
                            : caracteristica.icono
                                ? `<span>${caracteristica.icono}</span>`
                                : '';
                        const nombreHtml = esImagen ? '' : `<span>${caracteristica.nombre}</span>`;
                        
                        return `
                            <button type="button" class="caracteristica-boton-editar ${seleccionado}" data-id="${caracteristica.id}" data-nombre="${caracteristica.nombre}">
                                <span class="caracteristica-contenido-editar">
                                    ${iconHtml}
                                    ${nombreHtml}
                                </span>
                            </button>
                        `;
                    }).join('');

                    caracteristicasEditarContainer.querySelectorAll('.caracteristica-boton-editar').forEach(boton => {
                        boton.addEventListener('click', () => {
                            boton.classList.toggle('seleccionada');
                        });
                    });
                }
            }
        };
        
        // Cargar características inicialmente
        recargarCaracteristicasModal();

        // Evento para agregar nueva característica en el modal
        const btnAgregarCaracteristicaModal = document.getElementById('btnAgregarCaracteristicaModal');
        if (btnAgregarCaracteristicaModal) {
            btnAgregarCaracteristicaModal.addEventListener('click', (e) => {
                e.preventDefault();
                const nombreInput = document.getElementById('nuevaCaracteristicaNombreModal');
                const iconoInput = document.getElementById('nuevaCaracteristicaIconoModal');
                
                const nombre = nombreInput.value.trim();
                const icono = iconoInput.value.trim();
                
                if (!nombre) {
                    alert('Por favor ingresa un nombre para la característica');
                    return;
                }
                
                if (!icono) {
                    alert('Por favor ingresa una URL de imagen para el icono');
                    return;
                }
                
                // Validar que el icono sea una imagen (URL o data:image)
                const esImagenValida = icono.startsWith('data:image') || 
                                       icono.startsWith('http://') || 
                                       icono.startsWith('https://') || 
                                       icono.match(/\.(png|jpe?g|gif|svg|webp)$/i);
                
                if (!esImagenValida) {
                    alert('El icono debe ser una URL de imagen válida (PNG, JPG, GIF, SVG, WEBP)');
                    return;
                }
                
                let caracteristicas = JSON.parse(localStorage.getItem('caracteristicas') || '[]');
                
                if (caracteristicas.some(c => c.nombre.toLowerCase() === nombre.toLowerCase())) {
                    alert('Esta característica ya existe');
                    return;
                }
                
                const nuevaCaracteristica = {
                    id: 'caracteristica_' + Date.now(),
                    nombre: nombre,
                    icono: icono
                };
                
                caracteristicas.push(nuevaCaracteristica);
                localStorage.setItem('caracteristicas', JSON.stringify(caracteristicas));
                
                nombreInput.value = '';
                iconoInput.value = '';
                
                // Recargar características en el modal
                recargarCaracteristicasModal();
                
                // Seleccionar automáticamente la nueva característica
                setTimeout(() => {
                    const nuevoBoton = document.querySelector(`[data-id="${nuevaCaracteristica.id}"]`);
                    if (nuevoBoton) {
                        nuevoBoton.classList.add('seleccionada');
                        // Actualizar array de seleccionadas
                        caracteristicasSeleccionadas.push(nuevaCaracteristica.id);
                    }
                }, 50);
                
                alert('✓ Característica agregada exitosamente');
            });
        }

        const editPrecio = document.getElementById('editPrecio');
        const editStock = document.getElementById('editStock');
        const editDescuento = document.getElementById('editDescuento');

        // VALIDACIÓN PRECIO EN TIEMPO REAL
        editPrecio.addEventListener('input', (e) => {
            let valor = e.target.value;
            valor = valor.replace(/[^0-9,]/g, '');
            if ((valor.match(/,/g) || []).length > 1) {
                valor = valor.substring(0, valor.lastIndexOf(','));
            }
            if (valor.includes(',')) {
                const partes = valor.split(',');
                if (partes[1].length > 2) {
                    valor = partes[0] + ',' + partes[1].substring(0, 2);
                }
            }
            e.target.value = valor;
        });

        // VALIDACIÓN STOCK EN TIEMPO REAL
        editStock.addEventListener('input', (e) => {
            let valor = e.target.value;
            valor = valor.replace(/[^0-9]/g, '');
            if (valor.length > 15) {
                valor = valor.substring(0, 15);
            }
            e.target.value = valor;
        });

        // VALIDACIÓN DESCUENTO EN TIEMPO REAL
        editDescuento.addEventListener('input', (e) => {
            let valor = e.target.value;
            valor = valor.replace(/[^0-9]/g, '');
            if (parseInt(valor) > 100) {
                valor = '100';
            }
            e.target.value = valor;
        });

        // Event listener para cancelar
        document.getElementById('cancelarEditar').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        // Event listener para guardar
        document.getElementById('editarForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const nuevoNombre = document.getElementById('editNombre').value.trim();
            const nuevoPrecio = document.getElementById('editPrecio').value.trim();
            const nuevaDescripcion = document.getElementById('editDescripcion').value.trim();
            const nuevoStock = document.getElementById('editStock').value.trim();
            const nuevoDescuento = document.getElementById('editDescuento').value.trim();
            const caracteristicasSeleccionadasEditar = Array.from(document.querySelectorAll('.caracteristica-boton-editar.seleccionada')).map(boton => ({
                id: boton.dataset.id,
                nombre: boton.dataset.nombre
            }));

            // Validaciones simples
            if (!nuevoNombre) {
                alert('Nombre es obligatorio.');
                return;
            }
            if (!nuevaDescripcion) {
                alert('Descripción es obligatoria.');
                return;
            }

            // Actualizar producto
            producto.nombre = nuevoNombre;
            producto.precio = parseFloat(nuevoPrecio.replace(',', '.'));
            producto.descripcion = nuevaDescripcion;
            producto.stock = parseInt(nuevoStock);
            producto.descuento = parseInt(nuevoDescuento) || 0;
            producto.caracteristicas = caracteristicasSeleccionadasEditar;

            localStorage.setItem('productos', JSON.stringify(productos));
            document.body.removeChild(modal);
            cargarProductos(); // Recargar lista
            alert('Producto actualizado.');
        });
    }

    function eliminarProducto(id) {
        const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Verificar que el producto pertenece al usuario actual
        const producto = productos.find(p => p.id === id);
        if (!producto || producto.creadorId !== sesionActual.usuarioId) {
            alert('No tienes permiso para eliminar este producto.');
            return;
        }
        
        productos = productos.filter(p => p.id !== id);
        localStorage.setItem('productos', JSON.stringify(productos));
        cargarProductos();
        alert('Producto eliminado.');
    }
});