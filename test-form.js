// Script para probar el formulario automáticamente
// Ejecutar en la consola del navegador

console.log('🧪 Iniciando prueba del formulario...');

// Datos de prueba
const testData = {
    name: 'Juan Pérez',
    email: 'juan.perez@test.com',
    phone: '(385) 555-0123',
    discovery_source: 'google',
    message: 'Tuve un accidente de auto el viernes pasado y necesito ayuda médica y legal. Tengo dolor en el cuello y espalda.'
};

// Función para llenar el formulario
function fillForm() {
    console.log('📝 Llenando formulario con datos de prueba...');
    
    // Llenar campos
    const nameField = document.querySelector('input[name="name"]');
    const emailField = document.querySelector('input[name="email"]');
    const phoneField = document.querySelector('input[name="phone"]');
    const discoveryField = document.querySelector('select[name="discovery_source"]');
    const messageField = document.querySelector('textarea[name="message"]');
    
    if (nameField) {
        nameField.value = testData.name;
        nameField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Nombre llenado:', testData.name);
    }
    
    if (emailField) {
        emailField.value = testData.email;
        emailField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Email llenado:', testData.email);
    }
    
    if (phoneField) {
        phoneField.value = testData.phone;
        phoneField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Teléfono llenado:', testData.phone);
    }
    
    if (discoveryField) {
        discoveryField.value = testData.discovery_source;
        discoveryField.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Cómo nos encontraste llenado:', testData.discovery_source);
    }
    
    if (messageField) {
        messageField.value = testData.message;
        messageField.dispatchEvent(new Event('input', { bubbles: true }));
        console.log('✅ Mensaje llenado:', testData.message);
    }
    
    console.log('📋 Formulario llenado completamente');
}

// Función para probar el envío
function testSubmit() {
    console.log('🚀 Iniciando prueba de envío...');
    
    const submitBtn = document.getElementById('submit-btn');
    const successMessage = document.getElementById('success-message');
    
    if (!submitBtn) {
        console.error('❌ No se encontró el botón de envío');
        return;
    }
    
    console.log('🔍 Verificando elementos antes del envío...');
    console.log('- Botón visible:', submitBtn.style.display !== 'none');
    console.log('- Mensaje de éxito oculto:', successMessage ? successMessage.classList.contains('hidden') : 'No encontrado');
    
    // Interceptar fetch para monitorear el envío a Make.com
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        if (args[0] && args[0].includes('make.com')) {
            console.log('📡 Enviando datos a Make.com webhook:', args[0]);
            console.log('📦 Datos enviados:', args[1] ? JSON.parse(args[1].body) : 'Sin datos');
        }
        return originalFetch.apply(this, args);
    };
    
    // Hacer clic en enviar
    console.log('👆 Haciendo clic en "Enviar solicitud"...');
    submitBtn.click();
    
    // Verificar cambios inmediatos
    setTimeout(() => {
        console.log('🔍 Verificando cambios después de 100ms...');
        console.log('- Botón oculto:', submitBtn.style.display === 'none');
        console.log('- Mensaje de éxito visible:', successMessage ? !successMessage.classList.contains('hidden') : 'No encontrado');
    }, 100);
    
    // Verificar después de 3 segundos
    setTimeout(() => {
        console.log('🔍 Verificando después de 3 segundos...');
        const modal = document.getElementById('thank-you-modal');
        console.log('- Modal visible:', modal ? !modal.classList.contains('hidden') : 'No encontrado');
        console.log('- Formulario reseteado:', document.querySelector('input[name="name"]')?.value === '');
    }, 3100);
    
    // Restaurar fetch original
    setTimeout(() => {
        window.fetch = originalFetch;
        console.log('✅ Prueba completada');
    }, 4000);
}

// Ejecutar prueba completa
function runFullTest() {
    console.log('🎯 Ejecutando prueba completa del formulario...');
    fillForm();
    
    setTimeout(() => {
        testSubmit();
    }, 1000);
}

// Exportar funciones para uso manual
window.testForm = {
    fillForm,
    testSubmit,
    runFullTest,
    testData
};

console.log('✅ Script de prueba cargado. Usa window.testForm.runFullTest() para ejecutar la prueba completa');