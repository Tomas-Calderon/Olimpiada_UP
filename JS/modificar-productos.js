// ==================== FUNCIONALIDAD DE MODIFICAR PRODUCTOS ====================

document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();

    function cargarProductos() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];
        const lista = document.getElementById('productos-lista');
        lista.innerHTML = '';

        productos.forEach(producto => {
            const productoDiv = document.createElement('div');
            productoDiv.className = 'producto-modificar';
            productoDiv.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img-modificar">
                <div class="producto-info">
                    <h3>${producto.nombre}</h3>
                    <p>Precio: $${producto.precio.toFixed(2)}</p>
                    <p>Stock: ${producto.stock}</p>
                    <p>Descuento: ${producto.descuento}%</p>
                </div>
                <button class="btn-editar" data-id="${producto.id}">Editar</button>
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
                    <input type="text" id="editPrecio" value="${producto.precio}" pattern="^\\d+(\\.\\d{1,2})?$" required>
                    
                    <label>Descripción:</label>
                    <textarea id="editDescripcion" maxlength="300" required>${producto.descripcion}</textarea>
                    
                    <label>Stock:</label>
                    <input type="number" id="editStock" value="${producto.stock}" min="0" required>
                    
                    <label>Descuento (%):</label>
                    <input type="number" id="editDescuento" value="${producto.descuento}" min="0" max="100" required>
                    
                    <button type="submit">Guardar Cambios</button>
                    <button type="button" id="cancelarEditar">Cancelar</button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

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

            // Validaciones similares
            if (!nuevoNombre || nuevoNombre.length > 50) {
                alert('Nombre inválido.');
                return;
            }
            const precioRegex = /^\d+(\.\d{1,2})?$/;
            if (!nuevoPrecio || !precioRegex.test(nuevoPrecio) || parseFloat(nuevoPrecio) <= 0) {
                alert('Precio inválido.');
                return;
            }
            if (!nuevaDescripcion || nuevaDescripcion.length > 300) {
                alert('Descripción inválida.');
                return;
            }
            if (!nuevoStock || isNaN(nuevoStock) || parseInt(nuevoStock) < 0 || nuevoStock.includes('.')) {
                alert('Stock inválido.');
                return;
            }
            if (!nuevoDescuento || isNaN(nuevoDescuento) || parseInt(nuevoDescuento) < 0 || parseInt(nuevoDescuento) > 100 || nuevoDescuento.includes('.')) {
                alert('Descuento inválido.');
                return;
            }

            // Actualizar producto
            producto.nombre = nuevoNombre;
            producto.precio = parseFloat(nuevoPrecio);
            producto.descripcion = nuevaDescripcion;
            producto.stock = parseInt(nuevoStock);
            producto.descuento = parseInt(nuevoDescuento);

            localStorage.setItem('productos', JSON.stringify(productos));
            document.body.removeChild(modal);
            cargarProductos(); // Recargar lista
            alert('Producto actualizado.');
        });
    }
});