// ==================== GESTIÓN DE PERFIL DE USUARIO ====================

/**
 * Variables globales
 */
let usuarioActual = null;
let usuarioOriginal = null;
let camposEnEdicion = new Set();
let cambiosPendientes = {};

/**
 * Inicialización al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    configurarEventos();
    actualizarInterfazAutenticacion();
});

/**
 * Carga los datos del usuario desde localStorage
 */
function cargarDatosUsuario() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual) {
        window.location.href = 'main.html';
        return;
    }

    // Buscar usuario en la lista de usuarios
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === sesionActual.usuarioId);

    if (!usuario) {
        alert('Error: No se encontró el usuario');
        window.location.href = 'main.html';
        return;
    }

    usuarioActual = usuario;
    usuarioOriginal = JSON.parse(JSON.stringify(usuario)); // Copia profunda

    // Llenar formulario
    document.getElementById('nombrePerfil').value = usuario.nombre || '';
    document.getElementById('apellidoPerfil').value = usuario.apellido || '';
    document.getElementById('emailPerfil').value = usuario.email || '';
    document.getElementById('telefonoPerfil').value = usuario.telefono || '';
    document.getElementById('passwordPerfil').value = '••••••••'; // Siempre oculta
    document.getElementById('fechaCreacionPerfil').value = formatearFecha(usuario.fechaCreacion);

    // Actualizar avatar
    document.getElementById('usuarioNombre').textContent = usuario.nombre;
    document.getElementById('avatarIniciales').textContent = 
        usuario.nombre.charAt(0).toUpperCase() + usuario.apellido.charAt(0).toUpperCase();
}

/**
 * Formatea la fecha a formato legible
 */
function formatearFecha(isoDate) {
    const fecha = new Date(isoDate);
    return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

/**
 * Configura todos los event listeners
 */
function configurarEventos() {
    // Botones de editar
    const botonesEditar = document.querySelectorAll('.btn-edit');
    botonesEditar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const campo = btn.dataset.field;
            habilitarEdicion(campo);
        });
    });

    // Botón volver
    const btnVolver = document.getElementById('btnCancelarPerfil');
    if (btnVolver) {
        btnVolver.addEventListener('click', () => {
            if (Object.keys(cambiosPendientes).length > 0) {
                if (confirm('Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?')) {
                    window.location.href = 'main.html';
                }
            } else {
                window.location.href = 'main.html';
            }
        });
    }

    // Botón guardar cambios
    const btnGuardar = document.getElementById('btnGuardarCambios');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', () => {
            abrirModalVerificacion();
        });
    }

    // Modal de verificación
    configurarModalVerificacion();

    // Dropdown del avatar
    configurarDropdown();

    // Toggle password en modal
    const btnTogglePasswordVer = document.getElementById('btnTogglePasswordVer');
    if (btnTogglePasswordVer) {
        btnTogglePasswordVer.addEventListener('click', (e) => {
            e.preventDefault();
            const inputPassword = document.getElementById('passwordVerification');
            inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
        });
    }
}

/**
 * Habilita la edición de un campo específico
 */
function habilitarEdicion(campo) {
    const inputId = `${campo}Perfil`;
    const input = document.getElementById(inputId);
    
    if (!input) return;

    // Si ya está en edición, ignora
    if (camposEnEdicion.has(campo)) return;

    // Habilitar edición
    input.removeAttribute('readonly');
    input.focus();
    camposEnEdicion.add(campo);

    // Cambiar el botón a "Cancelar"
    const btn = document.querySelector(`[data-field="${campo}"]`);
    if (btn) {
        btn.textContent = 'Cancelar';
        btn.classList.add('btn-cancel-edit');
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            cancelarEdicion(campo);
        });
    }

    // Escuchar cambios en el input
    input.addEventListener('change', () => {
        const nuevoValor = input.value;
        const valorOriginal = usuarioOriginal[campo];

        if (nuevoValor !== valorOriginal) {
            cambiosPendientes[campo] = nuevoValor;
        } else {
            delete cambiosPendientes[campo];
        }

        mostrarBotonGuardar();
    });

    mostrarBotonGuardar();
}

/**
 * Cancela la edición de un campo
 */
function cancelarEdicion(campo) {
    const inputId = `${campo}Perfil`;
    const input = document.getElementById(inputId);

    if (!input) return;

    // Restaurar valor original
    input.value = usuarioOriginal[campo] || '';
    input.setAttribute('readonly', '');
    camposEnEdicion.delete(campo);

    // Restaurar botón
    const btn = document.querySelector(`[data-field="${campo}"]`);
    if (btn) {
        btn.textContent = 'Editar';
        btn.classList.remove('btn-cancel-edit');
    }

    // Limpiar cambio pendiente
    delete cambiosPendientes[campo];
    mostrarBotonGuardar();
}

/**
 * Muestra u oculta el botón de guardar cambios
 */
