import type { IconName } from '@components/ui/Icon';

/**
 * Herramienta "¿Tengo un caso?" — evaluación CUALITATIVA, no una calculadora.
 *
 * REGLAS (no negociables): cero montos en dólares, cero promesas de resultado o
 * probabilidad, cero fórmulas/estadísticas. El resultado siempre orienta a una
 * evaluación profesional GRATUITA. Datos legales → `{{VERIFICAR CON ABOGADO: …}}`.
 *
 * Fuente única para el componente. Texto bilingüe es-US / en.
 */

interface Loc {
  es: string;
  en: string;
}

export interface CaseOption {
  value: string;
  es: string;
  en: string;
}

export interface CaseStep {
  id: string;
  icon: IconName;
  question: Loc;
  /** Micro-explicación educativa de POR QUÉ importa (sin cifras ni promesas). */
  why: Loc;
  options: CaseOption[];
}

export const CASE_STEPS: CaseStep[] = [
  {
    id: 'accident-type',
    icon: 'car',
    question: { es: '¿Qué tipo de accidente tuviste?', en: 'What type of accident were you in?' },
    why: {
      es: 'El tipo de accidente cambia cómo se documenta y se maneja tu caso.',
      en: 'The type of accident changes how your case is documented and handled.',
    },
    options: [
      { value: 'car', es: 'Choque de auto', en: 'Car crash' },
      { value: 'pedestrian', es: 'Como peatón', en: 'As a pedestrian' },
      { value: 'bicycle', es: 'En bicicleta', en: 'On a bicycle' },
      { value: 'motorcycle', es: 'En motocicleta', en: 'On a motorcycle' },
      { value: 'passenger', es: 'Era pasajero', en: 'I was a passenger' },
      { value: 'other', es: 'Otro', en: 'Other' },
    ],
  },
  {
    id: 'injuries',
    icon: 'stethoscope',
    question: { es: '¿Hubo lesiones?', en: 'Were there any injuries?' },
    why: {
      es: 'Las lesiones son el centro de cualquier caso. Algunas, como el latigazo, aparecen días después.',
      en: 'Injuries are central to any case. Some, like whiplash, show up days later.',
    },
    options: [
      { value: 'yes', es: 'Sí', en: 'Yes' },
      { value: 'no', es: 'No', en: 'No' },
      { value: 'unsure', es: 'No estoy seguro', en: 'I’m not sure' },
    ],
  },
  {
    id: 'medical-care',
    icon: 'check',
    question: { es: '¿Recibiste atención médica? ¿Qué tan pronto?', en: 'Did you get medical care? How soon?' },
    why: {
      es: 'La atención médica oportuna protege tu salud y deja constancia de lo que pasó.',
      en: 'Timely medical care protects your health and documents what happened.',
    },
    options: [
      { value: 'same-day', es: 'El mismo día', en: 'The same day' },
      { value: 'within-days', es: 'En unos días', en: 'Within a few days' },
      { value: 'not-yet', es: 'Aún no, pero quiero', en: 'Not yet, but I want to' },
      { value: 'no', es: 'No', en: 'No' },
    ],
  },
  {
    id: 'fault',
    icon: 'gavel',
    question: { es: '¿De quién fue la culpa?', en: 'Who was at fault?' },
    why: {
      es: 'La responsabilidad es un factor clave. Si no estás seguro, está bien: un profesional puede ayudarte a entenderlo.',
      en: 'Fault is a key factor. If you’re not sure, that’s okay — a professional can help you understand it.',
    },
    options: [
      { value: 'other', es: 'Del otro conductor', en: 'The other driver' },
      { value: 'me', es: 'Mía', en: 'Mine' },
      { value: 'shared', es: 'Compartida', en: 'Shared' },
      { value: 'unsure', es: 'No estoy seguro', en: 'I’m not sure' },
    ],
  },
  {
    id: 'other-insurance',
    icon: 'shield',
    question: { es: '¿El otro conductor tenía seguro?', en: 'Did the other driver have insurance?' },
    why: {
      es: 'La cobertura del otro conductor afecta las opciones disponibles para ti.',
      en: 'The other driver’s coverage affects the options available to you.',
    },
    options: [
      { value: 'yes', es: 'Sí', en: 'Yes' },
      { value: 'no', es: 'No', en: 'No' },
      { value: 'unsure', es: 'No sé', en: 'I don’t know' },
    ],
  },
  {
    id: 'your-insurance',
    icon: 'shield',
    question: { es: '¿Tú tienes seguro de auto?', en: 'Do you have auto insurance?' },
    why: {
      es: 'Tu propia póliza puede ofrecer protecciones, aun si el otro conductor no tenía seguro.',
      en: 'Your own policy may offer protections, even if the other driver was uninsured.',
    },
    options: [
      { value: 'yes', es: 'Sí', en: 'Yes' },
      { value: 'no', es: 'No', en: 'No' },
      { value: 'unsure', es: 'No sé', en: 'I don’t know' },
    ],
  },
  {
    id: 'timing',
    icon: 'clock',
    question: { es: '¿Hace cuánto fue el accidente?', en: 'How long ago was the accident?' },
    why: {
      es: 'Existen plazos legales para actuar tras un accidente. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
      en: 'There are legal deadlines to act after an accident. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
    },
    options: [
      { value: 'this-week', es: 'Esta semana', en: 'This week' },
      { value: 'this-month', es: 'Este mes', en: 'This month' },
      { value: '1-6-months', es: 'Hace 1 a 6 meses', en: '1 to 6 months ago' },
      { value: '6-plus', es: 'Más de 6 meses', en: 'More than 6 months ago' },
      { value: 'dont-remember', es: 'No recuerdo bien', en: 'I don’t quite remember' },
    ],
  },
];

