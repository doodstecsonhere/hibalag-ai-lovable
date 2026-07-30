export const LANGUAGES = ["bisaya", "english", "tagalog"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  bisaya: { short: "Bis", full: "Bisaya" },
  english: { short: "Eng", full: "English" },
  tagalog: { short: "Tag", full: "Tagalog" },
};

const bisaya = {
  // Header
  "header.menu": "Ablihi ang menu ug chat history",
  "header.schedule": "Ablihi ang schedule canvas",
  "header.status.active": "Active",
  "header.status.offline": "Offline mode",
  "header.status.synced": "Synced",
  "header.language": "Pilia ang pinulongan",

  // Canvas trigger / sheet
  "canvas.fab": "Tan-awa ang Schedule Canvas",
  "canvas.sheetTitle": "Schedule Canvas",
  "canvas.sheetDescription": "Browse ug filter sa mga Founders Week events.",

  // Chat panel
  "chat.offlineBanner":
    "Offline ka karon — mabasa gihapon ang schedule sa Canvas, pero ang chat mo-balik inig signal.",
  "chat.welcomeTitle": "Kumusta, Sillimanian!",
  "chat.welcomeBody":
    "Ako si Hibalag AI...\nimong guide sa Founders Week ug Hibalag Festival karong August.\nPangutana kabahin sa schedule, venues, o itinerary.",
  "chat.thinking": "Naghuna-huna si Hibalag AI…",
  "chat.error": "Naay problema sa pagtubag. Sulayi pag-usab sa makadiyot.",
  "chat.placeholder": "Pangutana bahin sa Hibalag…",
  "chat.send": "Ipadala",
  "chat.aria": "Pakigsulti kang Hibalag AI",
  "chat.suggestion1": "Unsa'y events karong adlawa?",
  "chat.suggestion2": "Naa'y open house?",
  "chat.suggestion3": "When ang parade?",
  "chat.suggestion4": "Alumni homecoming activities?",
  "chat.suggestion5": "Ang Miss Silliman?",

  // Canvas panel
  "canvas.aria": "Canvas sa schedule sa festival",
  "canvas.title": "Schedule Canvas",
  "canvas.count": "{count} event · Ago 1–29, 2026",
  "canvas.offlineCopy": "Offline copy",
  "canvas.close": "Isira ang canvas",
  "canvas.search": "Pangitaa ang event, venue, o org…",
  "canvas.allDays": "Tanang adlaw",
  "canvas.dayChip": "Ago {day}",
  "canvas.retry": "Sulayi pag-usab",
  "canvas.empty": "Walay event nga mo-match ani nga filter, bay. Sulayi ug lain nga adlaw o category.",
  "canvas.dateTba": "Wala pa'y petsa",
  "canvas.footer": "Silliman University · Founders Day Celebration",
  "category.Featured": "Featured",
  "category.Religious": "Relihiyoso",
  "category.Alumni": "Alumni",
  "category.Cultural": "Kultural",
  "category.Parties": "Parties",

  // Thread drawer
  "threads.title": "Mga chat",
  "threads.close": "Isira ang history",
  "threads.new": "Bag-ong chat",
  "threads.empty": "Wala pa'y chat. Sugdi ug pangutana!",
  "threads.migrateBody": "Naa ka'y {count} guest chat dinhi sa device. I-save sa imong account?",
  "threads.migrateAction": "I-sync sa account",
  "threads.save": "I-save ang titulo",
  "threads.rename": "Usba ang ngalan sa {title}",
  "threads.delete": "Papasa ang {title}",
  "threads.logout": "Log out",
  "threads.login": "Log in (optional)",

  // Auth dialog
  "auth.signinTitle": "Log in sa Hibalag AI",
  "auth.signupTitle": "Paghimo ug account",
  "auth.description":
    "Optional ni — ang chat mo-gana bisan guest. Mag-login lang kung gusto nimo ma-sync ang imong mga chat sa tanan nimong device.",
  "auth.google": "Padayon gamit ang Google",
  "auth.or": "o gamita ang email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Log in",
  "auth.signup": "Sign up",
  "auth.toSignup": "Wala pa'y account? Sign up",
  "auth.toSignin": "Naa na'y account? Log in",
  "auth.confirm": "Check your email para ma-confirm ang account.",
  "auth.failed": "Naay problema sa pag-login.",

  // Install prompt
  "install.title": "I-install ang Hibalag AI",
  "install.body": "I-add sa imong home screen para paspas ug ma-browse ang schedule bisan walay signal.",
  "install.action": "Install",
  "install.later": "Sa lain na lang",
  "install.dismiss": "Isalikway ang install prompt",
} as const;

