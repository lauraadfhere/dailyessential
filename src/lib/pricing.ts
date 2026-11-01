export type Localised = { en: string; fr: string; ar: string };

export type Plan = {
  id: string;
  name: Localised;
  tagline: Localised;
  usdMonthly: number;
  dzdMonthly: number;
  highlighted?: boolean;
  features: Localised[];
};

/**
 * Reference rate: Bank of Algeria official rate for 1 USD, 30 October 2026.
 * Dinar prices are rounded to friendly school-facing amounts.
 */
export const DZD_PER_USD = 135.5;
export const RATE_NOTE = 'Bank of Algeria official rate · 30 October 2026';

export const plans: Plan[] = [
  {
    id: 'essential',
    name: { en: 'Essential learner', fr: 'Élève essentiel', ar: 'الطالب الأساسي' },
    tagline: {
      en: 'For individual learners joining a single programme.',
      fr: 'Pour un élève qui rejoint un seul programme.',
      ar: 'للطلاب الأفراد المنضمين إلى برنامج واحد.',
    },
    usdMonthly: 6,
    dzdMonthly: 800,
    features: [
      { en: 'All 20 school courses with module outlines', fr: 'Les 20 cours avec plans de modules', ar: 'جميع الدورات العشرين مع خطط الوحدات' },
      { en: 'Student portal, digital ID and recovery key', fr: 'Portail élève, carte numérique et clé de récupération', ar: 'بوابة الطالب والبطاقة الرقمية ومفتاح الاستعادة' },
      { en: 'PDF library with in-app reader', fr: 'Bibliothèque PDF avec lecteur intégré', ar: 'مكتبة PDF مع قارئ مدمج' },
      { en: 'DAMMI AI study buddy with lesson hints', fr: 'DAMMI AI pour les indices de cours', ar: 'مساعد DAMMI AI مع تلميحات الدروس' },
      { en: 'Course reviews and progress tracking', fr: 'Avis sur les cours et suivi de progression', ar: 'تقييمات الدورات وتتبع التقدم' },
    ],
  },
  {
    id: 'school',
    name: { en: 'School', fr: 'École', ar: 'مدرسة' },
    tagline: {
      en: 'The full platform for one campus — the plan most schools start with.',
      fr: 'La plateforme complète pour un campus — le forfait de départ.',
      ar: 'المنصة الكاملة لحرم واحد — الخطة التي تبدأ بها معظم المدارس.',
    },
    usdMonthly: 12,
    dzdMonthly: 1600,
    highlighted: true,
    features: [
      { en: 'Everything in Essential for every learner', fr: 'Tout le forfait Élève pour chaque apprenant', ar: 'كل ما في الخطة الأساسية لكل طالب' },
      { en: 'Teacher and examiner portals with gradebook', fr: 'Portails enseignant et examinateur avec carnet de notes', ar: 'بوابات المعلم والمصحح مع سجل الدرجات' },
      { en: 'Online admissions with document verification', fr: 'Admissions en ligne avec vérification des documents', ar: 'قبول إلكتروني مع التحقق من الوثائق' },
      { en: 'AI test builder, rubric marking and feedback', fr: 'Générateur de tests IA, notation par grille et retours', ar: 'بناء الاختبارات بالذكاء الاصطناعي والتصحيح والتغذية الراجعة' },
      { en: 'Parent portal, fees and attendance tracking', fr: 'Portail parents, frais et suivi de présence', ar: 'بوابة أولياء الأمور والرسوم ومتابعة الحضور' },
      { en: 'Support desk and audit trail', fr: 'Bureau de support et journal d’audit', ar: 'مكتب الدعم وسجل التتبع' },
    ],
  },
  {
    id: 'network',
    name: { en: 'School network', fr: "Réseau d'écoles", ar: 'شبكة المدارس' },
    tagline: {
      en: 'For groups running several campuses under one administration.',
      fr: 'Pour les groupes gérant plusieurs campus sous une seule administration.',
      ar: 'للمجموعات التي تدير عدة أحرم تحت إدارة واحدة.',
    },
    usdMonthly: 22,
    dzdMonthly: 2950,
    features: [
      { en: 'Everything in School across every campus', fr: 'Tout le forfait École sur chaque campus', ar: 'كل ما في خطة المدرسة لكل حرم' },
      { en: 'Group analytics and cross-campus reports', fr: 'Analytique de groupe et rapports inter-campus', ar: 'تحليلات المجموعة وتقارير بين الأحرم' },
      { en: 'Role management and delegated administration', fr: 'Gestion des rôles et administration déléguée', ar: 'إدارة الأدوار والإدارة المفوضة' },
      { en: 'Priority support and onboarding sessions', fr: 'Support prioritaire et sessions d’intégration', ar: 'دعم ذو أولوية وجلسات تأهيل' },
      { en: 'Data export and retention controls', fr: 'Export des données et contrôle de conservation', ar: 'تصدير البيانات وضوابط الاحتفاظ' },
    ],
  },
];

const addOns: { name: Localised; usd: number; dzd: number; note: Localised }[] = [
  {
    name: { en: 'Admission application', fr: "Dossier d'admission", ar: 'طلب القبول' },
    usd: 15,
    dzd: 2000,
    note: { en: 'One-off, non-refundable', fr: 'Paiement unique, non remboursable', ar: 'دفعة واحدة غير قابلة للاسترداد' },
  },
  {
    name: { en: 'Printed ID card & lanyard', fr: "Carte d'identité imprimée", ar: 'بطاقة هوية مطبوعة' },
    usd: 5,
    dzd: 700,
    note: { en: 'Per learner, optional', fr: 'Par élève, facultatif', ar: 'لكل طالب، اختياري' },
  },
  {
    name: { en: 'Extra campus', fr: 'Campus supplémentaire', ar: 'حرم إضافي' },
    usd: 8,
    dzd: 1100,
    note: { en: 'Per campus / month', fr: 'Par campus / mois', ar: 'لكل حرم / شهريًا' },
  },
];

export function planAddOns() {
  return addOns;
}

export function annualSaving(monthly: number) {
  return Math.round(monthly * 12 * 0.8);
}
