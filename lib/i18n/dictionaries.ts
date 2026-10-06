import type { ContactErrorCode, ServiceId } from "@/lib/contact/schema";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Root path for a locale (Spanish is served at "/"). */
export function localePath(lang: Locale): string {
  return lang === defaultLocale ? "/" : `/${lang}`;
}

export type ValueIcon = "robot" | "chart" | "bolt" | "shield";
type ValueItem = { icon: ValueIcon; title: string; text: string };

type PlanFeature = { label: string; included: boolean };
export type Plan = {
  id: "libre" | "basico" | "profesional" | "empresa";
  name: string;
  price: string | null;
  period?: string;
  features: PlanFeature[];
  cta: string;
  ctaVariant: "primary" | "outline";
  service: ServiceId;
  highlight?: "recommended" | "outlined";
};

const es = {
  meta: {
    title: "C-Legal | Gestión Legal Inteligente",
    description:
      "Gestiona y controla el cumplimiento legal con IA, automatización y analítica avanzada. Repositorio legal, verificación, matrices, planes de acción, reportes y dashboards en un solo lugar.",
    ogAlt: "C-Legal — Gestión Legal Inteligente",
  },
  skipToContent: "Saltar al contenido",
  nav: {
    home: "Inicio",
    solution: "Nuestra solución",
    plans: "Planes",
    about: "Nosotros",
    contact: "Contáctanos",
    login: "Inicio de sesión",
    download: "Descargar la app",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    primary: "Navegación principal",
    homeLink: "C-Legal, ir al inicio",
  },
  hero: {
    title: "C-Legal",
    highlight: "Gestión Legal Inteligente",
    subtitle: "Gestiona y controla el cumplimiento legal con IA, automatización y analítica avanzada.",
    primaryCta: "Conócenos",
    secondaryCta: "Planes",
    imageAlt:
      "Mano sosteniendo un smartphone con la app C-Legal en la pantalla «Solicitar VL», con estados de cumplimiento por título.",
  },
  solution: {
    srTitle: "Nuestra solución",
    problem: {
      number: "01",
      title: "¿Tu gestión de cumplimiento sigue siendo manual?",
      items: [
        "Información legal **dispersa**",
        "Procesos de verificación **manuales**",
        "**Dificultad** para identificar brechas",
        "**Poco seguimiento** de acciones",
        "**Horas** destinadas a tareas administrativas",
      ],
      imageAlt: "Laptop mostrando la plataforma web del ecosistema Datasheq.",
    },
    platform: {
      number: "02",
      title: "Todo tu Compliance Legal, en un solo lugar",
      items: ["Repositorio legal", "Verificación", "Matrices", "Planes de acción", "Reportes", "Dashboards"],
      imageAlt: "Tres pantallas de la app C-Legal: Solicitar VL, Mis VL y Resumen VL.",
    },
    value: {
      number: "03",
      title: "Convierte la información legal en decisiones",
      items: ([
        { icon: "robot", title: "Inteligencia", text: "IA aplicada a la gestión del cumplimiento." },
        { icon: "chart", title: "Visibilidad", text: "Indicadores y analítica para conocer tu nivel de cumplimiento." },
        { icon: "bolt", title: "Eficiencia", text: "Automatiza tareas y reduce el trabajo operativo." },
        { icon: "shield", title: "Prevención", text: "Identifica brechas y actúa antes de que se conviertan en problemas." },
      ] satisfies ValueItem[]) as ValueItem[],
    },
  },
  plans: {
    eyebrow: "Planes",
    titleLines: ["Elige el plan que", "se adapta a tu negocio"],
    subtitle: "Funcionalidades robustas a precios competitivos. Empieza gratis.",
    recommended: "Recomendado",
    comingSoon: "próximamente",
    currencyNote: "Precios en dólares estadounidenses (USD).",
    notIncluded: "No incluido",
    items: ([
      {
        id: "libre",
        name: "Libre",
        price: "US$0",
        period: "/ 30 días",
        features: [
          { label: "App móvil", included: true },
          { label: "1 usuario", included: true },
          { label: "1 verificación legal", included: true },
          { label: "1 informe legal", included: true },
          { label: "Plan de acción", included: true },
          { label: "Matriz legal", included: false },
        ],
        cta: "Empezar gratis",
        ctaVariant: "outline",
        service: "plan-libre",
      },
      {
        id: "basico",
        name: "Básico",
        price: "US$39",
        features: [
          { label: "App móvil", included: true },
          { label: "1 usuario", included: true },
          { label: "1 empresa / 1 instalación", included: true },
          { label: "Verificaciones ilimitadas", included: true },
          { label: "Informes ilimitados", included: true },
          { label: "Plan de acción + responsables", included: true },
          { label: "Logotipo en documentos", included: true },
          { label: "Matriz legal", included: true },
        ],
        cta: "Contratar",
        ctaVariant: "primary",
        service: "plan-basico",
        highlight: "recommended",
      },
      {
        id: "profesional",
        name: "Profesional",
        price: null,
        features: [
          { label: "App móvil + administrador", included: true },
          { label: "20 usuarios", included: true },
          { label: "1 empresa / 5 instalaciones", included: true },
          { label: "Verificaciones ilimitadas", included: true },
          { label: "Informes ilimitados", included: true },
          { label: "Plantillas de VL personalizables", included: true },
          { label: "Logotipo en documentos", included: true },
          { label: "Matriz legal", included: true },
        ],
        cta: "Contáctanos",
        ctaVariant: "outline",
        service: "plan-profesional",
        highlight: "outlined",
      },
      {
        id: "empresa",
        name: "Empresa",
        price: null,
        features: [
          { label: "App móvil + administrador", included: true },
          { label: "50 usuarios", included: true },
          { label: "2 empresas / 10 instalaciones", included: true },
          { label: "Verificaciones ilimitadas", included: true },
          { label: "Informes ilimitados", included: true },
          { label: "Plantillas de VL personalizables", included: true },
          { label: "Actualizaciones legales", included: true },
        ],
        cta: "Contáctanos",
        ctaVariant: "outline",
        service: "plan-empresa",
      },
    ] satisfies Plan[]) as Plan[],
  },
  download: {
    title: "Descarga nuestra",
    highlight: "app",
    body: "Todo el poder de C-Legal en tus manos. Descarga nuestra app y transforma la forma de gestionar HSEQ: más simple, más inteligente y desde cualquier lugar.",
    access: "Para acceder a nuestra app:",
    chooseStore: "Elige tu store",
    appStore: "Descargar en App Store",
    googlePlay: "Disponible en Google Play",
    requestAccess: "Solicitar acceso",
    imageAlt: "Smartphone con la pantalla de inicio de la app Datasheq y los módulos C-Legal y C-Controla.",
  },
  about: {
    eyebrow: "Nosotros",
    mission: {
      title: "Misión",
      paragraphs: [
        "Impulsar una gestión HSEQ más simple, preventiva e inteligente, entregando soluciones digitales que ayuden a las organizaciones a proteger a las personas, anticipar riesgos, fortalecer el cumplimiento y tomar mejores decisiones.",
        "Transformamos las necesidades reales de nuestros clientes en tecnología accesible, datos accionables y soluciones oportunas.",
      ],
    },
    vision: {
      title: "Visión",
      paragraphs: [
        "Posicionar a C-Legal como una plataforma HSEQ referente en Chile, reconocida por transformar la gestión de riesgos y el cumplimiento en decisiones inteligentes, mediante tecnología accesible, inteligencia artificial y analítica de datos.",
        "Queremos hacer de la digitalización HSEQ una herramienta al alcance de todas las organizaciones.",
      ],
    },
    team: {
      title: "Equipo",
      paragraphs: [
        "C-Legal es un equipo multidisciplinario de 4 personas que integra conocimiento técnico, de negocios y tecnología para desarrollar herramientas digitales simples, eficientes e intuitivas que faciliten la gestión HSEQ (seguridad, salud ocupacional, medio ambiente y cumplimiento), el control y la toma de decisiones.",
      ],
      members: [
        { name: "Constanza Lores", role: "Control de Gestión", photo: "/team/constanza-lores.jpg" },
        { name: "Victor Achurra", role: "Comercial & Tech", photo: "/team/victor-achurra.jpg" },
        { name: "Paulina Espinoza", role: "Finanzas & RRHH", photo: "/team/paulina-espinoza.jpg" },
        { name: "Francisca Wiegold", role: "Diseño & Marketing", photo: "/team/francisca-wiegold.jpg" },
      ],
    },
  },
  finalCta: {
    title: "Lleva tu Compliance Legal",
    highlight: "al siguiente nivel",
    subtitleLines: ["Descubre cómo C-Legal puede transformar", "la forma en que tu organización gestiona el cumplimiento."],
    button: "Solicita una demo",
    ecosystem: "C-Legal es parte del ecosistema Datasheq",
    ecosystemCta: "Conoce nuestras soluciones",
  },
  footer: {
    tagline: "Gestión Legal Inteligente",
    contactTitle: "Contacto",
    phone: "Teléfono",
    whatsapp: "WhatsApp",
    navTitle: "Explora",
    rights: "Todos los derechos reservados.",
    ecosystem: "Parte del ecosistema Datasheq.",
  },
  whatsapp: {
    fab: "Escríbenos por WhatsApp",
    prefill: "Hola, quiero información sobre C-Legal.",
  },
  contact: {
    title: "Contáctanos",
    intro: "Cuéntanos qué necesitas y te responderemos a la brevedad.",
    close: "Cerrar",
    fields: {
      name: { label: "Nombre completo", placeholder: "Ej: Camila Rojas" },
      email: { label: "Correo electrónico", placeholder: "nombre@empresa.cl" },
      phone: { label: "Teléfono", placeholder: "+56 9 1234 5678" },
      service: { label: "Asunto / Servicio de interés", placeholder: "Selecciona una opción" },
      message: { label: "Mensaje / Detalles del proyecto", placeholder: "Cuéntanos sobre tu organización y lo que necesitas." },
    },
    services: {
      demo: "Solicitar una demo",
      "plan-libre": "Plan Libre (30 días gratis)",
      "plan-basico": "Plan Básico",
      "plan-profesional": "Plan Profesional",
      "plan-empresa": "Plan Empresa",
      datasheq: "Soluciones del ecosistema Datasheq",
      consulta: "Consulta general",
    } satisfies Record<ServiceId, string>,
    required: "obligatorio",
    submit: "Enviar mensaje",
    submitting: "Enviando…",
    privacy: "Usaremos tus datos solo para responder a tu solicitud.",
    orCall: "¿Prefieres hablar ahora?",
    callUs: "Llámanos",
    successTitle: "¡Mensaje enviado!",
    successText:
      "Hemos recibido tu mensaje con éxito. Nos pondremos en contacto contigo a la brevedad. Te enviamos una confirmación a tu correo.",
    successClose: "Entendido",
    errors: {
      name_min: "Ingresa tu nombre completo.",
      name_max: "El nombre es demasiado largo.",
      name_invalid: "Usa solo letras, espacios, puntos, apóstrofos o guiones.",
      email_invalid: "Ingresa un correo electrónico válido.",
      phone_invalid: "Ingresa un teléfono válido (ej: +56 9 1234 5678).",
      service_invalid: "Selecciona un asunto.",
      message_min: "Cuéntanos un poco más (mínimo 10 caracteres).",
      message_max: "El mensaje no puede superar los 2000 caracteres.",
    } satisfies Record<ContactErrorCode, string>,
    errorSummary: "Revisa los campos marcados.",
    errorGeneric: "No pudimos enviar tu mensaje. Inténtalo nuevamente o escríbenos por WhatsApp.",
    errorRateLimit: "Demasiados intentos. Espera unos minutos e inténtalo nuevamente.",
    errorNetwork: "Sin conexión con el servidor. Revisa tu conexión e inténtalo nuevamente.",
  },
  notFound: {
    title: "Página no encontrada",
    text: "La página que buscas no existe o fue movida.",
    back: "Volver al inicio",
  },
};

