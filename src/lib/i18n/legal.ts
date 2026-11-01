import type { Locale } from './config';

export type LegalSection = { heading: string; body: string };

export type LegalDocument = {
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
};

type LegalKey = 'policies' | 'privacy' | 'terms';

export const legalContent: Record<LegalKey, Record<Locale, LegalDocument>> = {
  policies: {
    en: {
      eyebrow: 'Daily Essential School / Policies',
      title: 'School policies & forms',
      intro: 'Our policies set clear expectations for a safe, respectful and successful learning community, and explain what learners and families can expect from us in return.',
      updated: 'Last reviewed: October 2026',
      sections: [
        {
          heading: 'Student conduct',
          body: 'Students treat fellow learners, staff and visitors with respect, attend scheduled learning activities and use school facilities responsibly. Repeated disruption is handled through a restorative conversation with a tutor before any formal step.',
        },
        {
          heading: 'Safeguarding & wellbeing',
          body: 'Daily Essential School is committed to a learning environment where concerns can be raised safely. Every staff member is trained to recognise and report a safeguarding concern, and learners can contact the wellbeing team through the portal at any time.',
        },
        {
          heading: 'Attendance & participation',
          body: 'Regular participation keeps learners connected to their programme. Please notify the school as early as possible when absence is unavoidable. Attendance below 80% in a term triggers a supportive check-in with the family.',
        },
        {
          heading: 'Assessment & academic integrity',
          body: 'Marks reflect the learner’s own work. DAMMI AI may explain a topic and give hints, but it is unavailable for answer generation during a live assessment. Submitting AI-written work as your own is treated as a breach of academic integrity.',
        },
        {
          heading: 'Digital ID, privacy and data',
          body: 'Your digital student ID and QR code identify you on campus and in the library. Share them only with school staff. The recovery key printed on your identity page is personal and must never be posted publicly.',
        },
        {
          heading: 'Requests, complaints and appeals',
          body: 'Open a support ticket from the Contact page for any request or complaint. You will receive a reference number immediately, and the school aims to reply within two working days. Decisions can be appealed in writing within ten working days.',
        },
      ],
    },
    fr: {
      eyebrow: 'Daily Essential School / Politiques',
      title: 'Politiques et formulaires',
      intro: 'Nos politiques fixent des attentes claires pour une communauté d’apprentissage sûre et respectueuse, et précisent ce que les élèves et les familles peuvent attendre de nous.',
      updated: 'Dernière révision : octobre 2026',
      sections: [
        {
          heading: 'Conduite des élèves',
          body: 'Les élèves traitent avec respect leurs camarades, le personnel et les visiteurs, assistent aux activités prévues et utilisent les équipements de manière responsable. Les perturbations répétées font l’objet d’un entretien de médiation avec un tuteur avant toute démarche formelle.',
        },
        {
          heading: 'Protection et bien-être',
          body: 'Daily Essential School s’engage à offrir un environnement où les inquiétudes peuvent être signalées en sécurité. Chaque membre du personnel est formé à reconnaître et signaler une situation préoccupante, et les élèves peuvent joindre l’équipe bien-être via le portail à tout moment.',
        },
        {
          heading: 'Présence et participation',
          body: 'Une participation régulière maintient le lien avec le programme. Prévenez l’école dès que possible en cas d’absence inévitable. Une présence inférieure à 80 % sur un trimestre déclenche un entretien de suivi avec la famille.',
        },
        {
          heading: 'Évaluation et intégrité académique',
          body: 'Les notes reflètent le travail personnel de l’élève. DAMMI AI peut expliquer un sujet et donner des indices, mais il n’est pas disponible pour produire des réponses pendant une évaluation. Présenter un travail rédigé par une IA comme le sien constitue une atteinte à l’intégrité académique.',
        },
        {
          heading: 'Carte numérique, confidentialité et données',
          body: 'Votre carte étudiante numérique et votre QR code permettent de vous identifier sur le campus et à la bibliothèque. Ne les partagez qu’avec le personnel. La clé de récupération de votre page d’identité est personnelle et ne doit jamais être publiée.',
        },
        {
          heading: 'Demandes, réclamations et recours',
          body: 'Ouvrez un ticket depuis la page Contact pour toute demande ou réclamation. Un numéro de référence est attribué immédiatement et l’école répond sous deux jours ouvrés. Les décisions peuvent faire l’objet d’un recours écrit dans les dix jours ouvrés.',
        },
      ],
    },
    ar: {
      eyebrow: 'مدرسة دايلي إسينشال / السياسات',
      title: 'سياسات المدرسة والنماذج',
      intro: 'تحدد سياساتنا توقعات واضحة لمجتمع تعليمي آمن ومحترم وناجح، وتوضح ما يمكن للطلاب والعائلات توقعه منا في المقابل.',
      updated: 'آخر مراجعة: أكتوبر 2026',
      sections: [
        {
          heading: 'سلوك الطلاب',
          body: 'يعامل الطلاب زملائهم والمعلمين والزوار باحترام، ويحضرون الأنشطة المقررة، ويستخدمون مرافق المدرسة بمسؤولية. تتم معالجة الإخلال المتكرر عبر حوار إصلاحي مع المرشد قبل أي إجراء رسمي.',
        },
        {
          heading: 'الحماية والرفاهية',
          body: 'تلتزم مدرسة دايلي إسينشال ببيئة تعليمية يمكن فيها رفع المخاوف بأمان. جميع الموظفين مدربون على ملاحظة أي مخاوف حماية والإبلاغ عنها، ويمكن للطلاب التواصل مع فريق الرفاهية عبر البوابة في أي وقت.',
        },
        {
          heading: 'الحضور والمشاركة',
          body: 'الحضور المنتظم يبقي الطالب مرتبطًا ببرنامجه. يرجى إبلاغ المدرسة في أقرب وقت عند تعذر الحضور. انخفاض الحضور عن 80٪ في الفصل يستدعي جلسة متابعة داعمة مع الأسرة.',
        },
        {
          heading: 'التقييم والنزاهة الأكاديمية',
          body: 'تعكس الدرجات عمل الطالب نفسه. يمكن لـ DAMMI AI شرح موضوع وتقديم تلميحات، لكنه غير متاح لتوليد إجابات أثناء التقييم. تقديم عمل مكتوب بواسطة الذكاء الاصطناعي على أنه عمل الطالب يُعد إخلالًا بالنزاهة الأكاديمية.',
        },
        {
          heading: 'البطاقة الرقمية والخصوصية والبيانات',
          body: 'تعرّفك بطاقتك الرقمية ورمز QR على الحرم وفي المكتبة. شاركها مع موظفي المدرسة فقط. مفتاح الاستعادة في صفحة هويتك شخصي ويجب ألا يُنشر علنًا أبدًا.',
        },
        {
          heading: 'الطلبات والشكاوى والاستئناف',
          body: 'افتح تذكرة دعم من صفحة الاتصال لأي طلب أو شكوى. ستحصل على رقم مرجعي فورًا، وتستهدف المدرسة الرد خلال يومي عمل. ويمكن الاستئناف كتابيًا خلال عشرة أيام عمل.',
        },
      ],
    },
  },
  privacy: {
    en: {
      eyebrow: 'Daily Essential School / Legal',
      title: 'Privacy policy',
      intro: 'We handle personal information with care so that our school services can be delivered safely, fairly and transparently.',
      updated: 'Last reviewed: October 2026',
      sections: [
        {
          heading: 'Information we use',
          body: 'We process account details, guardian contacts, learning records, assessment results, uploaded documents and support tickets — only what is needed to run the school and support each learner.',
        },
        {
          heading: 'How information is protected',
          body: 'Access is limited to authorised staff and systems, connections are encrypted, uploads are stored in a managed media service, and sign-in sessions are kept on your device rather than in shared cookies. Passwords are never visible to school staff.',
        },
        {
          heading: 'AI features and your data',
          body: 'DAMMI AI receives only the question you type, a short conversation context and your course title. Prompts are not used to train third-party models. Assessment and admissions summaries are advisory: a person always makes the final decision.',
        },
        {
          heading: 'Cookies and local storage',
          body: 'We use essential storage for sign-in, your language choice and your cookie decision. Optional analytics storage is only enabled when you accept it in the cookie banner, and you can change your choice by clearing this site’s storage.',
        },
        {
          heading: 'Retention and your rights',
          body: 'Learning records are kept while a learner is enrolled and for the period required by school records policy. You may ask to see, correct or delete your information by opening a ticket from the Contact page.',
        },
        {
          heading: 'Your questions',
          body: 'Contact the school support team if you have a question about your information, need to update it or want to report a privacy concern. We aim to respond within two working days.',
        },
      ],
    },
    fr: {
      eyebrow: 'Daily Essential School / Légal',
      title: 'Politique de confidentialité',
      intro: 'Nous traitons les informations personnelles avec soin afin que nos services scolaires soient fournis de manière sûre, équitable et transparente.',
      updated: 'Dernière révision : octobre 2026',
      sections: [
        {
          heading: 'Informations utilisées',
          body: 'Nous traitons les données de compte, les contacts des tuteurs, les dossiers d’apprentissage, les résultats, les documents téléversés et les tickets de support — uniquement ce qui est nécessaire au fonctionnement de l’école.',
        },
        {
          heading: 'Protection des informations',
          body: 'L’accès est limité au personnel et aux systèmes autorisés, les connexions sont chiffrées, les fichiers sont stockés dans un service média géré et les sessions restent sur votre appareil. Les mots de passe ne sont jamais visibles par le personnel.',
        },
        {
          heading: 'Fonctions IA et vos données',
          body: 'DAMMI AI ne reçoit que votre question, un court contexte de conversation et le titre de votre cours. Les requêtes ne servent pas à entraîner des modèles tiers. Les synthèses d’évaluation et d’admission sont indicatives : une personne décide toujours.',
        },
        {
          heading: 'Cookies et stockage local',
          body: 'Nous utilisons un stockage essentiel pour la connexion, votre langue et votre choix de cookies. Le stockage analytique optionnel n’est activé que si vous l’acceptez dans la bannière, et vous pouvez modifier ce choix en effaçant le stockage du site.',
        },
        {
          heading: 'Conservation et vos droits',
          body: 'Les dossiers sont conservés pendant la scolarité et la durée exigée par la politique d’archivage. Vous pouvez demander à consulter, corriger ou supprimer vos informations via un ticket depuis la page Contact.',
        },
        {
          heading: 'Vos questions',
          body: 'Contactez l’équipe de support pour toute question sur vos informations, une mise à jour ou un signalement. Nous répondons sous deux jours ouvrés.',
        },
      ],
    },
    ar: {
      eyebrow: 'مدرسة دايلي إسينشال / قانوني',
      title: 'سياسة الخصوصية',
      intro: 'نتعامل مع المعلومات الشخصية بعناية حتى تُقدَّم خدماتنا المدرسية بأمان وعدالة وشفافية.',
      updated: 'آخر مراجعة: أكتوبر 2026',
      sections: [
        {
          heading: 'المعلومات التي نستخدمها',
          body: 'نعالج بيانات الحساب وبيانات تواصل الأولياء والسجلات التعليمية ونتائج التقييم والوثائق المرفوعة وتذاكر الدعم — فقط ما يلزم لتشغيل المدرسة ودعم كل طالب.',
        },
        {
          heading: 'كيف نحمي المعلومات',
          body: 'الوصول مقصور على الموظفين المصرح لهم والأنظمة المعتمدة، والاتصالات مشفرة، والملفات محفوظة في خدمة وسائط مُدارة، وجلسات الدخول تبقى على جهازك. لا يمكن للموظفين رؤية كلمات المرور.',
        },
        {
          heading: 'ميزات الذكاء الاصطناعي وبياناتك',
          body: 'يستقبل DAMMI AI سؤالك المكتوب وسياق محادثة قصيرًا وعنوان دورتك فقط. لا تُستخدم الطلبات لتدريب نماذج خارجية. ملخصات التقييم والقبول استشارية فقط، والقرار النهائي بشري دائمًا.',
        },
        {
          heading: 'ملفات تعريف الارتباط والتخزين المحلي',
          body: 'نستخدم تخزينًا أساسيًا لتسجيل الدخول ولغتك وقرار ملفات الارتباط. لا يُفعَّل تخزين التحليلات الاختياري إلا بموافقتك في الشريط، ويمكنك تغيير اختيارك بمسح تخزين الموقع.',
        },
        {
          heading: 'الاحتفاظ وحقوقك',
          body: 'تُحفظ السجلات أثناء تسجيل الطالب وللمدة التي تتطلبها سياسة سجلات المدرسة. يمكنك طلب الاطلاع على معلوماتك أو تصحيحها أو حذفها عبر تذكرة من صفحة الاتصال.',
        },
        {
          heading: 'أسئلتك',
          body: 'تواصل مع فريق الدعم لأي سؤال عن معلوماتك أو تحديثها أو للإبلاغ عن مخاوف تتعلق بالخصوصية. نستهدف الرد خلال يومي عمل.',
        },
      ],
    },
  },
  terms: {
    en: {
      eyebrow: 'Daily Essential School / Legal',
      title: 'Terms of use',
      intro: 'These terms explain how to use the Daily Essential School website and portal responsibly, and what you can expect from the platform.',
      updated: 'Last reviewed: October 2026',
      sections: [
        {
          heading: 'Portal access',
          body: 'Keep your sign-in details private and use only the portal access assigned to you. Tell the school immediately if you believe your account has been used without permission, then use your recovery key or contact support.',
        },
        {
          heading: 'Acceptable use',
          body: 'Do not disrupt school systems, attempt to access another person’s records, share restricted content or use portal material in a way that harms other members of our community.',
        },
        {
          heading: 'Courses and enrolment',
          body: 'Course descriptions, module outlines and seats are published in good faith and may be updated. Enrolling reserves your place on a course for the current term; withdrawal can be made from the student courses page.',
        },
        {
          heading: 'Fees and billing',
          body: 'Platform plans are billed per active learner, per month, in Algerian dinar or US dollars as shown on the pricing page. Admission applications and optional extras are charged separately and are shown before payment.',
        },
        {
          heading: 'AI assistance',
          body: 'DAMMI AI provides study support and drafting help. Answers may be incomplete or wrong and must be checked with a teacher. AI output is never the final word on marks, admissions or discipline.',
        },
        {
          heading: 'Content and updates',
          body: 'Portal information supports school activity and may change when programmes, services or requirements change. Material updates are announced in the portal and on the news page.',
        },
      ],
    },
    fr: {
      eyebrow: 'Daily Essential School / Légal',
      title: 'Conditions d’utilisation',
      intro: 'Ces conditions expliquent comment utiliser le site et le portail Daily Essential School de manière responsable, et ce que vous pouvez attendre de la plateforme.',
      updated: 'Dernière révision : octobre 2026',
      sections: [
        {
          heading: 'Accès au portail',
          body: 'Gardez vos identifiants privés et n’utilisez que l’accès qui vous est attribué. Prévenez immédiatement l’école si votre compte a été utilisé sans autorisation, puis utilisez votre clé de récupération ou contactez le support.',
        },
        {
          heading: 'Utilisation acceptable',
          body: 'Ne perturbez pas les systèmes scolaires, ne tentez pas d’accéder aux dossiers d’autrui, ne partagez pas de contenus réservés et n’utilisez pas le portail d’une manière nuisible à la communauté.',
        },
        {
          heading: 'Cours et inscription',
          body: 'Les descriptions, plans de modules et places sont publiés de bonne foi et peuvent être mis à jour. L’inscription réserve votre place pour le trimestre en cours ; le retrait se fait depuis la page des cours de l’élève.',
        },
        {
          heading: 'Frais et facturation',
          body: 'Les forfaits sont facturés par élève actif et par mois, en dinar algérien ou en dollar, comme indiqué sur la page des tarifs. Les frais de dossier et options sont facturés séparément et affichés avant paiement.',
        },
        {
          heading: 'Assistance IA',
          body: 'DAMMI AI fournit une aide à l’étude et à la rédaction. Les réponses peuvent être incomplètes ou erronées et doivent être vérifiées avec un enseignant. L’IA ne décide jamais des notes, des admissions ou de la discipline.',
        },
        {
          heading: 'Contenu et mises à jour',
          body: 'Les informations du portail soutiennent l’activité scolaire et peuvent évoluer avec les programmes et services. Les mises à jour importantes sont annoncées dans le portail et sur la page des actualités.',
        },
      ],
    },
    ar: {
      eyebrow: 'مدرسة دايلي إسينشال / قانوني',
      title: 'شروط الاستخدام',
      intro: 'توضح هذه الشروط كيفية استخدام موقع وبوابة مدرسة دايلي إسينشال بمسؤولية، وما يمكنك توقعه من المنصة.',
      updated: 'آخر مراجعة: أكتوبر 2026',
      sections: [
        {
          heading: 'الوصول إلى البوابة',
          body: 'احتفظ ببيانات الدخول خاصة واستخدم نوع الوصول المخصص لك فقط. أبلغ المدرسة فورًا إذا اعتقدت أن حسابك استُخدم دون إذن، ثم استخدم مفتاح الاستعادة أو تواصل مع الدعم.',
        },
        {
          heading: 'الاستخدام المقبول',
          body: 'لا تعطّل أنظمة المدرسة، ولا تحاول الوصول إلى سجلات الآخرين، ولا تشارك محتوى مقيدًا، ولا تستخدم مواد البوابة بشكل يضر بأفراد المجتمع المدرسي.',
        },
        {
          heading: 'الدورات والتسجيل',
          body: 'تُنشر أوصاف الدورات وخطط الوحدات والمقاعد بحسن نية وقد تُحدَّث. التسجيل يحجز مقعدك في الدورة للفصل الحالي، ويمكن الانسحاب من صفحة دورات الطالب.',
        },
        {
          heading: 'الرسوم والفوترة',
          body: 'تُحتسب خطط المنصة لكل طالب نشط شهريًا بالدينار الجزائري أو الدولار كما هو موضح في صفحة الأسعار. تُحتسب رسوم القبول والإضافات بشكل منفصل وتُعرض قبل الدفع.',
        },
        {
          heading: 'مساعدة الذكاء الاصطناعي',
          body: 'يقدم DAMMI AI دعمًا دراسيًا ومساعدة في الصياغة. قد تكون الإجابات ناقصة أو خاطئة ويجب التحقق منها مع المعلم. لا يكون مخرجات الذكاء الاصطناعي قرارًا نهائيًا في الدرجات أو القبول أو التأديب.',
        },
        {
          heading: 'المحتوى والتحديثات',
          body: 'تدعم معلومات البوابة النشاط المدرسي وقد تتغير بتغير البرامج والخدمات. تُعلن التحديثات المهمة في البوابة وفي صفحة الأخبار.',
        },
      ],
    },
  },
};

export function legalDocument(key: LegalKey, locale: Locale) {
  return legalContent[key][locale];
}
