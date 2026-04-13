# 📋 Panel de Administración - Sport Port

## 🎯 Descripción General

Se ha implementado un **panel de administración completo** para gestionar los productos de la tienda Sport Port. El sistema permite crear, editar, eliminar y consultar productos con todas las validaciones necesarias.

---

## 🚀 Características Implementadas

### 1. ✅ Panel de Administración (`admin.html`)
- **Acceso seguro** con autenticación por contraseña
- **Interfaz moderna** con navegación lateral (sidebar)
- **Tres secciones principales:**
  - 📦 **Gestionar Productos** - Visualizar todos los productos
  - ➕ **Agregar Producto** - Crear nuevos productos
  - 📊 **Estadísticas** - Ver métricas del inventario

### 2. ✅ Formulario de Agregar Producto
El formulario incluye los siguientes campos:

**Campos obligatorios:**
- 📝 **Nombre del Producto** - Validación de nombre único
- 📄 **Descripción** - Texto detallado del producto
- 💰 **Precio** - Validado como número positivo
- 📦 **Stock** - Cantidad disponible
- 🖼️ **Imágenes** - Múltiples imágenes (drag & drop)

**Campos opcionales:**
- 🏷️ **Precio Anterior** - Para mostrar descuentos

### 3. ✅ Validaciones

#### Nombre Único
```
❌ Si intentas agregar un producto con un nombre que ya existe,
   se mostrará el mensaje: "Este nombre de producto ya existe. 
   Por favor elige otro."
```

#### Validación de Campos
- Todos los campos obligatorios deben completarse
- El precio debe ser un número positivo
- Se requiere al menos una imagen
- El stock no puede ser negativo

### 4. ✅ Gestión de Imágenes

**Características:**
- **Múltiples imágenes** por producto
- **Drag & drop** para subir imágenes fácilmente
- **Vista previa** de imágenes antes de guardar
- **Eliminar imágenes** individuales del formulario
- **Almacenamiento** en formato Base64 (compatible con localStorage)

### 5. ✅ Operaciones CRUD

#### Crear (Create)
```
1. Ir a "Agregar Producto"
2. Completar el formulario
3. Hacer clic en "Guardar Producto"
4. Se mostrará confirmación: "✅ Producto agregado correctamente"
```

#### Leer (Read)
```
1. Ir a "Gestionar Productos"
2. Ver todos los productos en tarjetas
3. Información mostrada:
   - Imagen principal
   - Nombre
   - Descripción (preview)
   - Precio
   - Cantidad en stock
   - Número de imágenes
```

#### Actualizar (Update)
```
1. En "Gestionar Productos", hacer clic en "✏️ Editar"
2. Modificar los datos deseados:
   - Nombre
   - Descripción
   - Precio
   - Stock
3. Hacer clic en "Guardar Cambios"
```

#### Eliminar (Delete)
```
1. En "Gestionar Productos", hacer clic en "🗑️ Eliminar"
2. Confirmar la eliminación en el modal
3. El producto se eliminará del sistema
```

### 6. ✅ Estadísticas Dashboard

El panel muestra en tiempo real:
- 📊 **Total de Productos** - Cantidad total de artículos
- ✅ **Productos con Stock** - Disponibles para venta
- ❌ **Productos sin Stock** - Productos agotados
- 💵 **Valor Total en Stock** - Inversión total (precio × cantidad)

---

## 🔐 Acceso al Panel

### Desde main.html
1. Busca el botón **⚙️ Admin** en la esquina superior derecha
2. Haz clic para acceder al panel
3. Ingresa la contraseña cuando se solicite

### Contraseña por Defecto
```
usuario: (no requiere usuario)
contraseña: admin123
```

⚠️ **Nota Importante:** En producción, esto debe cambiarse a un sistema de autenticación seguro.

---

## 💾 Base de Datos

### Almacenamiento: localStorage
Los productos se guardan automáticamente en `localStorage` del navegador:
- **Clave:** `productos`
- **Formato:** JSON
- **Persiste:** En todos los usos del navegador (mismo dispositivo, mismo navegador)

### Estructura de un Producto
```json
{
  "id": 1234567890,
  "nombre": "Zapatillas Running Pro",
  "descripcion": "Zapatillas premium...",
  "precio": 89.99,
  "precioAnterior": 129.99,
  "stock": 15,
  "imagenes": ["data:image/png;base64,..."],
  "fechaCreacion": "2026-04-13T10:30:00.000Z"
}
```

