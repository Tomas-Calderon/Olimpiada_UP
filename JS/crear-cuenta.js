document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('crearCuentaForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;
        const telefonoRaw = document.getElementById('telefono').value.trim();

        // Validaciones:
        // nombre y apellido deben ser strings con letras (pueden incluir espacios y acentos)
        const nombreApellidoRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
        if (!nombre || !nombreApellidoRegex.test(nombre)) {
            alert('Nombre inválido. Use sólo letras y espacios.');
            return;
        }
        if (!apellido || !nombreApellidoRegex.test(apellido)) {
            alert('Apellido inválido. Use sólo letras y espacios.');
            return;
        }

        // contraseña debe contener al menos una letra (asegura que es string)
        const contieneLetra = /[A-Za-zÀ-ÿ]/.test(password);
        if (!password || !contieneLetra) {
            alert('Contraseña inválida. Debe contener al menos una letra.');
            return;
        }

        // telefono debe ser un int (sólo dígitos)
        if (!telefonoRaw || !/^\d+$/.test(telefonoRaw)) {
            alert('Teléfono inválido. Ingrese sólo dígitos (número entero).');
            return;
        }
        const telefono = parseInt(telefonoRaw, 10);

        // email debe terminar en @gmail.com
        if (!email.endsWith('@gmail.com')) {
            alert('El mail debe terminar en @gmail.com');
            return;
        }

        // Cargar usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

        // Verificar email único
        const existe = usuarios.some(u => u.email === email);
        if (existe) {
            alert('Ya existe una cuenta con ese mail.');
            return;
        }

        const nuevoUsuario = {
            id: Date.now(),
            nombre,
            apellido,
            email,
            password,
            telefono
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        alert('Cuenta creada correctamente.');
        window.location.href = 'main.html';
    });
});
