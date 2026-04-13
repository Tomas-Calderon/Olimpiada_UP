// Datos de productos
const productosData = {
    producto1: {
        nombre: "Producto 1",
        imagen: "CSS/imagenes/producto1.png",
        precio: 25.00,
        precioAnterior: null,
        descripcion: "Este es un excelente producto de calidad para mejorar tu rendimiento deportivo. Diseñado con materiales premium y tecnología avanzada.",
        tipo: "Recomendado"
    },
    producto2: {
        nombre: "Producto 2",
        imagen: "CSS/imagenes/producto2.png",
        precio: 30.00,
        precioAnterior: null,
        descripcion: "Producto versátil y duradero, perfecto para cualquier tipo de entrenamiento.",
        tipo: "Recomendado"
    },
    producto3: {
        nombre: "Producto 3",
        imagen: "CSS/imagenes/producto3.png",
        precio: 20.00,
        precioAnterior: null,
        descripcion: "Accesorio esencial para deportistas profesionales y principiantes.",
        tipo: "Recomendado"
    },
    producto4: {
        nombre: "Producto 4",
        imagen: "CSS/imagenes/producto4.png",
        precio: 35.00,
        precioAnterior: null,
        descripcion: "Diseño innovador y funcional para maximizar tu rendimiento.",
        tipo: "Recomendado"
    },
    producto5: {
        nombre: "Producto 5",
        imagen: "CSS/imagenes/producto5.png",
        precio: 40.00,
        precioAnterior: null,
        descripcion: "Premium quality para atletas que buscan lo mejor.",
        tipo: "Recomendado"
    },
    oferta1: {
        nombre: "Oferta 1",
        imagen: "CSS/imagenes/oferta1.png",
        precio: 15.00,
        precioAnterior: 25.00,
        descripcion: "¡Oferta especial! Ahorra 40% en este producto premium.",
        tipo: "Oferta"
    },
    oferta2: {
        nombre: "Oferta 2",
        imagen: "CSS/imagenes/oferta2.png",
        precio: 20.00,
        precioAnterior: 30.00,
        descripcion: "Descuento limitado en este producto popular.",
        tipo: "Oferta"
    },
    oferta3: {
        nombre: "Oferta 3",
        imagen: "CSS/imagenes/oferta3.png",
        precio: 10.00,
        precioAnterior: 20.00,
        descripcion: "Gran oferta con 50% de descuento.",
        tipo: "Oferta"
    },
    oferta4: {
        nombre: "Oferta 4",
        imagen: "CSS/imagenes/oferta4.png",
        precio: 25.00,
        precioAnterior: 35.00,
        descripcion: "Precio especial solo por hoy.",
        tipo: "Oferta"
    },
    oferta5: {
        nombre: "Oferta 5",
        imagen: "CSS/imagenes/oferta5.png",
        precio: 30.00,
        precioAnterior: 40.00,
        descripcion: "Oferta exclusiva para clientes VIP.",
        tipo: "Oferta"
    },
    novedad1: {
        nombre: "Novedad 1",
        imagen: "CSS/imagenes/novedad1.png",
        precio: 45.00,
        precioAnterior: null,
        descripcion: "Último lanzamiento con tecnología de punta.",
        tipo: "Novedad"
    },
    novedad2: {
        nombre: "Novedad 2",
        imagen: "CSS/imagenes/novedad2.png",
        precio: 50.00,
        precioAnterior: null,
        descripcion: "Producto nuevo con características revolucionarias.",
        tipo: "Novedad"
    },
    novedad3: {
        nombre: "Novedad 3",
        imagen: "CSS/imagenes/novedad3.png",
        precio: 35.00,
        precioAnterior: null,
        descripcion: "Diseño moderno y funcional para los deportistas actuales.",
        tipo: "Novedad"
    },
    novedad4: {
        nombre: "Novedad 4",
        imagen: "CSS/imagenes/novedad4.png",
        precio: 40.00,
        precioAnterior: null,
        descripcion: "Innovación en rendimiento deportivo.",
        tipo: "Novedad"
    },
    novedad5: {
        nombre: "Novedad 5",
        imagen: "CSS/imagenes/novedad5.png",
        precio: 55.00,
        precioAnterior: null,
        descripcion: "Premium edition con características exclusivas.",
        tipo: "Novedad"
    }
};

// Obtener el ID del producto desde la URL
function obtenerProductoDelURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Cargar datos del producto
function cargarProducto() {
    const productoId = obtenerProductoDelURL();
    
    if (!productoId || !productosData[productoId]) {
        // Si no hay producto válido, redirigir a inicio
        window.location.href = 'main.html';
        return;
    }

    const producto = productosData[productoId];

    // Actualizar HTML con datos del producto
    document.getElementById('productoNombre').textContent = producto.nombre;
    document.getElementById('productoImagen').src = producto.imagen;
    document.getElementById('productoPrecio').textContent = `$${producto.precio.toFixed(2)}`;
    document.getElementById('productoDescripcion').textContent = producto.descripcion;

    // Mostrar precio anterior si existe (es una oferta)
    if (producto.precioAnterior) {
        document.getElementById('productoPrecioAnterior').textContent = `$${producto.precioAnterior.toFixed(2)}`;
        document.getElementById('productoPrecioAnterior').style.display = 'block';
    }

    // Agregar eventos a los botones de cantidad
    document.getElementById('incrementBtn').addEventListener('click', incrementarCantidad);
    document.getElementById('decrementBtn').addEventListener('click', decrementarCantidad);
    document.getElementById('cantidad').addEventListener('change', validarCantidad);

    // Agregar eventos a botones de compra
    document.querySelector('.btn-agregar-carrito').addEventListener('click', agregarAlCarrito);
    document.querySelector('.btn-comprar-ahora').addEventListener('click', comprarAhora);
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

// Cargar el producto cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarProducto);
