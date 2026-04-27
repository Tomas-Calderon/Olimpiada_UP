// ==================== FUNCIONALIDAD DE GESTIONAR USUARIOS ====================

/**
 * Verifica si el usuario actual es admin
 */
function verificarPermiso() {
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (!sesionActual || sesionActual.role !== 'admin') {
        // Redirigir o mostrar acceso denegado
        mostrarAccesoDenegado();
        return false;
    }
    
    return true;
}

/**
 * Muestra mensaje de acceso denegado
 */
function mostrarAccesoDenegado() {
    const container = document.getElementById('usuarios-container');
    container.innerHTML = `
        <div class="acceso-denegado">
            <p>⚠️ Acceso Denegado</p>
            <p style="font-size: 1rem; font-weight: normal; margin-bottom: 1.5rem;">Solo los administradores pueden gestionar usuarios.</p>
            <button class="btn-volver" onclick="window.location.href='index.html'">
                ← Volver a la tienda
            </button>
        </div>
    `;
}

/**
 * Carga y renderiza el listado de usuarios
 */
function cargarUsuarios() {
    if (!verificarPermiso()) {
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    const container = document.getElementById('usuarios-container');
    
    if (usuarios.length === 0) {
        container.innerHTML = `
            <div class="sin-usuarios">
                <p>No hay usuarios registrados</p>
            </div>
        `;
        return;
    }
    
    // Crear tabla de usuarios
    let html = `
        <div class="usuarios-table">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Rol Actual</th>
                        <th>Acciones</th>
                        <th>Fecha de Creación</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    usuarios.forEach((usuario, indice) => {
        const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;
        const fechaCreacion = new Date(usuario.fechaCreacion).toLocaleDateString('es-ES');
        const rolActual = usuario.role === 'admin' ? 'Administrador' : 'Usuario';
        const badgeClass = usuario.role === 'admin' ? 'rol-admin' : 'rol-user';
        const nuevoRol = usuario.role === 'admin' ? 'user' : 'admin';
        const textoNuevoRol = nuevoRol === 'admin' ? 'Hacer Admin' : 'Hacer Usuario';
        
        // Verificar si es la cuenta admin protegida
        const esAdminPrincipal = usuario.email === 'admin.admin@admin.admin';
        
        // Verificar si es el usuario actual
        const esUsuarioActual = sesionActual && usuario.email === sesionActual.email;
        const esAdminIntentandoQuitarseAdmin = esUsuarioActual && usuario.role === 'admin' && nuevoRol === 'user';
        
        // Determinar si el botón debe estar deshabilitado
        const btnDeshabilitado = (esAdminPrincipal || esAdminIntentandoQuitarseAdmin) ? 'disabled' : '';
        const estiloBtn = (esAdminPrincipal || esAdminIntentandoQuitarseAdmin) ? 'opacity: 0.5; cursor: not-allowed;' : '';
        
        let titulo = '';
        let indicador = '';
        if (esAdminPrincipal) {
            titulo = 'Esta es la cuenta admin principal, no se puede cambiar';
            indicador = ' 🔐 (Protegido)';
        } else if (esAdminIntentandoQuitarseAdmin) {
            titulo = 'No puedes quitarte admin a ti mismo. Otro admin debe hacerlo.';
            indicador = ' 👤 (Tu cuenta)';
        }
        
        html += `
            <tr>
                <td>
                    <div class="usuario-nombre">${nombreCompleto}${indicador}</div>
                </td>
                <td>
                    <div class="usuario-email">${usuario.email}</div>
                </td>
                <td>
                    <div class="usuario-email">${usuario.telefono || '-'}</div>
                </td>
                <td>
                    <span class="rol-badge ${badgeClass}">${rolActual}</span>
                </td>
                <td>
                    <div class="rol-selector">
                        <button class="btn-cambiar-rol" onclick="cambiarRol(${indice}, '${nuevoRol}')" ${btnDeshabilitado} style="${estiloBtn}" title="${titulo || 'Cambiar rol del usuario'}">
                            ${textoNuevoRol}
                        </button>
                    </div>
                </td>
                <td>
                    <div class="fecha-creacion">${fechaCreacion}</div>
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Cambia el rol de un usuario
 */
function cambiarRol(indice, nuevoRol) {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const sesionActual = JSON.parse(localStorage.getItem('sesionActual') || 'null');
    
    if (usuarios[indice]) {
        const usuarioAnterior = usuarios[indice];
        
        // Proteger la cuenta admin principal
        if (usuarioAnterior.email === 'admin.admin@admin.admin') {
            alert('⚠️ No se puede cambiar el rol de la cuenta admin principal (admin.admin@admin.admin).\n\nEsta cuenta debe permanecer como administrador.');
            return;
        }
        
        // Verificar si el usuario intenta quitarse admin a sí mismo
        if (sesionActual && usuarioAnterior.email === sesionActual.email && usuarioAnterior.role === 'admin' && nuevoRol === 'user') {
            alert('⚠️ No puedes quitarte los permisos de administrador a ti mismo.\n\nOtro administrador debe hacerlo por seguridad.');
            return;
        }
        
        const nuevoRolTexto = nuevoRol === 'admin' ? 'Administrador' : 'Usuario';
        const rolAnterior = usuarioAnterior.role === 'admin' ? 'Administrador' : 'Usuario';
        
        if (confirm(`¿Deseas cambiar el rol de ${usuarioAnterior.nombre} ${usuarioAnterior.apellido} de ${rolAnterior} a ${nuevoRolTexto}?`)) {
            usuarios[indice].role = nuevoRol;
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            // Recargar la tabla
            cargarUsuarios();
            
            alert(`✓ Rol actualizado correctamente. ${usuarioAnterior.nombre} ${usuarioAnterior.apellido} ahora es ${nuevoRolTexto}.`);
        }
    }
}

// Cargar usuarios cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});
