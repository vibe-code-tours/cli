// Minimal bilingual strings for the CLI surface. Site i18n bundles are huge
// (60KB+) and product-marketing focused; CLI keeps its own narrow set.
// Future: pull from site bundle at build time once keys stabilize.

const STRINGS = {
  en: {
    'banner.tagline': 'A guided journey into AI-paired coding',
    'banner.menu': 'Commands',
    'banner.menu.doctor': 'check your environment',
    'banner.menu.setup': 'fork repos + scaffold your dev box',
    'banner.menu.apiSetup': 'wire Claude / opencode to the bootcamp proxy',
    'banner.menu.check': 'verify a chapter is ready (e.g. check ch-1)',
    'banner.menu.cohortFree': 'request a free seat in cohort N',
    'cohort.unset': 'No cohort selected yet — run with --cohort N to pick one.',
    'cohort.set': 'Cohort: {n}',
    'free.opening': 'Opening apply page for cohort {n} …',
    'free.fallback': 'Open this URL to apply for cohort {n}:',
    'windows.noBash': 'This CLI needs bash. On native Windows, install WSL (Ubuntu) and re-run from inside it.',
    'script.missing': 'Could not find script {name}. Try re-running with VCT_FORCE_EXTRACT=1.',
    'help.title': 'vibe-code-tours — student CLI',
    'help.usage': 'Usage: vibe-code-tours [command] [flags]',
    'help.commands': 'Commands',
    'help.flags': 'Flags',
    'help.examples': 'Examples',
    'lang.unsupported': 'Unsupported lang {lang}. Falling back to en.',
    'check.missingArg': 'check requires a chapter id, e.g. `check ch-1`.',
  },
  my: {
    'banner.tagline': 'AI နှင့်တွဲဖက် coding လေ့လာရေး လမ်းညွှန်ခရီး',
    'banner.menu': 'အမိန့်များ',
    'banner.menu.doctor': 'သင့် environment စစ်ဆေးပါ',
    'banner.menu.setup': 'repo fork + dev box ပြင်ဆင်ခြင်း',
    'banner.menu.apiSetup': 'Claude / opencode ကို bootcamp proxy နှင့်ချိတ်ဆက်ပါ',
    'banner.menu.check': 'အခန်းတစ်ခု အသင့်ဖြစ်/မဖြစ် စစ်ပါ (ဥပမာ check ch-1)',
    'banner.menu.cohortFree': 'cohort N အတွက် အခမဲ့ နေရာတောင်းပါ',
    'cohort.unset': 'cohort မရွေးရသေးပါ — --cohort N ဖြင့်ပြန်ဆွဲပါ။',
    'cohort.set': 'Cohort: {n}',
    'free.opening': 'cohort {n} apply စာမျက်နှာကို ဖွင့်နေသည် …',
    'free.fallback': 'cohort {n} အတွက် ဤ URL ကိုဖွင့်ပါ:',
    'windows.noBash': 'CLI က bash လိုအပ်သည်။ native Windows တွင် WSL (Ubuntu) install လုပ်ပြီး အထဲမှ ပြန်ပြေးပါ။',
    'script.missing': 'script {name} ကို မတွေ့ပါ။ VCT_FORCE_EXTRACT=1 ဖြင့်ပြန်ပြေးကြည့်ပါ။',
    'help.title': 'vibe-code-tours — ကျောင်းသား CLI',
    'help.usage': 'အသုံးပြုနည်း: vibe-code-tours [command] [flags]',
    'help.commands': 'အမိန့်များ',
    'help.flags': 'အလံများ',
    'help.examples': 'ဥပမာများ',
    'lang.unsupported': 'lang {lang} ကို မထောက်ပံ့ပါ။ en သို့ပြန်ပြောင်းမည်။',
    'check.missingArg': 'check အတွက် chapter id လိုအပ်သည် (ဥပမာ `check ch-1`)။',
  },
};

const SUPPORTED = Object.keys(STRINGS);
let current = 'en';

export function setLang(lang) {
  if (!lang) return current;
  if (!SUPPORTED.includes(lang)) {
    const msg = STRINGS.en['lang.unsupported'].replace('{lang}', lang);
    process.stderr.write(`${msg}\n`);
    current = 'en';
    return current;
  }
  current = lang;
  return current;
}

export function t(key, vars = {}) {
  const table = STRINGS[current] ?? STRINGS.en;
  const tmpl = table[key] ?? STRINGS.en[key] ?? key;
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
    tmpl,
  );
}

export function getLang() {
  return current;
}

export function listLangs() {
  return [...SUPPORTED];
}
