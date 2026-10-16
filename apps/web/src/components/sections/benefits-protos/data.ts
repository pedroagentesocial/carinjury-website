// Datos compartidos por los 3 prototipos de "Beneficios reales".
// Las descripciones (`desc`) son copy PROVISIONAL para evaluar el diseño:
// hay que validarlas con la clínica antes de pasar a producción.

export interface Benefit {
  key: string;
  icon: string;
  href: string;
  title: string;
  desc: string;
}

export const BENEFITS: Benefit[] = [
  {
    key: 'free_consultation',
    icon: '/assets/icons/consulta-cero.png',
    href: '/patient-referral',
    title: 'Evaluación inicial sin costo',
    desc: 'Te revisamos y armamos tu plan antes de que pagues nada.',
  },
  {
    key: 'same_day',
    icon: '/assets/icons/mismo-dia.png',
    href: '/schedule',
    title: 'Atención hoy mismo',
    desc: 'Agenda hoy y te atendemos sin semanas de espera.',
  },
  {
    key: 'free_transport',
    icon: '/assets/icons/transporte.png',
    href: '/services#transporte-gratis',
    title: 'Transporte sin costo',
    desc: 'Si no tienes cómo llegar, coordinamos tu transporte.',
  },
  {
    key: 'xray',
    icon: '/assets/icons/xray.png',
    href: '/services#radiografias',
    title: 'X-Ray el mismo día',
    desc: 'Radiografías en la clínica, sin mandarte a otro lugar.',
  },
  {
    key: 'legal_guidance',
    icon: '/assets/icons/legal.png',
    href: '/lawyer-approved',
    title: 'Orientación legal sin costo',
    desc: 'Te conectamos con abogados que conocen tu tipo de caso.',
  },
  {
    key: 'languages',
    icon: '/assets/icons/idiomas.png',
    href: '/services#bilingue',
    title: 'Hablamos español e inglés',
    desc: 'Todo el proceso en tu idioma, de principio a fin.',
  },
];

export const byKey = (key: string) => BENEFITS.find((b) => b.key === key)!;
