/**
 * Server-side reCAPTCHA v2 verification.
 *
 * Setup:
 *   - Get a v2 "I'm not a robot" Checkbox keypair from google.com/recaptcha/admin
 *   - PUBLIC_RECAPTCHA_SITE_KEY    → frontend (client) widget
 *   - RECAPTCHA_SECRET_KEY         → server verification (NOT public)
 *
 * Si RECAPTCHA_SECRET_KEY no está set en env, devolvemos true (modo dev) para no
 * bloquear desarrollo local. En prod tiene que estar set.
 */

interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

/**
 * Verifica un token de reCAPTCHA v2 contra Google.
 * Retorna `true` si pasa, `false` si falla o si Google rechaza.
 */
export async function verifyCaptcha(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  // En desarrollo (sin secret configurado) — siempre pasa
  if (!secret) {
    console.warn('[captcha] RECAPTCHA_SECRET_KEY not set — bypassing verification (dev mode)');
    return true;
  }

  if (!token || token.length < 10) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    ...(remoteIp ? { remoteip: remoteIp } : {}),
  });

  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    if (!res.ok) {
      console.error('[captcha] Google returned %d', res.status);
      return false;
    }
    const data = (await res.json()) as RecaptchaVerifyResponse;
    if (!data.success) {
      console.warn('[captcha] verification failed:', data['error-codes']);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[captcha] verification error', err);
    return false;
  }
}
