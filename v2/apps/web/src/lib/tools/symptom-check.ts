import type { IconName } from '@components/ui/Icon';

/**
 * Auto-chequeo de síntomas post-accidente — ORIENTACIÓN EDUCATIVA, no un
 * diagnóstico. Fuente única para el componente.
 *
 * SEGURIDAD (no negociable): la herramienta NO descarta lesiones ni dice que
 * alguien "está bien". Si se marca cualquier RED FLAG, el resultado es de
 * emergencia (911/urgencias), prominente y primero; el CTA de la clínica nunca
 * se presenta como alternativa a la emergencia.
 *
 * Sin cifras/porcentajes/datos clínicos o legales inventados. Donde haga falta un
 * dato verificable, usar `{{VERIFICAR: ...}}`. Texto revisable por un profesional.
 */

interface Loc {
  es: string;
  en: string;
}

export interface SymptomItem {
  id: string;
  es: string;
  en: string;
}

/* ===================== RED FLAGS (síntomas de alarma) ===================== */
export const RED_FLAGS: SymptomItem[] = [
  { id: 'loss-consciousness', es: 'Perdí el conocimiento (me desmayé)', en: 'I lost consciousness (passed out)' },
  { id: 'confusion', es: 'Confusión o desorientación', en: 'Confusion or disorientation' },
  { id: 'severe-headache', es: 'Dolor de cabeza intenso o que empeora', en: 'Severe or worsening headache' },
  { id: 'vision', es: 'Visión borrosa o doble', en: 'Blurred or double vision' },
  { id: 'numbness', es: 'Entumecimiento u hormigueo', en: 'Numbness or tingling' },
  { id: 'weakness', es: 'Debilidad en brazos o piernas', en: 'Weakness in arms or legs' },
  { id: 'severe-neck', es: 'Dolor de cuello intenso', en: 'Severe neck pain' },
  { id: 'breathing', es: 'Dificultad para respirar', en: 'Difficulty breathing' },
  { id: 'chest-pain', es: 'Dolor de pecho', en: 'Chest pain' },
  { id: 'vomiting', es: 'Vómito', en: 'Vomiting' },
  { id: 'bleeding', es: 'Sangrado que no se detiene', en: 'Bleeding that won’t stop' },
];

/* ===================== CATEGORÍAS (síntomas leves/moderados) ===================== */
export interface SymptomCategory {
  id: string;
  icon: IconName;
  title: Loc;
  /** Nota educativa breve (sin cifras). */
  note: Loc;
  items: SymptomItem[];
}

export const CATEGORIES: SymptomCategory[] = [
  {
    id: 'head-neck',
    icon: 'stethoscope',
    title: { es: 'Cabeza y cuello', en: 'Head and neck' },
    note: {
      es: 'El cuello absorbe gran parte del impacto; las molestias pueden tardar en notarse.',
      en: 'The neck absorbs much of the impact; discomfort can take time to appear.',
    },
    items: [
      { id: 'neck-pain', es: 'Dolor de cuello leve a moderado', en: 'Mild to moderate neck pain' },
      { id: 'neck-stiff', es: 'Rigidez en el cuello', en: 'Neck stiffness' },
      { id: 'mild-headache', es: 'Dolor de cabeza leve', en: 'Mild headache' },
      { id: 'jaw', es: 'Dolor de mandíbula', en: 'Jaw pain' },
      { id: 'ringing', es: 'Zumbido en los oídos', en: 'Ringing in the ears' },
    ],
  },
  {
    id: 'back',
    icon: 'shield',
    title: { es: 'Espalda', en: 'Back' },
    note: {
      es: 'El dolor de espalda tras un choque puede aparecer al día siguiente.',
      en: 'Back pain after a crash can show up the next day.',
    },
    items: [
      { id: 'low-back', es: 'Dolor de espalda baja', en: 'Lower back pain' },
      { id: 'upper-back', es: 'Dolor de espalda alta', en: 'Upper back pain' },
      { id: 'spasms', es: 'Rigidez o espasmos', en: 'Stiffness or spasms' },
      { id: 'pain-moving', es: 'Dolor al agacharte o girar', en: 'Pain when bending or turning' },
    ],
  },
  {
    id: 'limbs',
    icon: 'check',
    title: { es: 'Brazos y piernas', en: 'Arms and legs' },
    note: {
      es: 'Golpes y torceduras en articulaciones son comunes en una colisión.',
      en: 'Joint bumps and strains are common in a collision.',
    },
    items: [
      { id: 'shoulder', es: 'Dolor de hombro', en: 'Shoulder pain' },
      { id: 'knee', es: 'Dolor de rodilla', en: 'Knee pain' },
      { id: 'joint', es: 'Dolor o rigidez en articulaciones', en: 'Joint pain or stiffness' },
      { id: 'bruising', es: 'Moretones o hinchazón', en: 'Bruising or swelling' },
    ],
  },
  {
    id: 'general',
    icon: 'sparkles',
    title: { es: 'Generales', en: 'General' },
    note: {
      es: 'Mareo, náusea o fatiga pueden ser señales que conviene revisar.',
      en: 'Dizziness, nausea or fatigue can be signs worth checking.',
    },
    items: [
      { id: 'dizziness', es: 'Mareo', en: 'Dizziness' },
      { id: 'nausea', es: 'Náusea', en: 'Nausea' },
      { id: 'fatigue', es: 'Fatiga o cansancio', en: 'Fatigue or tiredness' },
      { id: 'sleep', es: 'Dificultad para dormir', en: 'Trouble sleeping' },
    ],
  },
  {
    id: 'emotional',
    icon: 'help',
    title: { es: 'Emocionales', en: 'Emotional' },
    note: {
      es: 'Es normal sentir ansiedad o nerviosismo después de un accidente.',
      en: 'It’s normal to feel anxiety or nervousness after an accident.',
    },
    items: [
      { id: 'anxiety', es: 'Ansiedad o nerviosismo', en: 'Anxiety or nervousness' },
      { id: 'driving-fear', es: 'Miedo o nervios al subir al auto', en: 'Fear or nerves about getting in a car' },
      { id: 'insomnia', es: 'Insomnio', en: 'Insomnia' },
      { id: 'mood', es: 'Irritabilidad o cambios de ánimo', en: 'Irritability or mood changes' },
    ],
  },
];

