// ==================== FUNCIONALIDAD DEL CARRITO ====================

/**
 * Carga y renderiza los productos del carrito
 */
function cargarCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const carritoContent = document.getElementById('carrito-items');
    const btnComprar = document.getElementById('btnComprarAhora');
    const resumenCarrito = document.getElementById('resumen-carrito');
    
    // Limpiar contenido
    carritoContent.innerHTML = '';
    
    if (carrito.length === 0) {
        // Carrito vacío
        carritoContent.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-icon">🛍️</div>
                <p>Tu carrito está vacío</p>
                <p style="font-size: 1rem; color: #888;">Agrega productos para comenzar a comprar</p>
                <button class="btn-volver" onclick="window.location.href='index.html'">
                    ← Volver a la tienda
                </button>
            </div>
        `;
        
        if (btnComprar) {
            btnComprar.style.display = 'none';
        }
        if (resumenCarrito) {
            resumenCarrito.style.display = 'none';
        }
        return;
    }
    
    // Mostrar productos del carrito
    let totalCarrito = 0;
    
    carrito.forEach((item, indice) => {
        const precioUnitario = item.precioConDescuento || item.precio;
        const precioTotal = precioUnitario * item.cantidad;
        totalCarrito += precioTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.innerHTML = `
            <div class="item-imagen">
                <img src="${item.imagen}" alt="${item.nombre}">
            </div>
            <div class="item-info">
                <h3>${item.nombre}</h3>
                <p class="item-precio">$${precioUnitario.toFixed(2).replace('.', ',')}</p>
                ${item.descuento > 0 ? `<p class="item-descuento">${item.descuento}% OFF</p>` : ''}
            </div>
            <div class="item-cantidad">
                <button class="btn-cantidad" onclick="cambiarCantidad(${indice}, -1)">-</button>
                <input type="number" class="input-cantidad" value="${item.cantidad}" min="1" onchange="cambiarCantidadDirecta(${indice}, this.value)">
                <button class="btn-cantidad" onclick="cambiarCantidad(${indice}, 1)">+</button>
            </div>
            <div class="item-total">
                <p class="total-precio">$${precioTotal.toFixed(2).replace('.', ',')}</p>
            </div>
            <button class="btn-eliminar" onclick="eliminarDelCarrito(${indice})" title="Eliminar del carrito">
                🗑️
            </button>
        `;
        carritoContent.appendChild(itemDiv);
    });
    
    // Mostrar resumen
    if (resumenCarrito) {
        resumenCarrito.style.display = 'block';
        document.getElementById('total-carrito').textContent = `$${totalCarrito.toFixed(2).replace('.', ',')}`;
    }
    
    // Mostrar botón comprar
    if (btnComprar) {
        btnComprar.style.display = 'block';
    }
}

/**
 * Cambia la cantidad de un producto en el carrito
 */
function cambiarCantidad(indice, cambio) {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    if (carrito[indice]) {
        const nuevaCantidad = carrito[indice].cantidad + cambio;
        
        if (nuevaCantidad <= 0) {
            carrito.splice(indice, 1);
        } else {
            carrito[indice].cantidad = nuevaCantidad;
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarCarrito();
    }
}

/**
 * Cambia la cantidad directamente al editar el input
 */
function cambiarCantidadDirecta(indice, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad) || 1;
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    if (carrito[indice]) {
        if (cantidad <= 0) {
            carrito.splice(indice, 1);
        } else {
            carrito[indice].cantidad = cantidad;
        }
        
        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarCarrito();
    }
}

/**
 * Elimina un producto del carrito
 */
function eliminarDelCarrito(indice) {
    if (confirm('¿Deseas eliminar este producto del carrito?')) {
        const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
        carrito.splice(indice, 1);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        cargarCarrito();
    }
}

/**
 * Vacía el carrito completamente
 */
function vaciarCarrito() {
    if (confirm('¿Deseas vaciar el carrito completamente?')) {
        localStorage.removeItem('carrito');
        cargarCarrito();
    }
}

// Cargar carrito cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarCarrito);
