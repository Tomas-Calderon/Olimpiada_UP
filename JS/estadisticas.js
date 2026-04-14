// ==================== FUNCIONALIDAD DE ESTADÍSTICAS ====================

document.addEventListener('DOMContentLoaded', () => {
    calcularEstadisticas();

    function calcularEstadisticas() {
        const productos = JSON.parse(localStorage.getItem('productos')) || [];

        const productosTotales = productos.length;
        const productosSinStock = productos.filter(p => p.stock === 0).length;
        const precioTotalStock = productos.reduce((total, p) => {
            return total + (p.precio * p.stock);
        }, 0);

        document.getElementById('productos-totales').textContent = productosTotales;
        document.getElementById('productos-sin-stock').textContent = productosSinStock;
        document.getElementById('precio-total-stock').textContent = `$${precioTotalStock.toFixed(2)}`;
    }
});