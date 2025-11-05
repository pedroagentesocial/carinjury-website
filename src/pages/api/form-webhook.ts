import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Obtener los datos del formulario
    const formData = await request.formData();
    
    // Extraer todos los campos del formulario
    const data = {
      name: formData.get('name')?.toString() || '',
      email: formData.get('email')?.toString() || '',
      phone: formData.get('phone')?.toString() || '',
      discovery_source: formData.get('discovery_source')?.toString() || '',
      referral_name: formData.get('referral_name')?.toString() || '',
      message: formData.get('message')?.toString() || '',
      page: formData.get('page')?.toString() || 'Formulario principal',
      timestamp: new Date().toISOString(),
      user_agent: request.headers.get('user-agent') || '',
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    };

    // Validar campos requeridos
    if (!data.name || !data.phone) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Nombre y teléfono son campos requeridos' 
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Preparar los datos para Make.com
    const webhookData = {
      // Información del contacto
      nombre: data.name,
      email: data.email,
      telefono: data.phone,
      mensaje: data.message,
      
      // Información de origen
      como_nos_encontro: data.discovery_source,
      referido_por: data.referral_name,
      pagina_origen: data.page,
      
      // Metadatos
      fecha_envio: data.timestamp,
      user_agent: data.user_agent,
      ip_address: data.ip_address,
      
      // Información adicional para Make.com
      lead_source: 'website_form',
      form_type: 'contact_form',
      priority: 'normal'
    };

    // Enviar datos al webhook de Make.com
    const webhookUrl = 'https://hook.us1.make.com/j3f0pfymobfhtpsldmlw6hn3plmb9p5k';
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'CarInjuryClinic-Website/1.0'
      },
      body: JSON.stringify(webhookData)
    });

    // Verificar si el webhook fue exitoso
    if (!webhookResponse.ok) {
      console.error('Error en webhook de Make.com:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        url: webhookUrl
      });
      
      // Aún así retornamos éxito para no afectar la UX del usuario
      // pero loggeamos el error para debugging
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Formulario enviado correctamente',
        webhook_status: 'warning',
        webhook_error: `HTTP ${webhookResponse.status}`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Éxito completo
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Formulario enviado correctamente',
      webhook_status: 'success'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error procesando formulario:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

// Manejar otros métodos HTTP
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    error: 'Método no permitido. Use POST para enviar formularios.' 
  }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};