// ==================== INICIALIZACIÓN DE BASE DE DATOS ====================

/**
 * Inicializa la base de datos con un usuario admin si no existe
 */
function inicializarBaseDatos() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Verificar si ya existe un admin
    const indiceAdmin = usuarios.findIndex(u => u.email === 'admin.admin@admin.admin');
    
    if (indiceAdmin === -1) {
        // Crear usuario admin si no existe
        const usuarioAdmin = {
            id: Date.now(),
            nombre: 'admin',
            apellido: 'admin',
            email: 'admin.admin@admin.admin',
            password: 'admin',
            telefono: null,
            role: 'admin',
            fechaCreacion: new Date().toISOString()
        };
        
        usuarios.push(usuarioAdmin);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        console.log('✓ Usuario admin creado exitosamente');
    } else {
        // Si la cuenta admin existe pero no es admin, corregir el rol
        if (usuarios[indiceAdmin].role !== 'admin') {
            usuarios[indiceAdmin].role = 'admin';
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            console.log('✓ Rol de admin.admin@admin.admin corregido a administrador');
        }
    }
    
    // Inicializar productos si no existen
    const productos = localStorage.getItem('productos');
    if (!productos) {
        localStorage.setItem('productos', JSON.stringify([]));
    }

    // Inicializar características (etiquetas) si no existen
    const caracteristicas = localStorage.getItem('caracteristicas');
    if (!caracteristicas) {
        localStorage.setItem('caracteristicas', JSON.stringify([]));
        console.log('✓ Array de características (etiquetas) inicializado vacío');
    }
}

// Ejecutar inicialización cuando se cargue la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarBaseDatos);
} else {
    inicializarBaseDatos();
}
