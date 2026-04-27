document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearCuentaForm');
    const successState = document.getElementById('successState');
    const btnCancelar = document.getElementById('btn-cancelar');
    
    if (!form) return;

    // ==================== ELEMENTOS DEL FORMULARIO ====================
    const inputNombre = document.getElementById('nombre');
    const inputApellido = document.getElementById('apellido');
    const inputEmail = document.getElementById('email');
    const inputPassword = document.getElementById('password');
    const inputPasswordConfirm = document.getElementById('password-confirm');
    const inputTelefono = document.getElementById('telefono');
    const btnTogglePassword = document.getElementById('btnTogglePassword');
    const btnTogglePasswordConfirm = document.getElementById('btnTogglePasswordConfirm');

    // ==================== FUNCIONES DE VALIDACIÓN ====================
    
    /**
     * Valida que el nombre o apellido sea válido
     * Solo permite letras, espacios, guiones y apóstrofos, incluyendo acentos
     */
    const validarNombreApellido = (valor) => {
        const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]{2,}$/;
        return regex.test(valor.trim());
    };

    /**
     * Valida el formato del email
     * Acepta cualquier dominio válido
     */
    const validarEmail = (valor) => {
        const email = valor.trim().toLowerCase();
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    /**
     * Valida la contraseña
     * Mínimo 6 caracteres, debe contener letras
     */
    const validarPassword = (valor) => {
        return valor.length >= 6 && /[A-Za-zÀ-ÿ]/.test(valor);
    };

    /**
     * Valida el teléfono (opcional)
     * Solo dígitos
     */
    const validarTelefono = (valor) => {
        if (!valor.trim()) return true; // opcional
        return /^\d+$/.test(valor.trim()) && valor.trim().length >= 7;
    };

    /**
     * Valida que las contraseñas coincidan
     */
    const validarCoincidenciaPassword = (password1, password2) => {
        return password1 === password2 && password1.length > 0;
    };

    /**
     * Evalúa la fortaleza de la contraseña
     * Retorna: 'weak', 'medium', 'strong'
     */
    const evaluarFortalezaPassword = (password) => {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

        if (score <= 1) return 'weak';
        if (score <= 3) return 'medium';
        return 'strong';
    };

    /**
     * Actualiza la visualización de la fortaleza de la contraseña
     */
    const actualizarFortalezaPassword = () => {
        const password = inputPassword.value;
        const strengthDiv = document.getElementById('password-strength');
        
        if (!password) {
            strengthDiv.classList.remove('show');
            return;
        }

        strengthDiv.classList.add('show');
        const fortaleza = evaluarFortalezaPassword(password);

        // Limpiar clases previas
        document.querySelectorAll('.strength-bar').forEach(bar => {
            bar.classList.remove('weak', 'medium', 'strong');
        });

        const strengthText = document.getElementById('strength-text');

        if (fortaleza === 'weak') {
            document.getElementById('bar1').classList.add('weak');
            strengthText.textContent = 'Contraseña débil';
            strengthText.className = 'strength-text weak';
        } else if (fortaleza === 'medium') {
            document.getElementById('bar1').classList.add('medium');
            document.getElementById('bar2').classList.add('medium');
            strengthText.textContent = 'Contraseña moderada';
            strengthText.className = 'strength-text medium';
        } else {
            document.getElementById('bar1').classList.add('strong');
            document.getElementById('bar2').classList.add('strong');
            document.getElementById('bar3').classList.add('strong');
            strengthText.textContent = 'Contraseña fuerte';
            strengthText.className = 'strength-text strong';
        }
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
     * Toggle visibilidad de la contraseña
     */
    const togglePasswordVisibility = (inputElement, buttonElement) => {
        const isPassword = inputElement.type === 'password';
        inputElement.type = isPassword ? 'text' : 'password';
        buttonElement.title = isPassword ? 'Ocultar contraseña' : 'Mostrar contraseña';
        
        // Cambiar el emoji del ojo
        const eyeIcon = buttonElement.querySelector('.eye-icon');
        if (eyeIcon) {
            eyeIcon.textContent = isPassword ? '🙈' : '👁️';
        }
    };

    // ==================== EVENTOS DE VALIDACIÓN EN TIEMPO REAL ====================

    inputNombre.addEventListener('blur', () => {
        const valor = inputNombre.value.trim();
        
        if (!valor) {
            mostrarError(inputNombre, 'El nombre es obligatorio');
        } else if (!validarNombreApellido(valor)) {
            mostrarError(inputNombre, 'Nombre inválido. Use solo letras y espacios (mínimo 2 caracteres)');
        } else {
            mostrarExito(inputNombre);
        }
    });

    inputNombre.addEventListener('focus', () => {
        limpiarMensajes(inputNombre);
    });

    inputApellido.addEventListener('blur', () => {
        const valor = inputApellido.value.trim();
        
        if (!valor) {
            mostrarError(inputApellido, 'El apellido es obligatorio');
        } else if (!validarNombreApellido(valor)) {
            mostrarError(inputApellido, 'Apellido inválido. Use solo letras y espacios (mínimo 2 caracteres)');
        } else {
            mostrarExito(inputApellido);
        }
    });

    inputApellido.addEventListener('focus', () => {
        limpiarMensajes(inputApellido);
    });

    inputEmail.addEventListener('blur', () => {
        const valor = inputEmail.value.trim();
        
        if (!valor) {
            mostrarError(inputEmail, 'El email es obligatorio');
        } else if (!validarEmail(valor)) {
            mostrarError(inputEmail, 'Email inválido. Ingresa un correo válido');
        } else {
            mostrarExito(inputEmail);
        }
    });

    inputEmail.addEventListener('focus', () => {
        limpiarMensajes(inputEmail);
    });

    inputPassword.addEventListener('input', () => {
        const valor = inputPassword.value;
        limpiarMensajes(inputPassword);
        actualizarFortalezaPassword();
    });

    inputPassword.addEventListener('blur', () => {
        const valor = inputPassword.value;
        
        if (!valor) {
            mostrarError(inputPassword, 'La contraseña es obligatoria');
        } else if (!validarPassword(valor)) {
            mostrarError(inputPassword, 'Contraseña inválida. Mínimo 6 caracteres y debe contener letras');
        } else {
            mostrarExito(inputPassword);
        }
    });

    // Eventos para confirmación de contraseña
    inputPasswordConfirm.addEventListener('input', () => {
        limpiarMensajes(inputPasswordConfirm);
        
        // Validar coincidencia mientras escribe
        if (inputPassword.value && inputPasswordConfirm.value) {
            if (validarCoincidenciaPassword(inputPassword.value, inputPasswordConfirm.value)) {
                mostrarExito(inputPasswordConfirm);
            } else {
                mostrarError(inputPasswordConfirm, 'Las contraseñas no coinciden');
            }
        }
    });

    inputPasswordConfirm.addEventListener('blur', () => {
        const valor = inputPasswordConfirm.value;
        
        if (!valor) {
            mostrarError(inputPasswordConfirm, 'Debe confirmar la contraseña');
        } else if (!validarCoincidenciaPassword(inputPassword.value, valor)) {
            mostrarError(inputPasswordConfirm, 'Las contraseñas no coinciden');
        } else {
            mostrarExito(inputPasswordConfirm);
        }
    });

    // Botones toggle para visibilidad de contraseña
    btnTogglePassword.addEventListener('click', (e) => {
        e.preventDefault();
        togglePasswordVisibility(inputPassword, btnTogglePassword);
    });

    btnTogglePasswordConfirm.addEventListener('click', (e) => {
        e.preventDefault();
        togglePasswordVisibility(inputPasswordConfirm, btnTogglePasswordConfirm);
    });

    inputTelefono.addEventListener('blur', () => {
        const valor = inputTelefono.value.trim();
        
        if (valor && !validarTelefono(valor)) {
            mostrarError(inputTelefono, 'Teléfono inválido. Use solo dígitos (mínimo 7)');
        } else if (valor) {
            mostrarExito(inputTelefono);
        }
    });

    inputTelefono.addEventListener('focus', () => {
        if (inputTelefono.value.trim()) {
            limpiarMensajes(inputTelefono);
        }
    });

    // ==================== ENVÍO DEL FORMULARIO ====================

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Obtener valores
        const nombre = inputNombre.value.trim();
        const apellido = inputApellido.value.trim();
        const email = inputEmail.value.trim().toLowerCase();
        const password = inputPassword.value;
        const passwordConfirmValue = inputPasswordConfirm.value;
        const telefonoRaw = inputTelefono.value.trim();

        // Validar todos los campos
        let esValido = true;

        if (!nombre) {
            mostrarError(inputNombre, 'El nombre es obligatorio');
            esValido = false;
        } else if (!validarNombreApellido(nombre)) {
            mostrarError(inputNombre, 'Nombre inválido. Use solo letras y espacios (mínimo 2 caracteres)');
            esValido = false;
        }

        if (!apellido) {
            mostrarError(inputApellido, 'El apellido es obligatorio');
            esValido = false;
        } else if (!validarNombreApellido(apellido)) {
            mostrarError(inputApellido, 'Apellido inválido. Use solo letras y espacios (mínimo 2 caracteres)');
            esValido = false;
        }

        if (!email) {
            mostrarError(inputEmail, 'El email es obligatorio');
            esValido = false;
        } else if (!validarEmail(email)) {
            mostrarError(inputEmail, 'Email inválido. Ingresa un correo válido');
            esValido = false;
        }

        if (!password) {
            mostrarError(inputPassword, 'La contraseña es obligatoria');
            esValido = false;
        } else if (!validarPassword(password)) {
            mostrarError(inputPassword, 'Contraseña inválida. Mínimo 6 caracteres y debe contener letras');
            esValido = false;
        }

        // Validar confirmación de contraseña
        const passwordConfirm = inputPasswordConfirm.value;
        if (!passwordConfirm) {
            mostrarError(inputPasswordConfirm, 'Debe confirmar la contraseña');
            esValido = false;
        } else if (!validarCoincidenciaPassword(password, passwordConfirm)) {
            mostrarError(inputPasswordConfirm, 'Las contraseñas no coinciden');
            esValido = false;
        }

        if (telefonoRaw && !validarTelefono(telefonoRaw)) {
            mostrarError(inputTelefono, 'Teléfono inválido. Use solo dígitos (mínimo 7)');
            esValido = false;
        }

        if (!esValido) {
            return;
        }

        // Cargar usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

        // Verificar email único
        const existe = usuarios.some(u => u.email === email);
        if (existe) {
            mostrarError(inputEmail, 'Ya existe una cuenta con ese email');
            return;
        }

        // Crear nuevo usuario
        const telefono = telefonoRaw ? parseInt(telefonoRaw, 10) : null;
        
        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            apellido,
            email,
            password,
            telefono,
            role: 'user',
            fechaCreacion: new Date().toISOString()
        };

        // Guardar usuario
        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        // Mostrar estado de éxito
        form.style.display = 'none';
        successState.classList.add('show');

        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    });

    // ==================== BOTÓN CANCELAR ====================

    btnCancelar.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea cancelar el registro?')) {
            window.location.href = 'index.html';
        }
    });
});

