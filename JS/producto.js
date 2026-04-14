// Datos de productos (cargados desde localStorage)
let productosData = {};

function cargarProductosDesdeStorage() {
    productosData = {};
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    productos.forEach(producto => {
        productosData[producto.id] = {
            nombre: producto.nombre,
            imagen: producto.imagen,
            imagenesAdicionales: producto.imagenesAdicionales || [],
            precio: producto.precio,
            precioAnterior: null,
            descripcion: producto.descripcion,
            stock: producto.stock,
            descuento: producto.descuento || 0,
            tipo: producto.tipo
        };
    });
}

// Obtener el ID del producto desde la URL
function obtenerProductoDelURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar datos del producto
function cargarProducto() {
    cargarProductosDesdeStorage();
    
    const productoId = obtenerProductoDelURL();
    
    if (!productoId || !productosData[productoId]) {
        // Si no hay producto válido, redirigir a inicio
        window.location.href = 'main.html';
        return;
    }

    const producto = productosData[productoId];

    // Actualizar HTML con datos del producto
    document.getElementById('productoNombre').textContent = producto.nombre;
    document.getElementById('headerProductoNombre').textContent = producto.nombre;
    document.getElementById('productoImagen').src = producto.imagen;
    document.getElementById('productoPrecio').textContent = `$${producto.precio.toFixed(2).replace('.', ',')}`;
    document.getElementById('productoDescripcion').textContent = producto.descripcion;

    // Calcular precio con descuento
    let precioFinal = producto.precio;
    if (producto.descuento > 0) {
        precioFinal = producto.precio * (1 - producto.descuento / 100);
        document.getElementById('productoPrecio').textContent = `$${precioFinal.toFixed(2).replace('.', ',')}`;
        document.getElementById('productoPrecioAnterior').textContent = `$${producto.precio.toFixed(2).replace('.', ',')}`;
        document.getElementById('productoPrecioAnterior').style.display = 'block';
    }

    // Mostrar imágenes adicionales
    const imagenesAdicionalesContainer = document.getElementById('imagenesAdicionales');
    imagenesAdicionalesContainer.innerHTML = '';
    producto.imagenesAdicionales.forEach((img, index) => {
        const imgElement = document.createElement('img');
        imgElement.src = img;
        imgElement.alt = `Imagen adicional ${index + 1}`;
        imgElement.className = 'imagen-adicional';
        imgElement.addEventListener('click', () => {
            document.getElementById('productoImagen').src = img;
        });
        imagenesAdicionalesContainer.appendChild(imgElement);
    });

    // Agregar eventos a los botones de cantidad
    document.getElementById('incrementBtn').addEventListener('click', incrementarCantidad);
    document.getElementById('decrementBtn').addEventListener('click', decrementarCantidad);
    document.getElementById('cantidad').addEventListener('change', validarCantidad);

    // Agregar eventos a botones de compra
    document.querySelector('.btn-agregar-carrito').addEventListener('click', agregarAlCarrito);
    document.querySelector('.btn-comprar-ahora').addEventListener('click', comprarAhora);

    // Agregar evento al botón eliminar
    document.getElementById('eliminarProductoBtn').addEventListener('click', eliminarProducto);

    // Cargar productos relacionados
    cargarProductosRelacionados(productoId);

    // Mostrar botón eliminar si es admin
    const userType = localStorage.getItem('userType');
    if (userType === 'admin') {
        document.getElementById('eliminarProductoBtn').style.display = 'block';
    }
}

// Cargar productos relacionados
function cargarProductosRelacionados(productoId) {
    const relacionadosLista = document.querySelector('.productos-relacionados .productos-lista');
    relacionadosLista.innerHTML = '';

    const productos = Object.keys(productosData).filter(id => id !== productoId);
    
    // Mostrar hasta 4 productos relacionados
    productos.slice(0, 4).forEach(id => {
        const producto = productosData[id];
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.style.cursor = 'pointer';
        productoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img">
            <h3 class="producto-nombre">${producto.nombre}</h3>
            <p class="producto-precio">$${producto.precio.toFixed(2).replace('.', ',')}</p>
        `;

        productoDiv.addEventListener('click', () => {
            window.location.href = `producto.html?id=${id}`;
        });

        relacionadosLista.appendChild(productoDiv);
    });
}

// Funciones de cantidad
function incrementarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    if (valor < 99) {
        input.value = valor + 1;
    }
}

function decrementarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    if (valor > 1) {
        input.value = valor - 1;
    }
}

function validarCantidad() {
    const input = document.getElementById('cantidad');
    let valor = parseInt(input.value) || 1;
    
    if (valor < 1) {
        input.value = 1;
    } else if (valor > 99) {
        input.value = 99;
    }
}

// Funciones de compra
function agregarAlCarrito() {
    const cantidad = document.getElementById('cantidad').value;
    const productoId = obtenerProductoDelURL();
    const producto = productosData[productoId];
    
    alert(`${cantidad} unidad(es) de "${producto.nombre}" agregada(s) al carrito`);
    // Aquí se podría implementar la lógica real del carrito
}

function comprarAhora() {
    const cantidad = document.getElementById('cantidad').value;
    const productoId = obtenerProductoDelURL();
    const producto = productosData[productoId];
    
    alert(`Iniciando compra de ${cantidad} unidad(es) de "${producto.nombre}"`);
    // Aquí se podría redirigir al checkout
}

// Función para eliminar producto
function eliminarProducto() {
    const productoId = obtenerProductoDelURL();
    
    if (confirm('¿Estás seguro de que quieres eliminar este producto permanentemente?')) {
        // Obtener productos del localStorage
        let productos = JSON.parse(localStorage.getItem('productos')) || [];
        
        // Filtrar para remover el producto
        productos = productos.filter(producto => producto.id !== productoId);
        
        // Guardar de vuelta
        localStorage.setItem('productos', JSON.stringify(productos));
        
        // Redirigir a main.html
        window.location.href = 'main.html';
    }
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

// Cargar el producto cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarProducto);
