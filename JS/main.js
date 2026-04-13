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
// Agregar event listeners a los productos
document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
});

function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];

    // Limpiar secciones
    const recomendadosLista = document.querySelector('.productos-section:nth-of-type(1) .productos-lista');
    const ofertasLista = document.querySelector('.productos-section:nth-of-type(2) .productos-lista');
    const novedadesLista = document.querySelector('.productos-section:nth-of-type(3) .productos-lista');

    recomendadosLista.innerHTML = '';
    ofertasLista.innerHTML = '';
    novedadesLista.innerHTML = '';

    productos.forEach(producto => {
        // Crear elemento producto
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.style.cursor = 'pointer';
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">$${producto.precio.toFixed(2)}</p>
        `;

        // Event listener para click
        productoDiv.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });

        // Agregar a Recomendados y Novedades
        recomendadosLista.appendChild(productoDiv.cloneNode(true));
        novedadesLista.appendChild(productoDiv.cloneNode(true));

        // Re-agregar event listeners a los clones
        recomendadosLista.lastChild.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });
        novedadesLista.lastChild.addEventListener('click', () => {
            window.location.href = `producto.html?id=${producto.id}`;
        });
    });
}

// ==================== FUNCIONALIDAD DE INICIO DE SESIÓN ====================
document.addEventListener('DOMContentLoaded', () => {
    const btnSesion = document.querySelector('.btn-sesion');
    const userModal = document.getElementById('userModal');
    const btnAdmin = document.getElementById('btnAdmin');
    const btnUser = document.getElementById('btnUser');
    const adminBtn = document.getElementById('adminBtn');

    // Verificar si ya hay un tipo de usuario guardado
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
        adminBtn.style.display = 'block';
    }

    // Mostrar modal al hacer clic en "Iniciar sesión"
    btnSesion.addEventListener('click', () => {
        userModal.style.display = 'flex';
    });

    // Seleccionar Administrador
    btnAdmin.addEventListener('click', () => {
        localStorage.setItem('userType', 'admin');
        adminBtn.style.display = 'block';
        userModal.style.display = 'none';
        alert('Sesión iniciada como Administrador');
    });

    // Seleccionar Usuario
    btnUser.addEventListener('click', () => {
        localStorage.setItem('userType', 'user');
        adminBtn.style.display = 'none';
        userModal.style.display = 'none';
        alert('Sesión iniciada como Usuario');
    });

    // Cerrar modal al hacer clic fuera
    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
    });

    // Event listener para el botón admin
    adminBtn.addEventListener('click', () => {
        window.location.href = 'agregar-producto.html';
    });
});