---

## 🎨 Interfaz de Usuario

### Diseño Responsivo
- ✅ Desktop (ancho completo)
- ✅ Tablet (navegación horizontal)
- ✅ Móvil (menú colapsable)

### Temas de Color
- **Amarillo (#f6ee10):** Colores de acento, botones principales
- **Gris (#222):** Fondo del sidebar
- **Blanco:** Contenido y campos de entrada

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Agregar Producto
```
1. Haz clic en "➕ Agregar Producto"
2. Completa el formulario:
   - Nombre: "Banda Elástica Premium"
   - Descripción: "Banda elástica para entrenamiento..."
   - Precio: 24.99
   - Stock: 50
3. Sube 2-3 imágenes
4. Haz clic en "Guardar Producto"
5. ¡Listo! El producto aparecerá en la lista
```

### Ejemplo 2: Intentar Duplicar Nombre
```
1. Intenta agregar un producto con nombre: "Banda Elástica Premium"
2. Si ya existe, verás: "❌ Este nombre de producto ya existe..."
3. Cambia el nombre por algo único
4. Intenta nuevamente
```

### Ejemplo 3: Editar Producto
```
1. Ve a "Gestionar Productos"
2. Haz clic en "✏️ Editar" en la tarjeta del producto
3. Modifica el precio o el stock
4. Haz clic en "Guardar Cambios"
5. Los cambios se reflejarán inmediatamente
```

---

## 🛠️ Funciones Adicionales (Avanzadas)

### Exportar Productos (Disponible en consola)
```javascript
// En la consola del navegador (F12):
exportarProductos();

// Descargará un archivo JSON con todos los productos
```

### Cargar Datos de Ejemplo
```javascript
// En la consola del navegador:
cargarDatosEjemplo();

// Agregará 2 productos de prueba
```

---

## 📋 Checklist de Requisitos

- ✅ Panel de administración con botón "Agregar producto"
- ✅ Página nueva (`admin.html`)
- ✅ Campos: nombre, descripción, imagen
- ✅ Soporte para múltiples imágenes
- ✅ Guardar productos en base de datos (localStorage)
- ✅ Validación de nombres únicos
- ✅ Mensaje de error para nombres duplicados
- ✅ Sistema CRUD completo (Crear, Leer, Actualizar, Eliminar)
- ✅ Estadísticas de productos
- ✅ Interfaz responsiva

---

## 🔄 Flujo de Datos

```
Usuario → admin.html
    ↓
Ingresa formulario → admin.js (valida)
    ↓
    ├→ ¿Nombre duplicado? → Muestra error
    └→ ✅ Válido → Procesa imágenes (Base64)
        ↓
    Almacena en localStorage
        ↓
    Actualiza UI automáticamente
        ↓
    Muestra confirmación ✅
```

---

## 🚨 Notas Importantes

1. **localStorage es local:** Los datos se guardan solo en el navegador actual
2. **Capacidad limitada:** Máximo ~5-10MB por dominio
3. **Imágenes Base64:** Aumentan el tamaño de almacenamiento
4. **Contraseña débil:** Cambiar en producción por autenticación real
5. **Sin sincronización:** No hay sincronización entre dispositivos

---

## 📱 Soporte Técnico

### Problemas Comunes

**P: No veo el botón "Admin" en el header**
R: Verifica que hayas actualizado `main.html` correctamente

**P: La contraseña no funciona**
R: La contraseña por defecto es `admin123`. Verifica mayúsculas/minúsculas

**P: Las imágenes no se muestran**
R: Asegúrate de que el navegador soporte Base64. Los navegadores modernos lo hacen

**P: Perdí mis productos al cambiar de navegador**
R: localStorage es específico de cada navegador. Usa exportarProductos() para hacer backup

---

## 📞 Próximas Mejoras

- [ ] Autenticación con base de datos real
- [ ] Sincronización con servidor
- [ ] Búsqueda y filtrado de productos
- [ ] Categorías de productos
- [ ] Historial de cambios
- [ ] Reportes avanzados
- [ ] Integración con carrito de compras

---

**¡El panel de administración está listo para usar!** 🎉
