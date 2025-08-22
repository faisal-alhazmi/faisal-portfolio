import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Linkedin, MessageCircle, Phone, Mail, Sparkles, Languages } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

/*
  Faisal Portfolio — Neon Noir (AR/EN + QR + Projects)
  Improvements:
  - Fixed ComposedChartWrapper syntax bug
  - Multi Y-axes (Traffic / CPA / CTR) + tooltip formatters
  - Persist language to localStorage + initial auto-detect
  - Keyboard navigation for pager (ArrowLeft / ArrowRight)
  - IntersectionObserver cleanup & robustness
  - Reused `projects` array (no duplication)
  - Small a11y & security (rel="noopener noreferrer")
*/

const NEON = {
  lime: "#39FF14",
  cyan: "#00FFFF",
  magenta: "#FF00FF",
  gray1: "#0B0B0B",
  gray2: "#111113",
  gray3: "#1a1a1d",
  stroke: "#2B2B2E",
};

function useForceDark() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    return () => root.classList.remove("dark");
  }, []);
}

const Section = ({ id, title, subtitle, children }) => (
  <section id={id} className="scroll-mt-28 py-14">
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{title}</h2>
        {subtitle ? <p className="mt-2 text-gray-300 leading-relaxed">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  </section>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{
      background: `linear-gradient(180deg, ${NEON.gray2}, ${NEON.gray3})`,
      borderColor: NEON.stroke,
    }}
  >
    {children}
  </div>
);

const Pill = ({ children }) => (
  <span
    className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-gray-200"
    style={{ borderColor: NEON.stroke, background: NEON.gray2 }}
  >
    {children}
  </span>
);

const Badge = ({ children }) => (
  <span
    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white"
    style={{ background: "linear-gradient(90deg, #333, #111)", border: `1px solid ${NEON.stroke}` }}
  >
    {children}
  </span>
);

const LinkPill = ({ href, label, icon }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition"
    style={{ border: `1px solid ${NEON.stroke}`, background: NEON.gray2 }}
    aria-label={label}
  >
    {icon}
    {label}
  </a>
);

