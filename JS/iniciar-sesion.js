document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('iniciarSesionForm');
    const successState = document.getElementById('successState');
    const btnCancelar = document.getElementById('btn-cancelar');
    const alertError = document.getElementById('alertError');
    
    if (!form) return;

    // ==================== ELEMENTOS DEL FORMULARIO ====================
    const inputEmail = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    const btnTogglePassword = document.getElementById('btnTogglePassword');

    // ==================== FUNCIONES DE VALIDACIÓN ====================
    
    /**
     * Valida el formato del email
     */
    const validarEmail = (valor) => {
        const email = valor.trim().toLowerCase();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email) && email.endsWith('@gmail.com');
    };

    // ==================== FUNCIONES DE VISUALIZACIÓN ====================

    /**
     * Muestra un mensaje de error en un campo
     */
    const mostrarError = (inputElement, mensaje) => {
        inputElement.classList.add('invalid');
        inputElement.classList.remove('valid');
        
        const errorDiv = document.getElementById(`error-${inputElement.id}`);
        const successDiv = document.getElementById(`success-${inputElement.id}`);
        
        if (errorDiv) {
            errorDiv.textContent = mensaje;
            errorDiv.classList.add('show');
        }
        if (successDiv) {
            successDiv.classList.remove('show');
        }
    };

    /**
     * Muestra un mensaje de éxito en un campo
     */
    const mostrarExito = (inputElement) => {
        inputElement.classList.add('valid');
        inputElement.classList.remove('invalid');
        
        const errorDiv = document.getElementById(`error-${inputElement.id}`);
        const successDiv = document.getElementById(`success-${inputElement.id}`);
        
        if (errorDiv) {
            errorDiv.classList.remove('show');
        }
        if (successDiv) {
            successDiv.classList.add('show');
        }
    };

    /**
     * Limpia los mensajes de un campo
     */
    const limpiarMensajes = (inputElement) => {
        inputElement.classList.remove('valid', 'invalid');
        const errorDiv = document.getElementById(`error-${inputElement.id}`);
        const successDiv = document.getElementById(`success-${inputElement.id}`);
        
        if (errorDiv) errorDiv.classList.remove('show');
        if (successDiv) successDiv.classList.remove('show');
    };

    /**
     * Muestra un mensaje de error general
     */
    const mostrarAlertError = (mensaje) => {
        alertError.textContent = mensaje;
        alertError.style.display = 'block';
        setTimeout(() => {
            alertError.style.display = 'none';
        }, 5000);
    };

    /**
     * Limpia el alerta de error
     */
    const limpiarAlertError = () => {
        alertError.style.display = 'none';
    };

    /**
     * Toggle visibilidad de la contraseña
     */
    const togglePasswordVisibility = (inputElement, buttonElement) => {
        const isPassword = inputElement.type === 'password';
        inputElement.type = isPassword ? 'text' : 'password';
        buttonElement.title = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
        
        const eyeIcon = buttonElement.querySelector('.eye-icon');
        if (eyeIcon) {
            eyeIcon.textContent = isPassword ? '🙈' : '👁️';
        }
    };

    // ==================== EVENTOS DE VALIDACIÓN EN TIEMPO REAL ====================

    inputEmail.addEventListener('blur', () => {
        const valor = inputEmail.value.trim();
        limpiarAlertError();
        
        if (!valor) {
            mostrarError(inputEmail, 'El email es obligatorio');
        } else if (!validarEmail(valor)) {
            mostrarError(inputEmail, 'Email inválido. Debe ser un correo @gmail.com válido');
        } else {
            mostrarExito(inputEmail);
        }
    });

    inputEmail.addEventListener('focus', () => {
        limpiarMensajes(inputEmail);
    });

    inputPassword.addEventListener('blur', () => {
        const valor = inputPassword.value;
        
        if (!valor) {
            mostrarError(inputPassword, 'La contraseña es obligatoria');
        } else {
            mostrarExito(inputPassword);
        }
    });

    inputPassword.addEventListener('focus', () => {
        limpiarMensajes(inputPassword);
    });

    // Botón toggle para visibilidad de contraseña
    btnTogglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        togglePasswordVisibility(inputPassword, btnTogglePassword);
    });

    // ==================== ENVÍO DEL FORMULARIO ====================

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        limpiarAlertError();

        // Obtener valores
        const email = inputEmail.value.trim().toLowerCase();
        const password = inputPassword.value;

        // Validar campos
        let esValido = true;

        if (!email) {
            mostrarError(inputEmail, 'El email es obligatorio');
            esValido = false;
        } else if (!validarEmail(email)) {
            mostrarError(inputEmail, 'Email inválido. Debe ser un correo @gmail.com válido');
            esValido = false;
        }

        if (!password) {
            mostrarError(inputPassword, 'La contraseña es obligatoria');
            esValido = false;
        }

        if (!esValido) {
            return;
        }

        // Cargar usuarios desde localStorage
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

        // Buscar usuario con el email
        const usuarioEncontrado = usuarios.find(u => u.email === email);

        if (!usuarioEncontrado) {
            mostrarAlertError('❌ El email no está registrado. ¿Deseas crear una cuenta?');
            mostrarError(inputEmail, 'Email no registrado');
            return;
        }

        // Verificar contraseña
        if (usuarioEncontrado.password !== password) {
            mostrarAlertError('❌ Contraseña incorrecta. Por favor, intenta de nuevo.');
            mostrarError(inputPassword, 'Contraseña incorrecta');
            return;
        }

        // ✓ Credenciales válidas - Guardar sesión
        const sesion = {
            usuarioId: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre,
            apellido: usuarioEncontrado.apellido,
            email: usuarioEncontrado.email,
            telefono: usuarioEncontrado.telefono,
            inicioSesion: new Date().toISOString()
        };

        // Guardar en localStorage
        localStorage.setItem('sesionActual', JSON.stringify(sesion));

        // Mostrar estado de éxito
        form.style.display = 'none';
        successState.classList.add('show');

        // Redirigir después de 2 segundos
        setTimeout(() => {
            window.location.href = 'main.html';
        }, 2000);
    });

    // ==================== BOTÓN CANCELAR ====================

    btnCancelar.addEventListener('click', () => {
        window.location.href = 'main.html';
    });

    // ==================== VERIFICAR SI YA ESTÁ LOGUEADO ====================
    
    // Si el usuario ya tiene sesión, redirigir a main.html
    const sesionActual = localStorage.getItem('sesionActual');
    if (sesionActual) {
        // El usuario ya está logueado, redirigir
        window.location.href = 'main.html';
    }
});