/* ===================== Preguntas de cierre (single-select) ===================== */
export interface SingleQuestion {
  id: string;
  icon: IconName;
  question: Loc;
  options: SymptomItem[];
}

export const TIMING: SingleQuestion = {
  id: 'timing',
  icon: 'clock',
  question: { es: '¿Hace cuánto fue el accidente?', en: 'How long ago was the accident?' },
  options: [
    { id: 'today', es: 'Hoy', en: 'Today' },
    { id: 'this-week', es: 'Esta semana', en: 'This week' },
    { id: 'this-month', es: 'Este mes', en: 'This month' },
    { id: 'over-month', es: 'Hace más de un mes', en: 'More than a month ago' },
  ],
};

export const CARE: SingleQuestion = {
  id: 'care',
  icon: 'stethoscope',
  question: { es: '¿Ya recibiste atención médica?', en: 'Have you received medical care yet?' },
  options: [
    { id: 'yes-soon', es: 'Sí, pronto tras el accidente', en: 'Yes, soon after the accident' },
    { id: 'yes-late', es: 'Sí, pero días después', en: 'Yes, but days later' },
    { id: 'not-yet', es: 'Aún no', en: 'Not yet' },
    { id: 'no', es: 'No', en: 'No' },
  ],
};

/* ===================== Educación: latigazo tardío ===================== */
export const WHIPLASH: { title: Loc; body: Loc } = {
  title: { es: 'Por qué no conviene esperar', en: 'Why it’s best not to wait' },
  body: {
    es: 'Después de un choque, muchos síntomas no aparecen de inmediato. El latigazo cervical y otras lesiones pueden manifestarse horas o días después, cuando baja la adrenalina. Por eso conviene evaluarse pronto, aunque al principio “no duela”.',
    en: 'After a crash, many symptoms don’t show up right away. Whiplash and other injuries can appear hours or days later, once the adrenaline wears off. That’s why it’s worth getting checked soon, even if it “doesn’t hurt” at first.',
  },
};

/* ===================== Resultado ===================== */
export const RESULT = {
  emergency: {
    title: { es: 'Busca atención médica de emergencia AHORA', en: 'Get emergency medical care NOW' },
    body: {
      es: 'Marcaste uno o más síntomas que pueden ser graves. Llama al 911 o ve a la sala de emergencias más cercana de inmediato. No conduzcas tú mismo si te sientes mal.',
      en: 'You checked one or more symptoms that can be serious. Call 911 or go to the nearest emergency room right away. Don’t drive yourself if you feel unwell.',
    },
    /** Línea de seguimiento subordinada (sin botones, nunca como alternativa). */
    followup: {
      es: 'Cuando estés fuera de peligro y un médico te haya evaluado, podemos ayudarte con el seguimiento de tu recuperación.',
      en: 'Once you’re out of danger and a doctor has evaluated you, we can help with the follow-up of your recovery.',
    },
  },
  guidance: {
    title: {
      es: 'Tienes síntomas que conviene que un profesional revise pronto',
      en: 'You have symptoms a professional should review soon',
    },
    /** Variante si no marcó ningún síntoma (nunca decir "estás bien"). */
    titleNoSymptoms: {
      es: 'Aunque ahora no notes síntomas, conviene una evaluación',
      en: 'Even if you don’t notice symptoms now, an evaluation is worth it',
    },
    body: {
      es: 'Una evaluación temprana cuida tu salud y, si fue un accidente, deja constancia de tus lesiones. La consulta inicial es gratuita y sin compromiso.',
      en: 'An early evaluation protects your health and, if it was an accident, documents your injuries. The initial consultation is free and with no obligation.',
    },
  },
  disclaimer: {
    es: 'Esta herramienta es solo orientación educativa, no un diagnóstico ni asesoría médica, y no descarta lesiones. Ante cualquier duda, o si tus síntomas empeoran, busca atención médica profesional.',
    en: 'This tool is educational guidance only, not a diagnosis or medical advice, and it does not rule out injuries. If you have any doubt, or if your symptoms worsen, seek professional medical care.',
  },
};
