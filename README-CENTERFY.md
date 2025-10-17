# Widget de Chat Centerfy.ai

## Descripción

Widget de chat inteligente integrado con Centerfy.ai para proporcionar asistencia virtual personalizada con capacidades de streaming, gestión de conversaciones y derivación a humanos.

## Características Principales

### 🤖 Integración Centerfy.ai
- SDK completo con soporte de streaming
- Persistencia por conversationId
- Idioma por defecto: es-MX
- Fallback a respuestas locales

### 💬 Gestión de Conversaciones
- Iniciar nueva conversación
- Reiniciar conversación actual
- Terminar conversación
- Historial de últimas 5 conversaciones
- Estados: abierta/cerrada

### 🎨 UI/UX Tipo Mensajería
- Widget flotante responsive
- Burbujas diferenciadas (usuario/bot)
- Paleta de colores de marca
- Animaciones suaves
- Estados de carga y escritura

### ⚡ Botones de Acción Rápida
- Servicios
- Horarios
- ¿Cómo empezar?
- Precios/Cotizar
- Contactar
- Hablar con humano
- Nueva conversación

### ♿ Accesibilidad
- Contraste AA
- Navegación por teclado
- Roles ARIA
- Tamaños mínimos 44x44px
- Soporte prefers-reduced-motion

## Configuración

### 1. Variables de Entorno

Crea o actualiza el archivo `.env` en la raíz del proyecto:

```env
# Configuración de Centerfy.ai
CENTERFY_PROJECT_ID=tu_project_id_aqui
CENTERFY_API_KEY=tu_api_key_aqui
```

### 2. Obtener Credenciales

1. Regístrate en [Centerfy.ai](https://centerfy.ai)
2. Crea un nuevo proyecto
3. Obtén tu PROJECT_ID y API_KEY
4. Actualiza las variables de entorno

### 3. Configuración del Knowledge Base

El widget incluye respuestas predefinidas para:
- **Servicios**: Descripción de servicios legales
- **Horarios**: Días y horas de atención
- **Proceso**: Pasos para empezar (diagnóstico → propuesta → ejecución → seguimiento)
- **Precios**: Información de costos y cotizaciones
- **Contacto**: WhatsApp, email, teléfono
- **Escalamiento**: Derivación a humanos

## Uso

### Funciones Principales

```javascript
// Abrir widget
centerfyChat.openWidget();

// Minimizar widget
centerfyChat.minimizeWidget();

// Iniciar nueva conversación
centerfyChat.startConversation();

// Reiniciar conversación actual
centerfyChat.resetConversation();

// Terminar conversación
centerfyChat.endConversation();
```

### Navegación por Teclado

- **Escape**: Minimizar widget
- **Enter**: Enviar mensaje
- **Shift + Enter**: Nueva línea
- **Tab**: Navegar entre elementos

### Personalidad del Asistente

- ✅ Voz clara, útil y optimista
- ✅ Sin jerga técnica
- ✅ Respuestas: frase clave + pasos + CTA
- ❌ **PROHIBIDO**: Presentarse como asesor legal/financiero
- 🔄 Derivación: "Para asesoría profesional te conecto con nuestro equipo"

## Paleta de Colores

```css
:root {
  --color-bot: #0ea5e9;           /* Azul bot */
  --color-bot-text: #fff;         /* Texto bot */
  --color-user: #e5f2fb;          /* Fondo usuario */
  --color-user-text: #0b3b5e;     /* Texto usuario */
  --color-cta: #16a34a;           /* Botones CTA */
  --color-cta-text: #fff;         /* Texto CTA */
  --color-bg: #fff;               /* Fondo general */
  --color-border: #e6e6e6;        /* Bordes */
}
```

## Estructura de Archivos

```
src/components/
└── CenterfyChat.astro          # Widget principal
.env                            # Variables de entorno
README-CENTERFY.md             # Esta documentación
```

## Integración en Páginas

```astro
---
// En cualquier página .astro
import CenterfyChat from '../components/CenterfyChat.astro';
---

<html>
  <body>
    <!-- Tu contenido -->
    
    <!-- Widget de chat -->
    <CenterfyChat />
  </body>
</html>
```

## Troubleshooting

### Error: "PROJECT_ID no definido"
- Verifica que las variables de entorno estén configuradas
- Reinicia el servidor de desarrollo

### Error: "API Key inválida"
- Confirma que el API_KEY sea correcto
- Verifica permisos en el dashboard de Centerfy.ai

### Widget no aparece
- Verifica que el componente esté importado
- Revisa la consola del navegador por errores

### Streaming no funciona
- Confirma que tu plan de Centerfy.ai soporte streaming
- El widget tiene fallback a respuestas estáticas

## Soporte

Para soporte técnico:
1. Revisa los logs de la consola
2. Verifica la configuración de variables de entorno
3. Consulta la documentación de Centerfy.ai
4. Contacta al equipo de desarrollo

## Licencia

Este widget está diseñado específicamente para la integración con Centerfy.ai y sigue las mejores prácticas de accesibilidad y UX.