export type TranslationKey = keyof typeof bisaya;

const english: Record<TranslationKey, string> = {
  "header.menu": "Open menu and chat history",
  "header.schedule": "Open schedule canvas",
  "header.status.active": "Active",
  "header.status.offline": "Offline mode",
  "header.status.synced": "Synced",
  "header.language": "Select language",

  "canvas.fab": "View Schedule Canvas",
  "canvas.sheetTitle": "Schedule Canvas",
  "canvas.sheetDescription": "Browse and filter Founders Week events.",

  "chat.offlineBanner":
    "You're offline — the Canvas schedule still works, and chat returns once you have signal.",
  "chat.welcomeTitle": "Hello, Sillimanian!",
  "chat.welcomeBody":
    "I'm Hibalag AI...\nyour guide to Founders Week and the Hibalag Festival this August.\nAsk me about the schedule, venues, or itineraries.",
  "chat.thinking": "Hibalag AI is thinking…",
  "chat.error": "Something went wrong. Please try again in a moment.",
  "chat.placeholder": "Ask about Founders Day…",
  "chat.send": "Send",
  "chat.aria": "Chat with Hibalag AI",
  "chat.suggestion1": "What events are on today?",
  "chat.suggestion2": "Is there an open house?",
  "chat.suggestion3": "When is the parade?",
  "chat.suggestion4": "Alumni homecoming activities?",
  "chat.suggestion5": "Tell me about Miss Silliman",

  "canvas.aria": "Festival schedule canvas",
  "canvas.title": "Schedule Canvas",
  "canvas.count": "{count} events · Aug 1–29, 2026",
  "canvas.offlineCopy": "Offline copy",
  "canvas.close": "Close canvas",
  "canvas.search": "Search event, venue, or org…",
  "canvas.allDays": "All days",
  "canvas.dayChip": "Aug {day}",
  "canvas.retry": "Try again",
  "canvas.empty": "No events match these filters. Try another day or category.",
  "canvas.dateTba": "Date TBA",
  "canvas.footer": "Silliman University · Founders Day Celebration",
  "category.Featured": "Featured",
  "category.Religious": "Religious",
  "category.Alumni": "Alumni",
  "category.Cultural": "Cultural",
  "category.Parties": "Parties",

  "threads.title": "Chats",
  "threads.close": "Close history",
  "threads.new": "New chat",
  "threads.empty": "No chats yet. Start by asking something!",
  "threads.migrateBody": "You have {count} guest chats on this device. Save them to your account?",
  "threads.migrateAction": "Sync to account",
  "threads.save": "Save title",
  "threads.rename": "Rename {title}",
  "threads.delete": "Delete {title}",
  "threads.logout": "Log out",
  "threads.login": "Log in (optional)",

  "auth.signinTitle": "Log in to Hibalag AI",
  "auth.signupTitle": "Create an account",
  "auth.description":
    "This is optional — chat works fine as a guest. Log in only if you want your chats synced across devices.",
  "auth.google": "Continue with Google",
  "auth.or": "or use email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Log in",
  "auth.signup": "Sign up",
  "auth.toSignup": "No account yet? Sign up",
  "auth.toSignin": "Already have an account? Log in",
  "auth.confirm": "Check your email to confirm your account.",
  "auth.failed": "Something went wrong while logging in.",

  "install.title": "Install Hibalag AI",
  "install.body": "Add it to your home screen for faster access and offline schedule browsing.",
  "install.action": "Install",
  "install.later": "Not now",
  "install.dismiss": "Dismiss install prompt",
};