const FloatingButtons = ({ phone, linkedin }) => (
  <div className="fixed bottom-5 left-5 md:left-8 z-50 flex flex-col gap-3" dir="ltr" aria-label="Quick contact buttons">
    <a
      href={`https://wa.me/${phone.replace("+", "")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full p-3 shadow-lg"
      style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}`, boxShadow: `0 0 16px ${NEON.lime}55` }}
      aria-label="WhatsApp"
    >
      <MessageCircle size={20} style={{ color: NEON.lime }} />
    </a>
    <a
      href={linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-full p-3 shadow-lg"
      style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}`, boxShadow: `0 0 16px ${NEON.cyan}55` }}
      aria-label="LinkedIn"
    >
      <Linkedin size={20} style={{ color: NEON.cyan }} />
    </a>
  </div>
);

// ---------- Data ----------
const kpiData = [
  { m: "Jan", Traffic: 1200, CTR: 1.1, CPA: 28 },
  { m: "Feb", Traffic: 1600, CTR: 1.4, CPA: 26 },
  { m: "Mar", Traffic: 2100, CTR: 1.7, CPA: 24 },
  { m: "Apr", Traffic: 2400, CTR: 1.9, CPA: 23 },
  { m: "May", Traffic: 3000, CTR: 2.0, CPA: 21 },
  { m: "Jun", Traffic: 3800, CTR: 2.3, CPA: 19 },
];

const projects = [
  {
    titleAR: "حملة محلية لمقهى — UGC + QR Coupons",
    titleEN: "Local Café Campaign — UGC + QR Coupons",
    pointsAR: ["تقسيم جمهور", "هوكس قصيرة (Reels)", "كوبونات QR تتبع التحويل"],
    pointsEN: ["Audience segmentation", "Short hooks (Reels)", "QR coupons for tracked conversions"],
  },
  {
    titleAR: "SEO للحرفيين — جدة التاريخية",
    titleEN: "SEO for Artisans — Historic Jeddah",
    pointsAR: ["جلب خارطة كلمات محلية", "قصص حرفيين", "خرائط Google"],
    pointsEN: ["Local keyword map", "Artisan storytelling", "Google Maps"],
  },
  {
    titleAR: "Landing + A/B — منشأة خدمات",
    titleEN: "Landing + A/B — Services Brand",
    pointsAR: ["نسختان A/B", "تحسين معدل التحويل", "لوحات KPI"],
    pointsEN: ["A/B variants", "Conversion uplift", "KPI dashboards"],
  },
];

const contact = {
  name: "فيصل عادل الحازمي",
  role: "Marketing Specialist (Early-Career) | صانع محتوى | استراتيجي رقمي",
  city: "جدة – المملكة العربية السعودية",
  email: "faisal.hazmi@outlook.sa",
  phone: "+966562525531",
  linkedin: "https://linkedin.com/in/faisal-alhazmi3",
};

// ---------- i18n Text ----------
const TEXT = {
  ar: {
    PORTFOLIO: "PORTFOLIO",
    portfolio: "محفظة أعمال فيصل عادل الحازمي",
    idCard: "بطاقة الهوية المهنية",
    shortMsg: "رسالة شخصية مختصرة",
    shortMsgBody:
      "أسوّق بالأرقام لا بالانطباعات. أحوّل رؤوس الأقلام إلى خطط قابلة للتنفيذ، وأحوّل البيانات إلى قرارات تؤدي لنتائج ملموسة: زيارات أعلى، تفاعل أذكى، وتحويلات بتكلفة أقل.",
    value: "بيان القيمة (Value Proposition)",
    valueBullets: [
      "عمق تحليلي + سرد بصري: مزيج SEO/تحليلات مع محتوى قصصي يحرّك الجمهور.",
      "تركيز على تجربة العميل: كل نقطة لمس مدروسة لخفض الاحتكاك ورفع الرضا والولاء.",
      "تسليمات واضحة: دراسات حالة، لوحات مؤشرات KPI، ونتائج قبل/بعد.",
    ],
    services: "الخدمات الأساسية",
    cases: "دراسات حالة (مختصرة)",
    case1: {
      t: "1) نمو عضوي عبر SEO لمتجر محلي (SMB)",
      ch: "التحدي: اعتماد مفرط على الإعلانات وضعف الزيارات العضوية.",
      ap: "النهج: تدقيق تقني + بحث كلمات + إعادة هيكلة الصفحات + تقويم محتوى.",
      im: "الأثر: زيادة الزيارات العضوية +15% وتحسن جودة الجلسات (زمن مكوث أطول/ارتداد أقل).",
    },
    case2: {
      t: "2) حضور محلي فعّال على خرائط Google",
      ch: "التحدي: ظهور ضعيف في نتائج «قريب مني».",
      ap: "النهج: تحسين الملف التجاري، محتوى محلي دوري، إدارة التقييمات، صور/فيديوهات قصيرة.",
      im: "الأثر: 600,000+ تفاعل (مشاهدات/اتجاهات/مكالمات) لعدة علامات.",
    },
    case3: {
      t: "3) بناء مجتمع على السوشال لمنشأة خدمات",
      ch: "التحدي: هوية متذبذبة وتفاعل متراجع.",
      ap: "النهج: سلاسل تعليمية/ترويجية، قوالب تصميم موحّدة، وإطار قياس تفاعل.",
      im: "الأثر: تحسّن ملحوظ في معدل التفاعل واستقرار الهوية وخفض تكلفة التفاعل.",
    },
    note: "ملاحظة: يمكن مشاركة لقطات لوحات التحليل ونتائج الحملات عند الطلب (مع إخفاء أي بيانات حساسة).",
    process: "طريقتي في العمل",
    processSub: "Discover (فهم السوق والجمهور) → Plan (أهداف ومؤشرات) → Build (محتوى/حملات) → Launch (إطلاق متدرّج) → Measure & Optimize (قياس وتحسين مستمر).",
    tshape: "المهارات المحورية (T-Shaped)",
    depth: "عمق",
    breadth: "اتساع",
    cx: "CX",
    exp: "الخبرة العملية (مع ربط مباشر بالقيمة)",
    transfers: "انتقال الخبرات (من التحصيل المالي إلى التسويق)",
    certs: "الشهادات والدورات — الصلة والفائدة العملية",
    creative: "Creative Lab (مختبر الإبداع)",
    packages: "حِزم خدمات منتَجة (Productized)",
    must: "ما يلزم لاستكمال القوة",
    reduce: "ما يُستحسن تقليله",
    edu: "التعليم",
    tools: "الأدوات والتقنيات",
    langs: "اللغات",
    contactTitle: "دعوة للتواصل",
    contactSub: "جاهز للتعاون مع فرق تبحث عن نموّ حقيقي يمكن قياسه. لنتحدث ونحوّل أهداف عملك إلى نتائج.",
    dataViz: "لوحات بيانات تفاعلية",
    share: "مشاركة عبر الباركود",
  },
  en: {
    PORTFOLIO: "PORTFOLIO",
    portfolio: "Faisal Alhazmi — Portfolio",
    idCard: "Professional Identity",
    shortMsg: "Personal Statement",
    shortMsgBody:
      "I market with numbers, not impressions. I turn bullet points into executable plans and data into measurable outcomes: more qualified traffic, smarter engagement, and lower acquisition costs.",
    value: "Value Proposition",
    valueBullets: [
      "Analytical Depth + Visual Storytelling (SEO/Analytics + narrative content).",
      "Customer Experience Focus: Frictionless touchpoints for satisfaction and loyalty.",
      "Clear Deliverables: Case studies, KPI dashboards, and before/after results.",
    ],
    services: "Core Services",
    cases: "Selected Case Studies",
    case1: {
      t: "1) Organic Growth via SEO for SMB",
      ch: "Challenge: High ads dependency; weak organic traffic.",
      ap: "Approach: Tech audit + keyword research + IA restructure + content calendar.",
      im: "Impact: +15% organic sessions; better session quality (time/bounce).",
    },
    case2: {
      t: "2) Effective Local Presence on Google Maps",
      ch: "Challenge: Poor visibility in ‘near me’ results.",
      ap: "Approach: GBP optimization, local content cadence, review management, short videos.",
      im: "Impact: 600,000+ interactions (views/directions/calls) across brands.",
    },
    case3: {
      t: "3) Building a Social Community for a Services Brand",
      ch: "Challenge: Wobbly identity and declining engagement.",
      ap: "Approach: Educational/promotional series, unified templates, measurement framework.",
      im: "Impact: Noticeable engagement lift, steadier identity, lower interaction cost.",
    },
    note: "Note: Analytics dashboards and campaign results available on request (sensitive data masked).",
    process: "My Working Method",
    processSub: "Discover → Plan → Build → Launch → Measure & Optimize.",
    tshape: "T-Shaped Skills",
    depth: "Depth",
    breadth: "Breadth",
    cx: "CX",
    exp: "Experience (Value-Linked)",
    transfers: "Skill Transfer (Collections → Marketing)",
    certs: "Certifications — Relevance & Benefit",
    creative: "Creative Lab",
    packages: "Productized Packages",
    must: "What’s Needed to Complete Strength",
    reduce: "What to Reduce",
    edu: "Education",
    tools: "Tools & Tech",
    langs: "Languages",
    contactTitle: "Get in Touch",
    contactSub: "Ready to help teams achieve measurable growth. Let's talk.",
    dataViz: "Interactive Data Boards",
    share: "Share via QR",
  },
};

export default function Portfolio() {
  useForceDark();

  // initial language: localStorage -> navigator -> 'ar'
  const getInitialLang = () => {
    if (typeof window === "undefined") return "ar";
    const saved = window.localStorage.getItem("lang");
    if (saved) return saved;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ar") ? "ar" : "en";
  };

  const [lang, setLang] = useState(getInitialLang);
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lang", lang);
    }
  }, [lang]);

  const L = TEXT[lang];
  const isAR = lang === "ar";
  const dir = isAR ? "rtl" : "ltr";

  const [showTraffic, setShowTraffic] = useState(true);
  const [showCTR, setShowCTR] = useState(true);
  const [showCPA, setShowCPA] = useState(true);

  const year = new Date().getFullYear();
  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://example.com";

  // ---- Sections order for pager ----
  const sections = ["home", "value", "services", "cases", "process", "skills", "experience", "certs", "projects", "packages", "completion", "education", "tools", "langs", "viz", "contact"];
  const [active, setActive] = useState(0);
  const observerRef = useRef(null);

  // Watch active section
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const observed = [];
    const cb = (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = sections.indexOf(e.target.id);
          if (idx !== -1) setActive(idx);
        }
      });
    };

    const observer = new IntersectionObserver(cb, { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    observerRef.current = observer;

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observed.push(el);
      }
    });

    return () => {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      observerRef.current = null;
    };
  }, [sections]);

  const scrollToId = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      if (typeof history !== "undefined") {
        history.replaceState(null, "", `#${id}`);
      }
    }
  }, []);

  const goNext = useCallback(() => scrollToId(sections[Math.min(active + 1, sections.length - 1)]), [active, sections, scrollToId]);
  const goPrev = useCallback(() => scrollToId(sections[Math.max(active - 1, 0)]), [active, sections, scrollToId]);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  const skillsDepthAR = ["SEO & Content Strategy", "تحليلات الأداء ولوحات مؤشرات (KPI/ROAS/CAC/LTV)"];
  const skillsBreadthAR = ["إدارة Meta/LinkedIn/X", "إعلانات Google/Meta", "بحوث سوق", "كتابة عربية/إنجليزية"];
  const skillsCXAR = ["تصميم رحلات العميل", "تبسيط نقاط الاتصال", "قياس الرضا"];

  const skillsDepthEN = ["SEO & Content Strategy", "Performance Analytics & Dashboards (KPI/ROAS/CAC/LTV)"];
  const skillsBreadthEN = ["Meta/LinkedIn/X", "Google Ads", "Market Research", "Arabic/English Copywriting"];
  const skillsCXEN = ["Customer Journeys", "Touchpoint Simplification", "Satisfaction Measurement"];

  const expAR = [
    { role: "مستقل – تسويق وصناعة محتوى", time: "2023–الآن", bullets: ["قيادة مشاريع كاملة من الاستراتيجية إلى التحليل", "نتائج قابلة للقياس (SEO، Social، Paid)"] },
    { role: "متدرب تسويق – AAG Technology", time: "مايو–أغسطس 2024", bullets: ["حملات قائمة على البيانات", "بحوث سوق", "تحليل أداء"] },
    { role: "إدارة منصات – Rakaez Alsalamah", time: "2019–2021", bullets: ["تقويم نشر", "تحسين التفاعل", "ضبط الهوية البصرية"] },
    { role: "متطوع – Vision Group (BEVOL)", time: "2022–الآن", bullets: ["محتوى توعوي يعزّز الوصول والمشاركة"] },
    { role: "تحصيل مالي سابق", time: "2014–2019", bullets: ["تفاوض وإدارة اعتراضات → Copy مقنع وإدارة سمعة"] },
  ];

  const expEN = [
    { role: "Freelance — Marketing & Content", time: "2023–Present", bullets: ["Full-cycle projects from strategy to analytics", "Measurable outcomes (SEO, Social, Paid)"] },
    { role: "Marketing Intern — AAG Technology", time: "May–Aug 2024", bullets: ["Data-led campaigns", "Market research", "Performance analysis"] },
    { role: "Platform Manager — Rakaez Alsalamah", time: "2019–2021", bullets: ["Content calendar", "Engagement uplift", "Visual identity consistency"] },
    { role: "Volunteer — Vision Group (BEVOL)", time: "2022–Present", bullets: ["Awareness content growing reach & participation"] },
    { role: "Collections (Past)", time: "2014–2019", bullets: ["Negotiation & objection handling → persuasive copy & ORM"] },
  ];

  const certs = [
    { n: "Meta Certified Digital Marketing Associate", rAR: "منظومة Meta الإعلانية ونمو الجمهور", vAR: "استهداف أدق وتخفيض تكلفة الاكتساب", rEN: "Meta ads ecosystem & audience growth", vEN: "Sharper targeting & lower CAC" },
    { n: "Google Ads & Digital Marketing", rAR: "بحث/عرض/يوتيوب وقياس العائد", vAR: "Leads أعلى جودة وخفض تكلفة التحويل", rEN: "Search/Display/YouTube & measurement", vEN: "Higher-quality leads & lower CPA" },
    { n: "Hootsuite Social Media Marketing", rAR: "تعدد القنوات وأتمتة النشر والمتابعة", vAR: "كفاءة تشغيلية وتقارير تنفيذية واضحة", rEN: "Omnichannel ops & automation", vEN: "Ops efficiency & exec reporting" },
    { n: "IBM – Artificial Intelligence Fundamentals (Capstone)", rAR: "تطبيقات الذكاء الاصطناعي في التحليل والتخصيص", vAR: "تقسيم جماهير دقيق ورسائل مخصّصة ترفع التحويل", rEN: "AI for analytics & personalization", vEN: "Sharper segments & tailored messaging" },
    { n: "UX Design Virtual Internship – Foodics", rAR: "مبادئ UX ورسم الرحلات وتحسين المسارات", vAR: "صفحات هبوط وتجارب شراء تُحسّن التحويل والرضا", rEN: "UX principles & journey mapping", vEN: "Better landing pages & satisfaction" },
    { n: "MBC Academy – Filmmaking", rAR: "سرد بصري، تصوير ومونتاج للفيديوهات التسويقية", vAR: "Reels/Shorts مقنعة تزيد الوصول والمشاركة", rEN: "Visual storytelling & editing", vEN: "Compelling reels that boost reach" },
    { n: "Occupational Safety & Health Practitioner (240h – Saif/HRDF)", rAR: "انضباط وإدارة مخاطر للفعاليات والحملات الميدانية", vAR: "تنفيذ تنشيطات بأمان وامتثال وصورة مسؤولة", rEN: "Discipline & risk for on-ground ops", vEN: "Safe activations & compliant image" },
  ];

  const essentialsAR = ["شهادات/اقتباسات قصيرة من عميل أو مشرف (LinkedIn/رسمي)", "2–3 روابط علنية لأعمال (مقال/لاندينغ/سلسلة بوستات)", "صور قبل/بعد لكل دراسة حالة"];
  const reduceAR = ["عناصر غير مباشرة بالتسويق (تنقل للملحق)", "سرد بلا أرقام؛ الأفضل كل ادّعاء ↔ قياس", "زخارف بصرية كثيرة على حساب المقروئية"];
  const essentialsEN = ["Short testimonials", "2–3 public work links", "Before/after visuals per case"];
  const reduceEN = ["Indirect items → Appendix", "Claims without metrics", "Over-decorative visuals"];

  const navItems = [
    { id: "value", label: L.value },
    { id: "services", label: L.services },
    { id: "cases", label: L.cases },
    { id: "viz", label: L.dataViz },
    { id: "projects", label: "Projects" },
    { id: "contact", label: L.contactTitle },
  ];

  return (
    <div dir={dir} lang={lang} className="min-h-screen text-white" style={{ background: NEON.gray1 }}>
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: NEON.stroke, background: "rgba(0,0,0,0.6)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <a href="#home" className="font-black tracking-tight text-lg" aria-label="Home">
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">{L.PORTFOLIO}</span>
          </a>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-gray-200" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="hover:text-white"
                aria-current={sections[active] === item.id ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang((p) => (p === "ar" ? "en" : "ar"))}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold"
              style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}` }}
              aria-label={isAR ? "تبديل اللغة إلى الإنجليزية" : "Switch language to Arabic"}
            >
              <Languages size={16} /> {isAR ? "EN" : "AR"}
            </button>
            <a
              href="#contact"
              className="hidden sm:inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-bold"
              style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}`, boxShadow: `0 0 14px ${NEON.magenta}55` }}
            >
              {isAR ? "لنتحدث" : "Let's Talk"}
            </a>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-70">
          <div
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full"
            style={{ background: `radial-gradient(closest-side, #1E1E1E, transparent 60%)` }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7">
              <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="leading-[1.1]">
                <span className="block text-[40px] sm:text-6xl md:text-7xl font-black tracking-tight">
                  <span className="relative inline-block">
                    <span className="text-transparent [text-stroke:1px_#BBB]">{isAR ? "فيصل عادل" : "Faisal Alhazmi"}</span>
                    <span
                      className="absolute inset-0 bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mix-blend-screen"
                      aria-hidden
                    >
                      {isAR ? "فيصل عادل" : "Faisal Alhazmi"}
                    </span>
                  </span>
                </span>
                <span className="mt-2 block text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-200">
                  Marketing Specialist (Early-Career) | Content Creator | Digital Strategist
                </span>
                <span className="mt-1 block text-sm text-gray-400">Jeddah — Saudi Arabia</span>
              </motion.h1>

              <div className="mt-4">
                <Badge>
                  <Sparkles size={14} style={{ color: NEON.lime }} /> {L.portfolio}
                </Badge>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ border: `1px solid ${NEON.stroke}`, background: NEON.gray2 }}
                >
                  <Mail size={16} /> {contact.email}
                </a>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5"
                  style={{ border: `1px solid ${NEON.stroke}`, background: NEON.gray2 }}
                >
                  <Phone size={16} /> +966 56 252 5531
                </a>
                <LinkPill href={contact.linkedin} label="LinkedIn" icon={<Linkedin size={16} style={{ color: NEON.cyan }} />} />
              </div>
            </div>

            <div className="md:col-span-5">
              <Card className="p-6">
                <h3 className="font-extrabold text-lg">{L.shortMsg}</h3>
                <p className="mt-3 text-gray-200 leading-relaxed">{L.shortMsgBody}</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Section id="value" title={L.value}>
        <div className="grid md:grid-cols-3 gap-4">
          {L.valueBullets.map((x, i) => (
            <Card key={i} className="p-6">
              <h3 className="font-bold text-white">{x.split(":")[0]}</h3>
              <p className="mt-2 text-gray-300">{x.split(":").slice(1).join(":")}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="services" title={L.services}>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              tAR: "استراتيجية تسويق رقمي",
              dAR: "بحوث سوق، Personas، خرائط Journey، اختيار قنوات النمو، ولوحة أهداف (OKRs/KPIs).",
              tEN: "Digital Marketing Strategy",
              dEN: "Market research, personas, journeys, growth channels, OKRs/KPIs.",
            },
            {
              tAR: "SEO & Content Engine",
              dAR: "تدقيق تقني، خارطة محتوى، بنية داخلية وروابط، تتبّع ترتيب الكلمات وجودة الزيارات.",
              tEN: "SEO & Content Engine",
              dEN: "Tech audit, content map, internal linking, rank & quality tracking.",
            },
            {
              tAR: "Social & Content Ops",
              dAR: "نبرة صوت موحّدة، تقويم محتوى ربعي، Reels/Shorts، مع حوكمة قوالب وتصميم.",
              tEN: "Social & Content Ops",
              dEN: "Unified voice, quarterly calendar, Reels/Shorts, template governance.",
            },
            {
              tAR: "Paid Media (Google/Meta)",
              dAR: "استراتيجية إعلانات، اختبار A/B، تحسين ROAS، وتتبع تحليلي شفاف.",
              tEN: "Paid Media (Google/Meta)",
              dEN: "Ad strategy, A/B testing, ROAS optimization, transparent analytics.",
            },
            {
              tAR: "Digital PR & ORM",
              dAR: "بيانات صحفية، إدارة الانطباعات، استجابة للأزمات، ورصد مذكورات العلامة.",
              tEN: "Digital PR & ORM",
              dEN: "Press releases, reputation management, crisis response, brand mentions.",
            },
            {
              tAR: "تجربة العميل (CX)",
              dAR: "Chatbot/FAQ ثنائي اللغة، برامج ولاء، آليات Feedback، ولوحات CX لقياس الرضا.",
              tEN: "Customer Experience (CX)",
              dEN: "Bilingual chatbot/FAQ, loyalty, feedback loops, CX dashboards.",
            },
          ].map((s, idx) => (
            <Card key={idx} className="p-6 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition">
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 inline-flex w-2.5 h-2.5 rounded-full"
                  style={{ background: idx % 3 === 0 ? NEON.lime : idx % 3 === 1 ? NEON.cyan : NEON.magenta }}
                ></span>
                <div>
                  <h3 className="font-bold text-white">{isAR ? s.tAR : s.tEN}</h3>
                  <p className="mt-2 text-gray-300 leading-relaxed">{isAR ? s.dAR : s.dEN}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="cases" title={L.cases}>
        <div className="grid md:grid-cols-3 gap-4">
          {[L.case1, L.case2, L.case3].map((c, i) => (
            <Card key={i} className="p-6 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Badge>{isAR ? "دراسة حالة" : "Case Study"}</Badge>
                <h3 className="font-extrabold text-lg">{c.t}</h3>
              </div>
              <ul className="space-y-2 text-sm leading-relaxed text-gray-300">
                <li>{c.ch}</li>
                <li>{c.ap}</li>
                <li>{c.im}</li>
              </ul>
              <p className="mt-2 text-xs text-gray-400">{L.note}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="process" title={L.process} subtitle={L.processSub}>
        <div className="grid md:grid-cols-5 gap-3">
          {["Discover", "Plan", "Build", "Launch", "Measure & Optimize"].map((step, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                  style={{ backgroundColor: [NEON.lime, NEON.cyan, NEON.magenta, "#FFF", "#AAA"][i] || "#FFF" }}
                >
                  {i + 1}
                </div>
                <h4 className="font-bold text-white">{step}</h4>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="skills" title={L.tshape}>
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6">
            <h3 className="font-bold text-white">{L.depth}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isAR ? skillsDepthAR : skillsDepthEN).map((s, i) => (
                <Pill key={i}>{s}</Pill>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-white">{L.breadth}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isAR ? skillsBreadthAR : skillsBreadthEN).map((s, i) => (
                <Pill key={i}>{s}</Pill>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-white">{L.cx}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(isAR ? skillsCXAR : skillsCXEN).map((s, i) => (
                <Pill key={i}>{s}</Pill>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      <Section id="experience" title={L.exp}>
        <div className="grid md:grid-cols-2 gap-4">
          {(isAR ? expAR : expEN).map((e, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">{e.role}</h3>
                <span className="text-xs text-gray-400">{e.time}</span>
              </div>
              <ul className="mt-3 list-disc pr-5 space-y-1 text-gray-300">
                {e.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            { fromAR: "التفاوض والإقناع", toAR: "كتابة إعلانات ورسائل تواجه الاعتراضات وتزيلها", fromEN: "Negotiation & Persuasion", toEN: "Ad copy that anticipates & resolves objections" },
            { fromAR: "الانضباط الرقمي", toAR: "تتبّع مؤشرات دقيق وتقارير أداء مفهومة للإدارة", fromEN: "Digital discipline", toEN: "Accurate KPI tracking & exec-friendly reporting" },
            { fromAR: "التواصل تحت الضغط", toAR: "جاهزية لإدارة أزمات PR وحملات زمنية حساسة", fromEN: "Calm communication under pressure", toEN: "Crisis-ready PR & time-sensitive campaigns" },
          ].map((t, i) => (
            <Card key={i} className="p-5">
              <h4 className="font-bold text-white">{isAR ? t.fromAR : t.fromEN}</h4>
              <p className="mt-1 text-sm text-gray-300">↦ {isAR ? t.toAR : t.toEN}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="certs" title={L.certs}>
        <div className="grid md:grid-cols-2 gap-4">
          {certs.map((c, i) => (
            <Card key={i} className="p-5">
              <h3 className="font-bold">{c.n}</h3>
              <p className="mt-2 text-sm text-gray-300">
                <strong>{isAR ? "الصلة" : "Relevance"}:</strong> {isAR ? c.rAR : c.rEN}
              </p>
              <p className="text-sm text-gray-300">
                <strong>{isAR ? "الفائدة" : "Benefit"}:</strong> {isAR ? c.vAR : c.vEN}
              </p>
            </Card>
          ))}
          {/* IBM Badges */}
          <Card className="p-6 grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-bold mb-2">IBM SkillsBuild — Artificial Intelligence Fundamentals (Capstone)</h3>
              <p className="text-sm text-gray-300 mb-3">شهادة/Badge من IBM تثبت الأساسيات العملية في الذكاء الاصطناعي مع مشروع تطبيقي.</p>
              <div className="flex flex-wrap gap-2">
                <LinkPill href="https://www.credly.com/badges/4da2e898-d670-44b9-a19d-704178544a65" label={isAR ? "تحقق من الشهادة" : "Verify Badge"} icon={<Sparkles size={16} style={{ color: NEON.lime }} />} />
                <LinkPill href="sandbox:/mnt/data/IBMDesign20250726-30-eppl3f.pdf" label={isAR ? "عرض ملف الشهادة (PDF)" : "View Certificate (PDF)"} icon={<Sparkles size={16} style={{ color: NEON.cyan }} />} />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="sandbox:/mnt/data/Digital_Sticker_Use Gen AI for Software Development.png"
                alt="IBM Use Gen AI for Software Development"
                className="max-h-40 w-auto rounded-xl border"
                style={{ borderColor: NEON.stroke }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </Card>

          <Card className="p-6 grid sm:grid-cols-2 gap-6 items-center">
            <div>
              <h3 className="font-bold mb-2">IBM Granite Models for Software Development</h3>
              <p className="text-sm text-gray-300 mb-3">ملصق/Sticker تقني مرتبط بنماذج Granite الداعمة للتطوير البرمجي.</p>
              <div className="flex flex-wrap gap-2">
                <LinkPill href="sandbox:/mnt/data/Digital Sticker_IBM Granite Models for Software Development (1).png" label={isAR ? "فتح الصورة" : "Open Image"} icon={<Sparkles size={16} style={{ color: NEON.magenta }} />} />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img
                src="sandbox:/mnt/data/Digital Sticker_IBM Granite Models for Software Development (1).png"
                alt="IBM Granite Models Sticker"
                className="max-h-40 w-auto rounded-xl border"
                style={{ borderColor: NEON.stroke }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </Card>
        </div>
      </Section>

      <Section id="projects" title={isAR ? "مشاريع وأعمال مختارة" : "Selected Projects & Work"}>
        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((p, i) => (
            <Card key={i} className="p-6">
              <h3 className="font-bold text-white">{isAR ? p.titleAR : p.titleEN}</h3>
              <ul className="mt-3 space-y-1 text-gray-300 text-sm list-disc pr-5">
                {(isAR ? p.pointsAR : p.pointsEN).map((pt, j) => (
                  <li key={j}>{pt}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="packages" title={L.packages}>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { nAR: "Starter", ptsAR: ["تدقيق SEO", "خطة محتوى شهرية", "8 بوستات"], nEN: "Starter", ptsEN: ["SEO audit", "Monthly content plan", "8 posts"] },
            { nAR: "Growth", ptsAR: ["كل ما في Starter", "إدارة إعلانات Google/Meta", "لوحة تحكم أسبوعية"], nEN: "Growth", ptsEN: ["Starter +", "Google/Meta ads mgmt", "Weekly dashboard"] },
            { nAR: "Scale", ptsAR: ["كل ما في Growth", "برنامج مؤثّرين", "اختبارات A/B متقدمة", "استبيانات CX"], nEN: "Scale", ptsEN: ["Growth +", "Influencer program", "Advanced A/B", "CX surveys"] },
          ].map((p, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-lg">{isAR ? p.nAR : p.nEN}</h3>
                <Badge>{isAR ? "يمكن تخصيصها" : "Customizable"}</Badge>
              </div>
              <ul className="mt-3 space-y-2 text-gray-300">
                {(isAR ? p.ptsAR : p.ptsEN).map((pt, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-2"
                      style={{ background: i === 0 ? NEON.lime : i === 1 ? NEON.cyan : NEON.magenta }}
                    ></span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-gray-400">
                {isAR ? "* التسعير والحدود الأخلاقية تُدرج في الملحق حسب نطاق كل مشروع." : "* Pricing & ethics in appendix per scope."}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="completion" title={`${L.must} / ${L.reduce}`}>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-6">
            <h3 className="font-bold text-white">{L.must}</h3>
            <ul className="mt-3 list-disc pr-5 space-y-1 text-gray-300">
              {(isAR ? essentialsAR : essentialsEN).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-white">{L.reduce}</h3>
            <ul className="mt-3 list-disc pr-5 space-y-1 text-gray-300">
              {(isAR ? reduceAR : reduceEN).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Section>

      <Section id="education" title={L.edu}>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="font-bold">
                {isAR ? "دبلوم متوسط في التسويق – جامعة الملك عبدالعزيز" : "Associate Diploma in Marketing — King Abdulaziz University"}
              </h3>
              <p className="text-gray-300">{isAR ? "4.60/5.00 – مرتبة الشرف الثانية – يناير 2024" : "GPA 4.60/5.00 — Second Honors — Jan 2024"}</p>
            </div>
            <Badge>{isAR ? "خريج حديث" : "Recent Graduate"}</Badge>
          </div>
        </Card>
      </Section>

      <Section id="tools" title={L.tools}>
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            {[
              "Excel (Pivot/Dashboards)",
              "Google Analytics",
              "Google Ads",
              "Meta Business Suite",
              "Zoho CRM",
              "Canva",
              "Adobe Express",
              "Figma (Basic)",
              "Notion",
              "Ubersuggest",
              "Google Search Console",
              "SEMrush",
            ].map((t, i) => (
              <Pill key={i}>{t}</Pill>
            ))}
          </div>
        </Card>
      </Section>

      <Section id="langs" title={L.langs}>
        <Card className="p-6">
          <div className="flex flex-wrap gap-2">
            <Pill>{isAR ? "العربية (لغة أم)" : "Arabic (Native)"}</Pill>
            <Pill>{isAR ? "الإنجليزية (محترف)" : "English (Professional)"}</Pill>
          </div>
        </Card>
      </Section>

      <Section id="viz" title={L.dataViz} subtitle={isAR ? "عينات حيّة: زيارات، CTR، و CPA" : "Live samples: Traffic, CTR, CPA"}>
        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
            <button
              onClick={() => setShowTraffic((v) => !v)}
              className="rounded-full px-3 py-1 font-bold"
              style={{ background: showTraffic ? `${NEON.lime}22` : NEON.gray2, border: `1px solid ${showTraffic ? NEON.lime : NEON.stroke}`, color: showTraffic ? NEON.lime : "#DDD" }}
            >
              Traffic
            </button>
            <button
              onClick={() => setShowCTR((v) => !v)}
              className="rounded-full px-3 py-1 font-bold"
              style={{ background: showCTR ? `${NEON.cyan}22` : NEON.gray2, border: `1px solid ${showCTR ? NEON.cyan : NEON.stroke}`, color: showCTR ? NEON.cyan : "#DDD" }}
            >
              CTR%
            </button>
            <button
              onClick={() => setShowCPA((v) => !v)}
              className="rounded-full px-3 py-1 font-bold"
              style={{ background: showCPA ? `${NEON.magenta}22` : NEON.gray2, border: `1px solid ${showCPA ? NEON.magenta : NEON.stroke}`, color: showCPA ? NEON.magenta : "#DDD" }}
            >
              CPA
            </button>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChartWrapper data={kpiData} showTraffic={showTraffic} showCTR={showCTR} showCPA={showCPA} />
            </ResponsiveContainer>
          </div>
        </Card>
      </Section>

      <Section id="contact" title={L.contactTitle} subtitle={L.contactSub}>
        <Card className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <form onSubmit={(e) => e.preventDefault()} className="grid sm:grid-cols-2 gap-3" aria-label="Contact form">
                <input
                  required
                  placeholder={isAR ? "اسمك" : "Your name"}
                  className="w-full rounded-xl px-4 py-3 text-white"
                  style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}` }}
                  aria-label={isAR ? "اسمك" : "Your name"}
                />
                <input
                  required
                  type="email"
                  placeholder={isAR ? "إيميلك" : "Your email"}
                  className="w-full rounded-xl px-4 py-3 text-white"
                  style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}` }}
                  aria-label={isAR ? "إيميلك" : "Your email"}
                />
                <input
                  placeholder={isAR ? "شركة/جهة (اختياري)" : "Company (optional)"}
                  className="sm:col-span-2 rounded-xl px-4 py-3 text-white"
                  style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}` }}
                  aria-label={isAR ? "شركة أو جهة" : "Company"}
                />
                <textarea
                  required
                  placeholder={isAR ? "رسالتك" : "Your message"}
                  rows={4}
                  className="sm:col-span-2 rounded-xl px-4 py-3 text-white"
                  style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}` }}
                  aria-label={isAR ? "رسالتك" : "Your message"}
                />
                <div className="sm:col-span-2 flex items-center justify-between gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-3 font-bold"
                    style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}`, boxShadow: `0 0 14px ${NEON.cyan}44` }}
                  >
                    {isAR ? "إرسال" : "Send"}
                  </button>
                  <div className="flex items-center gap-3 text-sm">
                    <a href={`mailto:${contact.email}`} className="underline">
                      {contact.email}
                    </a>
                    <span className="opacity-60">|</span>
                    <a href={`tel:${contact.phone.replace(/\s+/g, "")}`} className="underline">
                      +966 56 252 5531
                    </a>
                  </div>
                </div>
              </form>
            </div>
            <div>
              <div className="space-y-4">
                <h4 className="font-bold text-white">{L.share}</h4>
                <div className="flex items-center gap-3">
                  <div role="img" aria-label={isAR ? "رمز QR لمشاركة البورتفوليو" : "QR code to share the portfolio"}>
                    <QRCodeCanvas
                      value={shareUrl}
                      bgColor="#111113"
                      fgColor="#FFFFFF"
                      style={{ width: 112, height: 112, borderRadius: 12, border: `1px solid ${NEON.stroke}` }}
                    />
                  </div>
                  <div className="text-xs text-gray-400">
                    <p>{isAR ? "امسح لمشاركة البورتفوليو" : "Scan to share the portfolio"}</p>
                    <p className="mt-1 break-all opacity-70">{shareUrl}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <LinkPill href={contact.linkedin} label="LinkedIn" icon={<Linkedin size={16} style={{ color: NEON.cyan }} />} />
                  <LinkPill href={`https://wa.me/${contact.phone.replace("+", "")}`} label="WhatsApp" icon={<MessageCircle size={16} style={{ color: NEON.lime }} />} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Section>

      <footer className="py-10 border-t" style={{ borderColor: NEON.stroke }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-sm text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            © {year} {isAR ? "فيصل عادل الحازمي" : "Faisal Alhazmi"}. {isAR ? "كل الحقوق محفوظة." : "All rights reserved."}
          </p>
          <div className="flex items-center gap-3">
            <a href="#home" className="hover:underline">
              {isAR ? "الصفحة الرئيسية" : "Home"}
            </a>
            <span className="opacity-50">•</span>
            <a href={contact.linkedin} className="hover:underline" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
          </div>
        </div>
      </footer>

      {/* Floating page pager */}
      <div className="fixed bottom-5 inset-x-0 z-50 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <div
          className="pointer-events-auto flex items-center gap-3 rounded-full px-3 py-2"
          style={{ background: NEON.gray2, border: `1px solid ${NEON.stroke}`, boxShadow: `0 0 16px rgba(255,255,255,0.06)` }}
        >
          <button onClick={goPrev} className="px-3 py-1 text-sm font-bold rounded-full hover:opacity-90" style={{ border: `1px solid ${NEON.stroke}` }}>
            {isAR ? "السابق" : "Prev"}
          </button>
          <div className="flex items-center gap-1">
            {sections.map((id, i) => (
              <button
                key={id}
                onClick={() => scrollToId(id)}
                aria-label={id}
                className="w-2.5 h-2.5 rounded-full transition"
                style={{ background: i === active ? "#fff" : NEON.stroke }}
              />
            ))}
          </div>
          <button onClick={goNext} className="px-3 py-1 text-sm font-bold rounded-full hover:opacity-90" style={{ border: `1px solid ${NEON.stroke}` }}>
            {isAR ? "التالي" : "Next"}
          </button>
        </div>
      </div>

      {/* Sticky WhatsApp/LinkedIn */}
      <FloatingButtons phone={contact.phone} linkedin={contact.linkedin} />

      <style>{`
        @media print {
          header, footer, nav, .fixed { display: none !important; }
          section { page-break-inside: avoid; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
        .[text-stroke\\:1px_\\#BBB] { -webkit-text-stroke: 1px #BBB; text-stroke: 1px #BBB; }
      `}</style>
    </div>
  );
}

// ---------- Chart Wrapper (fixed & improved) ----------
function ComposedChartWrapper({ data, showTraffic, showCTR, showCPA }) {
  const valueFormatter = (value, name) => {
    if (name === "CTR") return [`${value.toFixed(1)}%`, "CTR"];
    if (name === "CPA") return [`$${value}`, "CPA"];
    return [value, name];
  };

  return (
    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
      <defs>
        <linearGradient id="gLime" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON.lime} stopOpacity={0.45} />
          <stop offset="100%" stopColor={NEON.lime} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON.cyan} stopOpacity={0.45} />
          <stop offset="100%" stopColor={NEON.cyan} stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="gMagenta" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={NEON.magenta} stopOpacity={0.45} />
          <stop offset="100%" stopColor={NEON.magenta} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      <CartesianGrid stroke={NEON.stroke} strokeDasharray="3 3" />
      <XAxis dataKey="m" stroke="#BFBFBF" />
      {/* Left axis for Traffic */}
      <YAxis yAxisId="left" stroke="#BFBFBF" />
      {/* Right axis for CPA */}
      <YAxis yAxisId="right" orientation="right" stroke="#BFBFBF" tickFormatter={(v) => `$${v}`} />
      {/* Hidden right axis for CTR (0–5%) to normalize scale) */}
      <YAxis yAxisId="right2" orientation="right" hide domain={[0, 5]} />

      <Tooltip
        contentStyle={{ background: "#0F0F10", border: `1px solid ${NEON.stroke}`, color: "#fff" }}
        formatter={valueFormatter}
        labelStyle={{ color: "#EEE" }}
      />
      <Legend />

      {showTraffic && <Area yAxisId="left" type="monotone" dataKey="Traffic" stroke={NEON.lime} fill="url(#gLime)" strokeWidth={2} />}
      {showCTR && <Area yAxisId="right2" type="monotone" dataKey="CTR" stroke={NEON.cyan} fill="url(#gCyan)" strokeWidth={2} />}
      {showCPA && <Area yAxisId="right" type="monotone" dataKey="CPA" stroke={NEON.magenta} fill="url(#gMagenta)" strokeWidth={2} />}
    </AreaChart>
  );
}