export const CASE_TOTAL_STEPS = CASE_STEPS.length;

/**
 * Contenido del resultado CUALITATIVO. Ninguna variante implica fuerza del caso
 * ni probabilidad: solo cambian el énfasis y los próximos pasos. Todas terminan
 * en "evaluación profesional gratuita".
 */
export const CASE_RESULT = {
  headlineDefault: {
    es: 'Según tus respuestas, vale la pena que un profesional revise tu caso — sin costo ni compromiso.',
    en: 'Based on your answers, it’s worth having a professional review your case — free and with no obligation.',
  } as Loc,
  headlineNoInjury: {
    es: 'Aun si no notas lesiones, vale la pena una evaluación gratuita: algunas molestias aparecen días después.',
    en: 'Even if you don’t notice injuries, a free evaluation is worth it — some symptoms appear days later.',
  } as Loc,
  /** Nota si aún no buscó atención médica. */
  medicalNote: {
    es: 'Todavía no has recibido atención médica. Considéralo pronto: además de cuidar tu salud, ayuda a documentar lo que pasó.',
    en: 'You haven’t received medical care yet. Consider it soon — beyond your health, it helps document what happened.',
  } as Loc,
  /** Nota si pasó mucho tiempo. */
  timingNote: {
    es: 'Ya pasó un tiempo desde tu accidente. Como existen plazos legales, conviene preguntar cuanto antes. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
    en: 'Some time has passed since your accident. Because legal deadlines exist, it’s best to ask as soon as possible. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
  } as Loc,
  factors: [
    {
      title: { es: 'Lesiones documentadas', en: 'Documented injuries' },
      desc: {
        es: 'Un diagnóstico médico que conecte tus lesiones con el accidente es uno de los factores más importantes.',
        en: 'A medical diagnosis linking your injuries to the accident is one of the most important factors.',
      },
    },
    {
      title: { es: 'Atención médica oportuna', en: 'Timely medical care' },
      desc: {
        es: 'Buscar atención pronto ayuda a tu recuperación y a documentar el caso.',
        en: 'Getting care soon helps your recovery and documents the case.',
      },
    },
    {
      title: { es: 'Responsabilidad', en: 'Fault and responsibility' },
      desc: {
        es: 'Quién causó el accidente influye en tus opciones; muchas veces no es tan simple como parece.',
        en: 'Who caused the accident affects your options; it’s often not as simple as it seems.',
      },
    },
    {
      title: { es: 'Cobertura de seguro', en: 'Insurance coverage' },
      desc: {
        es: 'Las pólizas tuyas y del otro conductor definen qué opciones existen.',
        en: 'Your policy and the other driver’s define what options exist.',
      },
    },
    {
      title: { es: 'Plazos', en: 'Deadlines' },
      desc: {
        es: 'Actuar dentro de los plazos legales es importante. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
        en: 'Acting within legal deadlines matters. {{VERIFICAR CON ABOGADO: plazo para reclamar en Utah}}',
      },
    },
  ] as Array<{ title: Loc; desc: Loc }>,
  disclaimer: {
    es: 'Esta herramienta es información educativa, no asesoría legal ni una valoración de tu caso. Cada caso es distinto; solo una evaluación profesional gratuita puede orientarte sobre tu situación.',
    en: 'This tool is educational information, not legal advice or a valuation of your case. Every case is different; only a free professional evaluation can guide you on your situation.',
  } as Loc,
};
