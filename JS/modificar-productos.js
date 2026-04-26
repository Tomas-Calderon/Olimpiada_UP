// ==================== FUNCIONALIDAD DE MODIFICAR PRODUCTOS ====================

document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (!sesionActual) {
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = 'main.html';
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
                    
                    <button type="submit">Guardar Cambios</button>
                    <button type="button" id="cancelarEditar">Cancelar</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

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