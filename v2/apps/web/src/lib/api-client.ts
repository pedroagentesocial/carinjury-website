import type {
  ContactForm,
  ContactFormResponse,
  PatientReferral,
  PatientReferralResponse,
  ReviewsResponse,
} from '@carinjury/shared';

// En prod, el front y los endpoints viven en el mismo dominio (Vercel functions),
// así que llamamos relativo. Si quieres apuntar a un api separado, setea
// PUBLIC_API_URL (sin slash final).
const API_PREFIX = import.meta.env.PUBLIC_API_URL ?? '';

export async function submitContactForm(
  data: ContactForm,
): Promise<ContactFormResponse> {
  const res = await fetch(`${API_PREFIX}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return (await res.json()) as ContactFormResponse;
}

export async function submitReferral(
  data: PatientReferral,
): Promise<PatientReferralResponse> {
  const res = await fetch(`${API_PREFIX}/api/referral`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return (await res.json()) as PatientReferralResponse;
}

export async function ping(): Promise<boolean> {
  try {
    const res = await fetch(`${API_PREFIX}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchReviews(): Promise<ReviewsResponse | null> {
  try {
    const res = await fetch(`${API_PREFIX}/api/reviews`);
    if (!res.ok) return null;
    return (await res.json()) as ReviewsResponse;
  } catch {
    return null;
  }
}
