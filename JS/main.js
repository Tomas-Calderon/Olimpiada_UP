// Toggle del menú en dispositivos móviles
const menuToggle = document.getElementById('menuToggle');
const headerNav = document.getElementById('headerNav');

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    headerNav.classList.toggle('active');
});

// Cerrar menú al hacer clic en un botón
const buttons = document.querySelectorAll('.header-der button');
buttons.forEach(button => {
    button.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('active');
    });
});

// Cerrar menú al hacer resize si vuelve a resolución desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menuToggle.classList.remove('active');
        headerNav.classList.remove('active');
    }
});

// ==================== FUNCIONALIDAD DE PRODUCTOS ====================
// Mapeo de productos por nombre
const productosMapping = {
    'Producto 1': 'producto1',
    'Producto 2': 'producto2',
    'Producto 3': 'producto3',
    'Producto 4': 'producto4',
    'Producto 5': 'producto5',
    'Oferta 1': 'oferta1',
    'Oferta 2': 'oferta2',
    'Oferta 3': 'oferta3',
    'Oferta 4': 'oferta4',
    'Oferta 5': 'oferta5',
    'Novedad 1': 'novedad1',
    'Novedad 2': 'novedad2',
    'Novedad 3': 'novedad3',
    'Novedad 4': 'novedad4',
    'Novedad 5': 'novedad5'
};

// Agregar event listeners a los productos
document.addEventListener('DOMContentLoaded', () => {
    const productos = document.querySelectorAll('.producto');
    
    productos.forEach(producto => {
        producto.style.cursor = 'pointer';
        producto.addEventListener('click', () => {
            const nombreProducto = producto.querySelector('.producto-nombre').textContent;
            const idProducto = productosMapping[nombreProducto];
            
            if (idProducto) {
                window.location.href = `producto.html?id=${idProducto}`;
            }
        });
    });
});