const tagalog: Record<TranslationKey, string> = {
  "header.menu": "Buksan ang menu at chat history",
  "header.schedule": "Buksan ang schedule canvas",
  "header.status.active": "Aktibo",
  "header.status.offline": "Offline mode",
  "header.status.synced": "Naka-sync",
  "header.language": "Pumili ng wika",

  "canvas.fab": "Tingnan ang Schedule Canvas",
  "canvas.sheetTitle": "Schedule Canvas",
  "canvas.sheetDescription": "I-browse at i-filter ang mga Founders Week na event.",

  "chat.offlineBanner":
    "Offline ka ngayon — mababasa mo pa rin ang schedule sa Canvas, babalik ang chat pagkakaroon ng signal.",
  "chat.welcomeTitle": "Kumusta, Sillimanian!",
  "chat.welcomeBody":
    "Ako si Hibalag AI...\nang gabay mo sa Founders Week at Hibalag Festival ngayong Agosto.\nMagtanong tungkol sa schedule, venues, o itinerary.",
  "chat.thinking": "Nag-iisip si Hibalag AI…",
  "chat.error": "May problema sa pagsagot. Subukan ulit maya-maya.",
  "chat.placeholder": "Magtanong tungkol sa Hibalag…",
  "chat.send": "Ipadala",
  "chat.aria": "Makipag-chat kay Hibalag AI",
  "chat.suggestion1": "Anong events ngayong araw?",
  "chat.suggestion2": "May open house ba?",
  "chat.suggestion3": "Kailan ang parada?",
  "chat.suggestion4": "Mga alumni homecoming activities?",
  "chat.suggestion5": "Kwentuhan mo ako tungkol sa Miss Silliman",

  "canvas.aria": "Canvas ng schedule ng festival",
  "canvas.title": "Schedule Canvas",
  "canvas.count": "{count} na event · Ago 1–29, 2026",
  "canvas.offlineCopy": "Offline na kopya",
  "canvas.close": "Isara ang canvas",
  "canvas.search": "Maghanap ng event, venue, o org…",
  "canvas.allDays": "Lahat ng araw",
  "canvas.dayChip": "Ago {day}",
  "canvas.retry": "Subukan ulit",
  "canvas.empty": "Walang event na tugma sa filter na ito. Subukan ang ibang araw o category.",
  "canvas.dateTba": "Petsa TBA",
  "canvas.footer": "Silliman University · Founders Day Celebration",
  "category.Featured": "Featured",
  "category.Religious": "Panrelihiyon",
  "category.Alumni": "Alumni",
  "category.Cultural": "Kultural",
  "category.Parties": "Parties",

  "threads.title": "Mga chat",
  "threads.close": "Isara ang history",
  "threads.new": "Bagong chat",
  "threads.empty": "Wala pang chat. Magsimula sa isang tanong!",
  "threads.migrateBody": "May {count} guest chat ka sa device na ito. I-save sa iyong account?",
  "threads.migrateAction": "I-sync sa account",
  "threads.save": "I-save ang pamagat",
  "threads.rename": "Palitan ang pangalan ng {title}",
  "threads.delete": "Burahin ang {title}",
  "threads.logout": "Mag-log out",
  "threads.login": "Mag-log in (opsyonal)",

  "auth.signinTitle": "Mag-log in sa Hibalag AI",
  "auth.signupTitle": "Gumawa ng account",
  "auth.description":
    "Opsyonal ito — gumagana ang chat kahit guest. Mag-log in lang kung gusto mong ma-sync ang chats mo sa lahat ng device.",
  "auth.google": "Magpatuloy gamit ang Google",
  "auth.or": "o gamitin ang email",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.signin": "Mag-log in",
  "auth.signup": "Mag-sign up",
  "auth.toSignup": "Wala pang account? Mag-sign up",
  "auth.toSignin": "May account na? Mag-log in",
  "auth.confirm": "Tingnan ang email mo para kumpirmahin ang account.",
  "auth.failed": "May problema sa pag-log in.",

  "install.title": "I-install ang Hibalag AI",
  "install.body":
    "Idagdag sa home screen mo para mas mabilis at mabasa ang schedule kahit walang signal.",
  "install.action": "I-install",
  "install.later": "Sa susunod na lang",
  "install.dismiss": "Isara ang install prompt",
};

export const translations: Record<Language, Record<TranslationKey, string>> = {
  bisaya,
  english,
  tagalog,
};

export function translate(
  language: Language,
  key: TranslationKey,
  vars?: Record<string, string | number>,
) {
  const template = translations[language][key];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return (LANGUAGES as readonly string[]).includes(value ?? "") ? (value as Language) : "bisaya";
}
