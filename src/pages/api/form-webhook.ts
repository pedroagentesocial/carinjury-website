import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    let recaptchaToken = '';
    let data: {
      name: string;
      email: string;
      phone: string;
      discovery_source: string;
      referral_name: string;
      message: string;
      page: string;
      timestamp: string;
      user_agent: string;
      ip_address: string;
    };

    try {
      const json = await request.clone().json();
      recaptchaToken = (json['g-recaptcha-response'] || json.recaptcha_token || '').toString();
      data = {
        name: (json.name || json.nombre || '').toString(),
        email: (json.email || '').toString(),
        phone: (json.phone || json.telefono || '').toString(),
        discovery_source: (json.discovery_source || json.como_nos_encontro || '').toString(),
        referral_name: (json.referral_name || json.referido_por || '').toString(),
        message: (json.message || json.mensaje || '').toString(),
        page: (json.page || json.pagina_origen || 'Formulario principal').toString(),
        timestamp: new Date().toISOString(),
        user_agent: '',
        ip_address: 'unknown'
      };
    } catch {
      try {
        const formData = await request.clone().formData();
        recaptchaToken = formData.get('g-recaptcha-response')?.toString() || formData.get('recaptcha_token')?.toString() || '';
        data = {
          name: formData.get('name')?.toString() || '',
          email: formData.get('email')?.toString() || '',
          phone: formData.get('phone')?.toString() || '',
          discovery_source: formData.get('discovery_source')?.toString() || '',
          referral_name: formData.get('referral_name')?.toString() || '',
          message: formData.get('message')?.toString() || '',
          page: formData.get('page')?.toString() || 'Formulario principal',
          timestamp: new Date().toISOString(),
          user_agent: '',
          ip_address: 'unknown'
        };
      } catch {
        const text = await request.clone().text();
        let parsed: any = {};
        try {
          parsed = JSON.parse(text);
        } catch {
          const params = new URLSearchParams(text);
          parsed = Object.fromEntries(params.entries());
        }
        recaptchaToken = (parsed['g-recaptcha-response'] || parsed.recaptcha_token || '').toString();
        data = {
          name: (parsed.name || parsed.nombre || '').toString(),
          email: (parsed.email || '').toString(),
          phone: (parsed.phone || parsed.telefono || '').toString(),
          discovery_source: (parsed.discovery_source || parsed.como_nos_encontro || '').toString(),
          referral_name: (parsed.referral_name || parsed.referido_por || '').toString(),
          message: (parsed.message || parsed.mensaje || '').toString(),
          page: (parsed.page || parsed.pagina_origen || 'Formulario principal').toString(),
          timestamp: new Date().toISOString(),
          user_agent: '',
          ip_address: 'unknown'
        };
      }
    }

    // Bloqueo silencioso por honeypot (evita ruido de bots)
    try {
      const hp = await request.clone().formData();
      const honey = (hp.get('_honey') || hp.get('company') || '').toString().trim();
      if (honey) {
        return new Response(JSON.stringify({ success: true, ignored: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } catch {
      // Si no viene como form-data seguimos con validación normal.
    }

    // reCAPTCHA SIEMPRE obligatorio en backend
    const recaptchaSecret = (import.meta.env.RECAPTCHA_SECRET_KEY || '').toString();
    if (!recaptchaSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Captcha backend no configurado'
      }), { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
    if (!recaptchaToken) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Captcha requerido'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const verifyBody = new URLSearchParams({
      secret: recaptchaSecret,
      response: recaptchaToken
    });
    const verifyResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyBody.toString()
    });
    const verifyData: any = await verifyResponse.json();
    if (!verifyData?.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Captcha inválido'
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // Validar hostname reportado por Google para mitigar tokens reutilizados
    const requestHost = new URL(request.url).hostname;
    const configuredHost = (import.meta.env.PUBLIC_SITE_HOST || '').toString().trim();
    const allowedHosts = [requestHost, configuredHost].filter(Boolean);
    if (verifyData.hostname && allowedHosts.length > 0) {
      const okHost = allowedHosts.some((h) => verifyData.hostname === h || verifyData.hostname.endsWith(`.${h}`));
      if (!okHost) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Captcha hostname inválido'
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
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

      // Información del seguro (si existe)
      seguro_nombre: (typeof (globalThis as any).FormData !== 'undefined' ? '' : ''),
      seguro_numero_poliza: '',
      seguro_telefono: '',
      ajustador_nombre: '',
      ajustador_telefono: '',
      ajustador_email: '',
      numero_reclamo: '',

      // Información legal (si existe)
      abogado_firma: '',
      abogado_telefono: '',
      paralegal_nombre: '',
      paralegal_telefono: '',
      paralegal_email: '',

      // Metadatos
      fecha_envio: data.timestamp,
      user_agent: data.user_agent,
      ip_address: data.ip_address,
      
      // Información adicional para Make.com
      lead_source: 'website_form',
      form_type: 'contact_form',
      priority: 'normal'
    };

    try {
      const f = await request.clone().formData();
      webhookData.seguro_nombre = f.get('insurance_name')?.toString() || '';
      webhookData.seguro_numero_poliza = f.get('insurance_policy_number')?.toString() || '';
      webhookData.seguro_telefono = f.get('insurance_phone')?.toString() || '';
      webhookData.ajustador_nombre = f.get('adjuster_name')?.toString() || '';
      webhookData.ajustador_telefono = f.get('adjuster_phone')?.toString() || '';
      webhookData.ajustador_email = f.get('adjuster_email')?.toString() || '';
      webhookData.numero_reclamo = f.get('claim_number')?.toString() || '';

      webhookData.abogado_firma = f.get('lawyer_firm_name')?.toString() || '';
      webhookData.abogado_telefono = f.get('lawyer_phone')?.toString() || '';
      webhookData.paralegal_nombre = f.get('paralegal_name')?.toString() || '';
      webhookData.paralegal_telefono = f.get('paralegal_phone')?.toString() || '';
      webhookData.paralegal_email = f.get('paralegal_email')?.toString() || '';
    } catch {
      try {
        const j = await request.clone().json();
        webhookData.seguro_nombre = (j.insurance_name || '').toString();
        webhookData.seguro_numero_poliza = (j.insurance_policy_number || '').toString();
        webhookData.seguro_telefono = (j.insurance_phone || '').toString();
        webhookData.ajustador_nombre = (j.adjuster_name || '').toString();
        webhookData.ajustador_telefono = (j.adjuster_phone || '').toString();
        webhookData.ajustador_email = (j.adjuster_email || '').toString();
        webhookData.numero_reclamo = (j.claim_number || '').toString();

        webhookData.abogado_firma = (j.lawyer_firm_name || '').toString();
        webhookData.abogado_telefono = (j.lawyer_phone || '').toString();
        webhookData.paralegal_nombre = (j.paralegal_name || '').toString();
        webhookData.paralegal_telefono = (j.paralegal_phone || '').toString();
        webhookData.paralegal_email = (j.paralegal_email || '').toString();
      } catch {
        const t = await request.clone().text();
        const params = new URLSearchParams(t);
        webhookData.seguro_nombre = params.get('insurance_name') || '';
        webhookData.seguro_numero_poliza = params.get('insurance_policy_number') || '';
        webhookData.seguro_telefono = params.get('insurance_phone') || '';
        webhookData.ajustador_nombre = params.get('adjuster_name') || '';
        webhookData.ajustador_telefono = params.get('adjuster_phone') || '';
        webhookData.ajustador_email = params.get('adjuster_email') || '';
        webhookData.numero_reclamo = params.get('claim_number') || '';

        webhookData.abogado_firma = params.get('lawyer_firm_name') || '';
        webhookData.abogado_telefono = params.get('lawyer_phone') || '';
        webhookData.paralegal_nombre = params.get('paralegal_name') || '';
        webhookData.paralegal_telefono = params.get('paralegal_phone') || '';
        webhookData.paralegal_email = params.get('paralegal_email') || '';
      }
    }

    const webhookUrl = 'https://services.leadconnectorhq.com/hooks/FrwO37FXAUYfoOh92uWG/webhook-trigger/82ea1b33-b09f-47a0-91c7-f18036c6d359';
    
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
