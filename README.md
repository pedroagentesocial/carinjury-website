# CarInjury - Sitio Web con Chat Inteligente

Sitio web profesional para servicios legales con widget de chat inteligente integrado con Centerfy.ai.

## ✨ Características

- 🤖 **Chat Inteligente**: Widget con IA integrada (Centerfy.ai)
- 💬 **Gestión de Conversaciones**: Múltiples conversaciones, historial, persistencia
- 🎨 **UI Moderna**: Diseño tipo mensajería con burbujas y animaciones
- ♿ **Accesible**: Cumple estándares AA, navegación por teclado
- 📱 **Responsive**: Optimizado para desktop y móvil
- ⚡ **Acciones Rápidas**: Botones FAQ para consultas comunes

## 🚀 Estructura del Proyecto

```text
/
├── public/                     # Archivos estáticos
├── src/
│   ├── components/
│   │   └── CenterfyChat.astro  # Widget de chat inteligente
│   ├── pages/
│   │   └── index.astro         # Página principal
│   └── layouts/                # Layouts base
├── .env                        # Variables de entorno (Centerfy.ai)
├── README-CENTERFY.md          # Documentación del chat
└── package.json
```

### Componentes Principales

- **CenterfyChat.astro**: Widget de chat con IA integrada
- **index.astro**: Página principal con chat incluido
- **.env**: Configuración de Centerfy.ai (PROJECT_ID, API_KEY)

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Comando                   | Acción                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                             |
| `npm run dev`             | Inicia servidor local en `localhost:4321`       |
| `npm run build`           | Construye el sitio para producción              |
| `npm run preview`         | Previsualiza la build localmente                |
| `npm run astro ...`       | Ejecuta comandos CLI de Astro                   |
| `npm run astro -- --help` | Ayuda del CLI de Astro                          |

## ⚙️ Configuración del Chat

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz:

```env
CENTERFY_PROJECT_ID=tu_project_id
CENTERFY_API_KEY=tu_api_key
```

### 2. Funcionalidades del Chat

- **Intents**: servicios, horarios, proceso, precios, contacto
- **Acciones**: nueva conversación, reiniciar, derivar a humano
- **UI**: burbujas diferenciadas, botones rápidos, estados de carga
- **Accesibilidad**: navegación por teclado, contraste AA, ARIA

### 3. Personalidad

- Voz clara, útil y optimista
- **PROHIBIDO**: presentarse como asesor legal
- Derivación: "Para asesoría profesional te conecto con nuestro equipo"

📖 **Documentación completa**: Ver `README-CENTERFY.md`

## 📚 Recursos

- 📖 [Documentación del Chat](./README-CENTERFY.md)
- 🤖 [Centerfy.ai](https://centerfy.ai)
- 🚀 [Documentación de Astro](https://docs.astro.build)
- 💬 [Discord de Astro](https://astro.build/chat)

## 🎯 Criterios de Aceptación

- ✅ Widget visible, minimizable y reabrible
- ✅ Funciones de conversación operativas
- ✅ Burbujas con colores de marca
- ✅ Tono definido, sin alegar ser asistente legal
- ✅ Fallback y derivación a humano
- ✅ Accesibilidad AA completa
- ✅ Soporte streaming con Centerfy.ai
- ✅ Persistencia de conversaciones
- ✅ Botones de acción rápida (FAQ)