export type Dictionary = typeof es;

const en: Dictionary = {
  meta: {
    title: "C-Legal | Smart Legal Management",
    description:
      "Manage and control legal compliance with AI, automation and advanced analytics. Legal repository, verification, matrices, action plans, reports and dashboards in one place.",
    ogAlt: "C-Legal — Smart Legal Management",
  },
  skipToContent: "Skip to content",
  nav: {
    home: "Home",
    solution: "Our solution",
    plans: "Plans",
    about: "About us",
    contact: "Contact us",
    login: "Log in",
    download: "Download the app",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    primary: "Main navigation",
    homeLink: "C-Legal, go to home",
  },
  hero: {
    title: "C-Legal",
    highlight: "Smart Legal Management",
    subtitle: "Manage and control legal compliance with AI, automation and advanced analytics.",
    primaryCta: "Discover C-Legal",
    secondaryCta: "Plans",
    imageAlt:
      "Hand holding a smartphone with the C-Legal app on the “Request LV” screen, showing compliance status by title.",
  },
  solution: {
    srTitle: "Our solution",
    problem: {
      number: "01",
      title: "Is your compliance management still manual?",
      items: [
        "**Scattered** legal information",
        "**Manual** verification processes",
        "**Hard** to identify gaps",
        "**Little follow-up** on actions",
        "**Hours** spent on administrative tasks",
      ],
      imageAlt: "Laptop showing the Datasheq ecosystem web platform.",
    },
    platform: {
      number: "02",
      title: "All your Legal Compliance, in one place",
      items: ["Legal repository", "Verification", "Matrices", "Action plans", "Reports", "Dashboards"],
      imageAlt: "Three C-Legal app screens: Request LV, My LVs and LV Summary.",
    },
    value: {
      number: "03",
      title: "Turn legal information into decisions",
      items: [
        { icon: "robot", title: "Intelligence", text: "AI applied to compliance management." },
        { icon: "chart", title: "Visibility", text: "Indicators and analytics to know your compliance level." },
        { icon: "bolt", title: "Efficiency", text: "Automate tasks and reduce operational work." },
        { icon: "shield", title: "Prevention", text: "Identify gaps and act before they become problems." },
      ],
    },
  },
  plans: {
    eyebrow: "Plans",
    titleLines: ["Choose the plan", "that fits your business"],
    subtitle: "Robust features at competitive prices. Start for free.",
    recommended: "Recommended",
    comingSoon: "coming soon",
    currencyNote: "Prices in US dollars (USD).",
    notIncluded: "Not included",
    items: [
      {
        id: "libre",
        name: "Free",
        price: "US$0",
        period: "/ 30 days",
        features: [
          { label: "Mobile app", included: true },
          { label: "1 user", included: true },
          { label: "1 legal verification", included: true },
          { label: "1 legal report", included: true },
          { label: "Action plan", included: true },
          { label: "Legal matrix", included: false },
        ],
        cta: "Start for free",
        ctaVariant: "outline",
        service: "plan-libre",
      },
      {
        id: "basico",
        name: "Basic",
        price: "US$39",
        features: [
          { label: "Mobile app", included: true },
          { label: "1 user", included: true },
          { label: "1 company / 1 site", included: true },
          { label: "Unlimited verifications", included: true },
          { label: "Unlimited reports", included: true },
          { label: "Action plan + owners", included: true },
          { label: "Logo on documents", included: true },
          { label: "Legal matrix", included: true },
        ],
        cta: "Subscribe",
        ctaVariant: "primary",
        service: "plan-basico",
        highlight: "recommended",
      },
      {
        id: "profesional",
        name: "Professional",
        price: null,
        features: [
          { label: "Mobile app + admin", included: true },
          { label: "20 users", included: true },
          { label: "1 company / 5 sites", included: true },
          { label: "Unlimited verifications", included: true },
          { label: "Unlimited reports", included: true },
          { label: "Customizable LV templates", included: true },
          { label: "Logo on documents", included: true },
          { label: "Legal matrix", included: true },
        ],
        cta: "Contact us",
        ctaVariant: "outline",
        service: "plan-profesional",
        highlight: "outlined",
      },
      {
        id: "empresa",
        name: "Enterprise",
        price: null,
        features: [
          { label: "Mobile app + admin", included: true },
          { label: "50 users", included: true },
          { label: "2 companies / 10 sites", included: true },
          { label: "Unlimited verifications", included: true },
          { label: "Unlimited reports", included: true },
          { label: "Customizable LV templates", included: true },
          { label: "Legal updates", included: true },
        ],
        cta: "Contact us",
        ctaVariant: "outline",
        service: "plan-empresa",
      },
    ],
  },
  download: {
    title: "Download our",
    highlight: "app",
    body: "All the power of C-Legal in your hands. Download our app and transform the way you manage HSEQ: simpler, smarter and from anywhere.",
    access: "To access our app:",
    chooseStore: "Choose your store",
    appStore: "Download on the App Store",
    googlePlay: "Get it on Google Play",
    requestAccess: "Request access",
    imageAlt: "Smartphone showing the Datasheq app home screen with the C-Legal and C-Controla modules.",
  },
  about: {
    eyebrow: "About us",
    mission: {
      title: "Mission",
      paragraphs: [
        "To drive simpler, preventive and smarter HSEQ management by delivering digital solutions that help organizations protect people, anticipate risks, strengthen compliance and make better decisions.",
        "We turn our clients’ real needs into accessible technology, actionable data and timely solutions.",
      ],
    },
    vision: {
      title: "Vision",
      paragraphs: [
        "To position C-Legal as a leading HSEQ platform in Chile, recognized for turning risk management and compliance into smart decisions through accessible technology, artificial intelligence and data analytics.",
        "We want to make HSEQ digitalization a tool within reach of every organization.",
      ],
    },
    team: {
      title: "Team",
      paragraphs: [
        "C-Legal is a multidisciplinary team of 4 people combining technical, business and technology expertise to build simple, efficient and intuitive digital tools that support HSEQ management (safety, occupational health, environment and compliance), control and decision-making.",
      ],
      members: [
        { name: "Constanza Lores", role: "Management Control", photo: "/team/constanza-lores.jpg" },
        { name: "Victor Achurra", role: "Sales & Tech", photo: "/team/victor-achurra.jpg" },
        { name: "Paulina Espinoza", role: "Finance & HR", photo: "/team/paulina-espinoza.jpg" },
        { name: "Francisca Wiegold", role: "Design & Marketing", photo: "/team/francisca-wiegold.jpg" },
      ],
    },
  },
  finalCta: {
    title: "Take your Legal Compliance",
    highlight: "to the next level",
    subtitleLines: ["Discover how C-Legal can transform", "the way your organization manages compliance."],
    button: "Request a demo",
    ecosystem: "C-Legal is part of the Datasheq ecosystem",
    ecosystemCta: "Discover our solutions",
  },
  footer: {
    tagline: "Smart Legal Management",
    contactTitle: "Contact",
    phone: "Phone",
    whatsapp: "WhatsApp",
    navTitle: "Explore",
    rights: "All rights reserved.",
    ecosystem: "Part of the Datasheq ecosystem.",
  },
  whatsapp: {
    fab: "Message us on WhatsApp",
    prefill: "Hi, I'd like more information about C-Legal.",
  },
  contact: {
    title: "Contact us",
    intro: "Tell us what you need and we’ll get back to you shortly.",
    close: "Close",
    fields: {
      name: { label: "Full name", placeholder: "e.g. Jane Smith" },
      email: { label: "Email address", placeholder: "name@company.com" },
      phone: { label: "Phone", placeholder: "+56 9 1234 5678" },
      service: { label: "Subject / Service of interest", placeholder: "Select an option" },
      message: { label: "Message / Project details", placeholder: "Tell us about your organization and what you need." },
    },
    services: {
      demo: "Request a demo",
      "plan-libre": "Free plan (30 days)",
      "plan-basico": "Basic plan",
      "plan-profesional": "Professional plan",
      "plan-empresa": "Enterprise plan",
      datasheq: "Datasheq ecosystem solutions",
      consulta: "General inquiry",
    },
    required: "required",
    submit: "Send message",
    submitting: "Sending…",
    privacy: "We’ll only use your data to respond to your request.",
    orCall: "Prefer to talk now?",
    callUs: "Call us",
    successTitle: "Message sent!",
    successText:
      "We’ve received your message. We’ll get in touch with you shortly. A confirmation has been sent to your email (in Spanish).",
    successClose: "Got it",
    errors: {
      name_min: "Enter your full name.",
      name_max: "The name is too long.",
      name_invalid: "Use only letters, spaces, periods, apostrophes or hyphens.",
      email_invalid: "Enter a valid email address.",
      phone_invalid: "Enter a valid phone number (e.g. +56 9 1234 5678).",
      service_invalid: "Select a subject.",
      message_min: "Tell us a bit more (at least 10 characters).",
      message_max: "The message cannot exceed 2000 characters.",
    },
    errorSummary: "Please review the highlighted fields.",
    errorGeneric: "We couldn’t send your message. Please try again or message us on WhatsApp.",
    errorRateLimit: "Too many attempts. Please wait a few minutes and try again.",
    errorNetwork: "Couldn’t reach the server. Check your connection and try again.",
  },
  notFound: {
    title: "Page not found",
    text: "The page you’re looking for doesn’t exist or has been moved.",
    back: "Back to home",
  },
};

const dictionaries: Record<Locale, Dictionary> = { es, en };

export function getDictionary(lang: Locale): Dictionary {
  return dictionaries[lang];
}

/** Spanish labels are used in emails regardless of the visitor's locale. */
export const serviceLabelsEs = es.contact.services;