function mostrarBotonGuardar() {
    const btnGuardar = document.getElementById('btnGuardarCambios');
    const hayChanges = Object.keys(cambiosPendientes).length > 0;

    if (btnGuardar) {
        btnGuardar.style.display = hayChanges ? 'block' : 'none';
    }
}

/**
 * Abre el modal de verificación de contraseña
 */
function abrirModalVerificacion() {
    const modal = document.getElementById('passwordVerificationModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('passwordVerification').focus();
    }
}

/**
 * Cierra el modal de verificación
 */
function cerrarModalVerificacion() {
    const modal = document.getElementById('passwordVerificationModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('passwordVerification').value = '';
        document.getElementById('passwordVerificationError').textContent = '';
    }
}

/**
 * Configura el modal de verificación de contraseña
 */
function configurarModalVerificacion() {
    const modal = document.getElementById('passwordVerificationModal');
    const btnConfirmar = document.getElementById('btnConfirmarVerificacion');
    const btnCancelar = document.getElementById('btnCancelarVerificacion');
    const inputPassword = document.getElementById('passwordVerification');
    const errorDiv = document.getElementById('passwordVerificationError');

    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            const passwordIngresada = inputPassword.value;

            // Verificar contraseña
            if (passwordIngresada !== usuarioActual.password) {
                errorDiv.textContent = '❌ Contraseña incorrecta';
                inputPassword.style.borderColor = '#e74c3c';
                return;
            }

            // Contraseña correcta - guardar cambios
            guardarCambios();
            cerrarModalVerificacion();
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            cerrarModalVerificacion();
        });
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalVerificacion();
            }
        });
    }

    // Limpiar error al escribir
    if (inputPassword) {
        inputPassword.addEventListener('input', () => {
            errorDiv.textContent = '';
            inputPassword.style.borderColor = '';
        });
    }
}

/**
 * Guarda los cambios del usuario después de verificar la contraseña
 */
function guardarCambios() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const indiceUsuario = usuarios.findIndex(u => u.id === usuarioActual.id);

    if (indiceUsuario === -1) {
        alert('Error: No se encontró el usuario para actualizar');
        return;
    }

    // Aplicar cambios
    for (const [campo, valor] of Object.entries(cambiosPendientes)) {
        usuarios[indiceUsuario][campo] = campo === 'telefono' && valor ? parseInt(valor, 10) : valor;
    }

    // Guardar en localStorage
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Actualizar sesión actual si es necesario
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    if (sesionActual && sesionActual.usuarioId === usuarioActual.id) {
        for (const [campo, valor] of Object.entries(cambiosPendientes)) {
            if (['nombre', 'apellido', 'email', 'telefono'].includes(campo)) {
                sesionActual[campo] = valor;
            }
        }
        localStorage.setItem('sesionActual', JSON.stringify(sesionActual));
    }

    // Actualizar datos locales
    usuarioActual = usuarios[indiceUsuario];
    usuarioOriginal = JSON.parse(JSON.stringify(usuarioActual));
    cambiosPendientes = {};

    // Desabilitar edición en todos los campos
    const botonesEditar = document.querySelectorAll('.btn-edit');
    botonesEditar.forEach(btn => {
        const campo = btn.dataset.field;
        const inputId = `${campo}Perfil`;
        const input = document.getElementById(inputId);
        if (input) {
            input.setAttribute('readonly', '');
            btn.textContent = 'Editar';
            btn.classList.remove('btn-cancel-edit');
            camposEnEdicion.delete(campo);
        }
    });

    mostrarBotonGuardar();

    // Mostrar mensaje de éxito
    alert('✓ Cambios guardados exitosamente');

    // Recargar página para reflejar cambios
    setTimeout(() => {
        location.reload();
    }, 500);
}

/**
 * Actualiza la interfaz de autenticación (dropdown del usuario)
 */
function actualizarInterfazAutenticacion() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual) {
        window.location.href = 'main.html';
        return;
    }

    const usuarioNombreEl = document.getElementById('usuarioNombre');
    if (usuarioNombreEl) {
        usuarioNombreEl.textContent = sesionActual.nombre;
    }

    const avatarInicialesEl = document.getElementById('avatarIniciales');
    if (avatarInicialesEl) {
        avatarInicialesEl.textContent = 
            sesionActual.nombre.charAt(0).toUpperCase() + sesionActual.apellido.charAt(0).toUpperCase();
    }
}

/**
 * Configura el dropdown del usuario
 */
function configurarDropdown() {
    const btnAvatar = document.getElementById('btnAvatar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');

    if (btnAvatar) {
        btnAvatar.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dropdownMenu) {
                dropdownMenu.classList.toggle('show');
            }
        });
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (btnAvatar && !btnAvatar.contains(e.target) && dropdownMenu && !dropdownMenu.contains(e.target)) {
            if (dropdownMenu) {
                dropdownMenu.classList.remove('show');
            }
        }
    });

    // Cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                localStorage.removeItem('sesionActual');
                window.location.href = 'main.html';
            }
        });
    }
}
