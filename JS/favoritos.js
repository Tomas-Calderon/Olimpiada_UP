// Sistema de Favoritos

class GestorFavoritos {
    constructor() {
        this.storageKey = 'favoritos_usuario';
        this.inicializar();
    }

    inicializar() {
        const usuarioJSON = localStorage.getItem('usuario_autenticado');
        if (!usuarioJSON) {
            this.usuarioId = null;
        } else {
            try {
                const usuario = JSON.parse(usuarioJSON);
                this.usuarioId = usuario.id || usuario.email;
            } catch (e) {
                this.usuarioId = null;
            }
        }
    }

    obtenerFavoritosActuales() {
        if (!this.usuarioId) return [];
        const todosFavoritos = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        return todosFavoritos[this.usuarioId] || [];
    }

    agregarFavorito(productoId) {
        if (!this.usuarioId) return false;
        
        const todosFavoritos = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        if (!todosFavoritos[this.usuarioId]) {
            todosFavoritos[this.usuarioId] = [];
        }
        
        if (!todosFavoritos[this.usuarioId].includes(productoId)) {
            todosFavoritos[this.usuarioId].push(productoId);
            localStorage.setItem(this.storageKey, JSON.stringify(todosFavoritos));
            return true;
        }
        return false;
    }

    quitarFavorito(productoId) {
        if (!this.usuarioId) return false;
        
        const todosFavoritos = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
        if (!todosFavoritos[this.usuarioId]) return false;
        
        const index = todosFavoritos[this.usuarioId].indexOf(productoId);
        if (index > -1) {
            todosFavoritos[this.usuarioId].splice(index, 1);
            localStorage.setItem(this.storageKey, JSON.stringify(todosFavoritos));
            return true;
        }
        return false;
    }

    esFavorito(productoId) {
        return this.obtenerFavoritosActuales().includes(productoId);
    }

    toggleFavorito(productoId) {
        if (this.esFavorito(productoId)) {
            this.quitarFavorito(productoId);
            return false;
        } else {
            this.agregarFavorito(productoId);
            return true;
        }
    }
}

// Instancia global
const gestorFavoritos = new GestorFavoritos();

// Función para renderizar botón de favorito
function crearBotonFavorito(productoId, esAdmin = false) {
    if (esAdmin) return ''; // No mostrar favorito a admins

    const esFavorito = gestorFavoritos.esFavorito(productoId);
    const claseEstado = esFavorito ? 'favorito-activo' : 'favorito-inactivo';
    
    return `<button class="btn-favorito ${claseEstado}" data-producto-id="${productoId}" title="${esFavorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
        Favorito
    </button>`;
}

// Función para inicializar listeners en botones de favorito
function inicializarBotonesFavorito() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-favorito')) {
            const productoId = e.target.dataset.productoId;
            
            // Verificar si el usuario está autenticado
            if (!gestorFavoritos.usuarioId) {
                alert('Debes iniciar sesión para usar favoritos');
                return;
            }

            const ahora = gestorFavoritos.toggleFavorito(productoId);
            e.target.classList.toggle('favorito-activo');
            e.target.classList.toggle('favorito-inactivo');
            e.target.title = ahora ? 'Quitar de favoritos' : 'Añadir a favoritos';
        }
    });
}

// Función para obtener datos de productos desde localStorage
function obtenerProductosPorIds(ids) {
    const todosLosProductos = JSON.parse(localStorage.getItem('productos') || '[]');
    return todosLosProductos.filter(p => ids.includes(p.id));
}

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GestorFavoritos, crearBotonFavorito, inicializarBotonesFavorito, obtenerProductosPorIds };
}
