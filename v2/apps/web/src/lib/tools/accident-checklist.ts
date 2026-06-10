import type { Locale } from '@carinjury/shared';
import type { IconName } from '@components/ui/Icon';

/**
 * Checklist "¿Qué hacer después de un accidente de auto?" — fuente única de
 * verdad para la herramienta interactiva, el JSON-LD HowTo y el PDF descargable.
 *
 * Los `id` son estables e independientes del idioma: el progreso se guarda por
 * id en localStorage, así cambiar es/en no pierde lo marcado.
 *
 * Contenido EDUCATIVO y de orientación, NO asesoría legal. Cualquier dato legal
 * (plazos, statute of limitations, PIP/no-fault) va como `{{VERIFICAR CON
 * ABOGADO: ...}}` — nunca se afirma como cierto.
 */

interface LocalizedText {
  title: string;
  detail: string;
}

export interface ChecklistItem {
  id: string;
  es: LocalizedText;
  en: LocalizedText;
}

export interface ChecklistSection {
  id: string;
  icon: IconName;
  es: { title: string };
  en: { title: string };
  items: ChecklistItem[];
}

export const CHECKLIST_SECTIONS: ChecklistSection[] = [
  {
    id: 'scene',
    icon: 'car',
    es: { title: 'En la escena del accidente' },
    en: { title: 'At the accident scene' },
    items: [
      {
        id: 'safety',
        es: {
          title: 'Ponte a salvo',
          detail:
            'Si puedes, orilla el vehículo fuera del tráfico, enciende las luces de emergencia y revisa si tú o tus acompañantes tienen heridas. Tu seguridad es lo primero.',
        },
        en: {
          title: 'Get to safety',
          detail:
            'If you can, pull over out of traffic, turn on your hazard lights and check whether you or your passengers are hurt. Your safety comes first.',
        },
      },
      {
        id: 'call-911',
        es: {
          title: 'Llama al 911 y pide el reporte',
          detail:
            'Reporta el accidente a la policía y pide que hagan un reporte oficial. Anota el número de reporte: es clave para tu reclamo.',
        },
        en: {
          title: 'Call 911 and request the report',
          detail:
            'Report the accident to the police and ask for an official report. Write down the report number — it’s key for your claim.',
        },
      },
    ],
  },
  {
    id: 'document',
    icon: 'check',
    es: { title: 'Documenta e intercambia' },
    en: { title: 'Document and exchange' },
    items: [
      {
        id: 'photos',
        es: {
          title: 'Documenta todo con fotos',
          detail:
            'Toma fotos de los vehículos, las placas, los daños, la posición en la vía, las señales y cualquier lesión visible. Mientras más, mejor.',
        },
        en: {
          title: 'Document everything with photos',
          detail:
            'Take photos of the vehicles, license plates, damage, position on the road, signs and any visible injuries. The more, the better.',
        },
      },
      {
        id: 'exchange',
        es: {
          title: 'Intercambia datos',
          detail:
            'Anota el seguro, la licencia y el contacto del otro conductor, y los datos de cualquier testigo. No te vayas sin esta información.',
        },
        en: {
          title: 'Exchange information',
          detail:
            'Write down the other driver’s insurance, license and contact, plus any witness details. Don’t leave without this information.',
        },
      },
      {
        id: 'no-fault',
        es: {
          title: 'No admitas culpa ni firmes nada del otro ajustador',
          detail:
            'Aunque te presionen, no aceptes responsabilidad ni firmes documentos del seguro del otro conductor en el momento. Habla primero con tu médico y, si lo necesitas, con un abogado.',
        },
        en: {
          title: 'Don’t admit fault or sign anything from the other adjuster',
          detail:
            'Even if you’re pressured, don’t accept responsibility or sign documents from the other driver’s insurer on the spot. Talk to your doctor first and, if needed, a lawyer.',
        },
      },
    ],
  },
  {
    id: 'health',
    icon: 'stethoscope',
    es: { title: 'Tu salud y el siguiente paso' },
    en: { title: 'Your health and next step' },
    items: [
      {
        id: 'medical',
        es: {
          title: 'Busca atención médica pronto',
          detail:
            'Algunas lesiones como el latigazo cervical aparecen horas o días después. Una evaluación temprana protege tu salud y deja constancia para tu reclamo.',
        },
        en: {
          title: 'Get medical attention soon',
          detail:
            'Some injuries like whiplash show up hours or days later. An early evaluation protects your health and creates a record for your claim.',
        },
      },
      {
        id: 'clinic',
        es: {
          title: 'Contacta a la clínica para tu evaluación',
          detail:
            'En Car Injury Clinic te evaluamos el mismo día, en español o inglés, con transporte gratis y orientación legal si la necesitas.',
        },
        en: {
          title: 'Contact the clinic for your evaluation',
          detail:
            'At Car Injury Clinic we evaluate you the same day, in Spanish or English, with free transportation and legal guidance if you need it.',
        },
      },
    ],
  },
];

/**
 * Nota legal con PLACEHOLDER marcado — el plazo real lo confirma el abogado.
 * No afirmar plazos ni montos como ciertos.
 */
export const CHECKLIST_LEGAL_NOTE: Record<Locale, string> = {
  es: 'Bueno saber: en Utah existe un plazo legal para presentar un reclamo tras un accidente. {{VERIFICAR CON ABOGADO: plazo para reclamar / statute of limitations en Utah}} Esta guía es educativa y de orientación, no asesoría legal.',
  en: 'Good to know: in Utah there is a legal deadline to file a claim after an accident. {{VERIFICAR CON ABOGADO: plazo para reclamar / statute of limitations en Utah}} This guide is educational and informational, not legal advice.',
};

/** Total de ítems marcables (para la barra de progreso). */
export const CHECKLIST_TOTAL = CHECKLIST_SECTIONS.reduce((n, s) => n + s.items.length, 0);

/** Lista plana de pasos para el JSON-LD HowTo y el PDF. */
export function checklistSteps(locale: Locale): Array<{ name: string; text: string }> {
  return CHECKLIST_SECTIONS.flatMap((s) =>
    s.items.map((it) => ({ name: it[locale].title, text: it[locale].detail })),
  );
}
