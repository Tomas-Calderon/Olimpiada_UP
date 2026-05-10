// ==================== CARGAR FAVORITOS ====================

let favoritosCargados = [];

function cargarFavoritos() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    // Si no hay sesión, redirigir a login
    if (!sesionActual) {
        alert('Debes iniciar sesión para ver tus favoritos');
        window.location.href = 'iniciar-sesion.html';
        return;
    }
    
    // Obtener favoritos del usuario
    const claveFavoritos = `favoritos_${sesionActual.usuarioId}`;
    favoritosCargados = JSON.parse(localStorage.getItem(claveFavoritos) || '[]');
    
    renderizarFavoritos();
}

// ==================== RENDERIZAR FAVORITOS ====================

function renderizarFavoritos() {
    const productosGrid = document.getElementById('productosGrid');
    const sinFavoritos = document.getElementById('sinFavoritos');
    
    if (favoritosCargados.length === 0) {
        productosGrid.style.display = 'none';
        sinFavoritos.style.display = 'block';
        return;
    }
    
    productosGrid.style.display = 'grid';
    sinFavoritos.style.display = 'none';
    productosGrid.innerHTML = '';
    
    favoritosCargados.forEach(favorito => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        
        let precioMostrado = favorito.precio;
        let precioOriginal = '';
        
        if (favorito.descuento && favorito.descuento > 0) {
            precioMostrado = favorito.precio * (1 - favorito.descuento / 100);
            precioOriginal = `<p class="precio-anterior">$${favorito.precio.toFixed(2).replace('.', ',')}</p>`;
        }
        
        productoDiv.innerHTML = `
            <img src="${favorito.imagen}" alt="${favorito.nombre}" class="producto-img">
            <h3 class="producto-nombre">${favorito.nombre}</h3>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                ${precioOriginal}
                <p class="producto-precio" style="margin: 0;">$${precioMostrado.toFixed(2).replace('.', ',')}</p>
            </div>
        `;
        
        // Determinar la ruta correcta según la ubicación actual
        const currentPath = window.location.pathname;
        const rutaProducto = currentPath.includes('/html/') ? 'producto.html' : 'html/producto.html';
        
        productoDiv.addEventListener('click', () => {
            window.location.href = `${rutaProducto}?id=${favorito.id}`;
        });
        
        productosGrid.appendChild(productoDiv);
    });
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    cargarFavoritos();
});
