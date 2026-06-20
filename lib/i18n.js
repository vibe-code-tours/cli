// Bilingual CLI strings. EN is canonical; MY is curated; KAR (Karen S'gaw) is
// scaffolded with English fallbacks marked `TODO(kar)` until a native speaker
// reviews. Adding a new key:
//   1. add to STRINGS.en
//   2. add to STRINGS.my (mentor-reviewed)
//   3. add to STRINGS.kar (TODO English placeholder is OK; lang switch warns)

const STRINGS = {
  en: {
    'banner.tagline': 'A guided journey into AI-paired coding',
    'banner.menu': 'Commands',
    'banner.menu.doctor': 'check your environment',
    'banner.menu.setup': 'fork repos + scaffold your dev box',
    'banner.menu.apiSetup': 'wire Claude / opencode to the bootcamp proxy',
    'banner.menu.check': 'verify a chapter is ready (e.g. check ch-1)',
    'banner.menu.guide': 'read the bundled chapter guide',
    'banner.menu.verify': 'run the chapter checker script',
    'banner.menu.faq': 'search the bootcamp FAQ',
    'banner.menu.env': 'show detected AI provider + tooling',
    'banner.menu.guides': 'browse bundled docs (blog / cheatsheet / TLDR)',
    'banner.menu.submit': 'open a chapter PR (gh required)',
    'banner.menu.lang': 'switch CLI language',
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
    'lang.switched': 'Switched to {lang}.',
    'lang.scaffold': 'kar locale is a scaffold — most strings still English. Mentor review pending.',
    'check.missingArg': 'check requires a chapter id, e.g. `check ch-1`.',
    'check.notVendored': 'No bundled checker for {id} yet — falling back to doctor.sh {id}.',
    'guide.missingArg': 'guide requires a chapter id, e.g. `guide ch-1` or `guide 1`.',
    'guide.notFound': 'No bundled guide for {id}. Bundled chapters: {list}.',
    'guide.header': '── {id} — {lang} ──',
    'verify.missingArg': 'verify requires a chapter id, e.g. `verify ch-1`.',
    'guides.empty': 'No bundled guides found — this build may be incomplete.',
    'guides.heading': 'Bundled guides:',
    'guides.notFound': 'No guide named "{slug}". Run `vibe-code-tours guides ls`.',
    'faq.empty': 'FAQ index is empty — this build may be incomplete.',
    'faq.noHits': 'No FAQ hit for "{q}". Try fewer / simpler keywords.',
    'faq.prompt': 'Ask a question (blank to quit):',
    'faq.results': 'Top {n} match(es):',
    'env.heading': 'Environment snapshot:',
    'submit.noGh': 'gh CLI not found. Install it: https://cli.github.com/',
    'submit.notRepo': 'Not inside a git repo — run `vibe-code-tours submit` from your fork.',
    'submit.created': 'PR opened: {url}',
    'submit.failed': 'gh failed to open PR: {msg}',
    'placeholder.title': '{cmd} — Phase 3 scaffold',
    'placeholder.body': 'wiring lands in Phase 3. Track at https://vibecode.tours/cli',
    'apiSetup.providerPrompt': 'Which AI provider do you want to wire?',
    'apiSetup.provider.claude': 'Claude API direct (your own ANTHROPIC_API_KEY)',
    'apiSetup.provider.oauth': 'Anthropic OAuth (Claude Code subscription)',
    'apiSetup.provider.litellm': 'Bootcamp LiteLLM proxy (issued by mentors)',
    'apiSetup.provider.skip': 'Skip — I will set it up manually later',
    'apiSetup.dryRun': '[dry-run] would spawn api-setup.sh with provider={p}.',
    'setup.dryRun': '[dry-run] would spawn student-setup.sh with args: {args}',
    'banner.menu.whoami': 'show your saved config + tooling versions',
    'banner.menu.sponsor': 'open the Vibe Code Tours sponsors page',
    'banner.menu.reset': 'wipe ~/.vct/config.json (with confirmation)',
    'whoami.heading': 'Your Vibe Code Tours setup',
    'whoami.unconfigured': 'Not configured yet — run `vibe-code-tours setup` to get started.',
    'whoami.label.cohort': 'Cohort',
    'whoami.label.lang': 'Language',
    'whoami.label.github': 'GitHub handle',
    'whoami.label.provider': 'AI provider',
    'whoami.label.telemetry': 'Telemetry opt-in',
    'whoami.label.scripts': 'Scripts version',
    'whoami.label.cli': 'CLI version',
    'whoami.label.configPath': 'Config file',
    'whoami.value.unset': '(unset)',
    'whoami.value.yes': 'yes',
    'whoami.value.no': 'no',
    'sponsor.opening': 'Opening sponsors page …',
    'sponsor.fallback': 'Open in browser to see sponsor tiers + apply:',
    'reset.prompt': 'Wipe {path}? (y/N)',
    'reset.kept': 'Kept config — no changes made.',
    'reset.deleted': 'Deleted {path}.',
    'reset.missing': 'No config file at {path} — nothing to delete.',
    'reset.failed': 'Failed to delete {path}: {msg}',
    'sync.starting': 'Syncing scripts from upstream …',
    'sync.fresh': '{name}: {before} → {after}',
    'sync.unchanged': '{name}: unchanged',
    'sync.failed': 'sync failed: {msg}',
    'banner.menu.sync': 'force-refresh upstream scripts cache',
    'flag.offline': 'use embedded fallback scripts; skip network',
    'flag.refresh': 'clear scripts cache then refetch from upstream',
    'doctor.jsonNoBash': 'doctor --json needs bash to capture diagnostics.',
    'doctor.jsonFailed': 'doctor --json failed to parse output ({msg}); rerun without --json for raw diagnostics.',
    'telemetry.optedIn': 'Telemetry enabled — thanks! Disable anytime with `vibe-code-tours reset` or by editing ~/.vct/config.json.',
    'telemetry.optedOut': 'Telemetry disabled. We respect that.',
    'banner.menu.telemetry': 'opt in / out of anonymous usage stats',
  },
  my: {
    'banner.tagline': 'AI နှင့်တွဲဖက် coding လေ့လာရေး လမ်းညွှန်ခရီး',
    'banner.menu': 'အမိန့်များ',
    'banner.menu.doctor': 'သင့် environment စစ်ဆေးပါ',
    'banner.menu.setup': 'repo fork + dev box ပြင်ဆင်ခြင်း',
    'banner.menu.apiSetup': 'Claude / opencode ကို bootcamp proxy နှင့်ချိတ်ဆက်ပါ',
    'banner.menu.check': 'အခန်းတစ်ခု အသင့်ဖြစ်/မဖြစ် စစ်ပါ (ဥပမာ check ch-1)',
    'banner.menu.guide': 'အခန်း guide ဖတ်ပါ',
    'banner.menu.verify': 'အခန်း checker script ကိုလည်ပတ်ပါ',
    'banner.menu.faq': 'bootcamp FAQ ထဲ ရှာပါ',
    'banner.menu.env': 'AI provider နှင့် tool အခြေအနေ ပြပါ',
    'banner.menu.guides': 'ပါဝင်သော docs များ (blog / cheatsheet / TLDR) ကြည့်ပါ',
    'banner.menu.submit': 'chapter PR ဖွင့်ပါ (gh လိုသည်)',
    'banner.menu.lang': 'CLI ဘာသာစကား ပြောင်းပါ',
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
    'lang.switched': '{lang} သို့ပြောင်းပြီးပါပြီ။',
    'lang.scaffold': 'kar locale က scaffold သာဖြစ်သေး၍ စာများ အများစု အင်္ဂလိပ်ဖြင့်ပြသနေသည်။',
    'check.missingArg': 'check အတွက် chapter id လိုအပ်သည် (ဥပမာ `check ch-1`)။',
    'check.notVendored': '{id} အတွက် checker မပါသေး — doctor.sh {id} သို့ပြန်တိုက်မည်။',
    'guide.missingArg': 'guide အတွက် chapter id လိုသည် (ဥပမာ `guide ch-1` သို့မဟုတ် `guide 1`)။',
    'guide.notFound': '{id} အတွက် guide မပါပါ။ ပါသော chapter များ: {list}။',
    'guide.header': '── {id} — {lang} ──',
    'verify.missingArg': 'verify အတွက် chapter id လိုသည် (ဥပမာ `verify ch-1`)။',
    'guides.empty': 'guide ဘာမှ မရှိပါ — build မပြည့်စုံပါ။',
    'guides.heading': 'ပါဝင်သော guides:',
    'guides.notFound': '"{slug}" ဆိုသော guide မရှိပါ။ `vibe-code-tours guides ls` ဖြင့်စစ်ပါ။',
    'faq.empty': 'FAQ index ထဲ ဘာမှမရှိပါ။',
    'faq.noHits': '"{q}" အတွက် ရှာမတွေ့ပါ။ keywords ပိုနည်းနည်းသုံးကြည့်ပါ။',
    'faq.prompt': 'မေးခွန်းရိုက်ထည့်ပါ (blank ဖြင့်ထွက်):',
    'faq.results': 'အပေါ်ဆုံး {n} ခု:',
    'env.heading': 'Environment အခြေအနေ:',
    'submit.noGh': 'gh CLI မရှိပါ။ https://cli.github.com/ မှ install လုပ်ပါ။',
    'submit.notRepo': 'git repo ထဲမဟုတ်ပါ — သင့် fork ထဲက run ပါ။',
    'submit.created': 'PR ဖွင့်ပြီး: {url}',
    'submit.failed': 'gh PR ဖွင့်မရပါ: {msg}',
    'placeholder.title': '{cmd} — Phase 3 scaffold',
    'placeholder.body': 'Phase 3 မှာ ဆက်တိုက်လုပ်မည်။ https://vibecode.tours/cli',
    'apiSetup.providerPrompt': 'ဘယ် AI provider နဲ့ ချိတ်ချင်လဲ?',
    'apiSetup.provider.claude': 'Claude API direct (ကိုယ်ပိုင် ANTHROPIC_API_KEY)',
    'apiSetup.provider.oauth': 'Anthropic OAuth (Claude Code subscription)',
    'apiSetup.provider.litellm': 'Bootcamp LiteLLM proxy (mentor မှ ထုတ်ပေး)',
    'apiSetup.provider.skip': 'ဖျက်ထား — ကိုယ်တိုင် ပြန်လုပ်မယ်',
    'apiSetup.dryRun': '[dry-run] api-setup.sh ကို provider={p} ဖြင့်ခေါ်မည်။',
    'setup.dryRun': '[dry-run] student-setup.sh ကို args: {args} ဖြင့်ခေါ်မည်။',
    'banner.menu.whoami': 'သင်၏ သိမ်းထားသော config + tool အခြေအနေ ပြပါ',
    'banner.menu.sponsor': 'Vibe Code Tours sponsors စာမျက်နှာ ဖွင့်ပါ',
    'banner.menu.reset': '~/.vct/config.json ကို ဖျက်ပါ (အတည်ပြုပြီး)',
    'whoami.heading': 'သင်၏ Vibe Code Tours setup',
    'whoami.unconfigured': 'config မရှိသေး — စတင်ရန် `vibe-code-tours setup` ပြုလုပ်ပါ။',
    'whoami.label.cohort': 'Cohort',
    'whoami.label.lang': 'ဘာသာစကား',
    'whoami.label.github': 'GitHub အသုံးပြုသူ',
    'whoami.label.provider': 'AI provider',
    'whoami.label.telemetry': 'Telemetry လက်ခံ',
    'whoami.label.scripts': 'Scripts ဗားရှင်း',
    'whoami.label.cli': 'CLI ဗားရှင်း',
    'whoami.label.configPath': 'Config ဖိုင်',
    'whoami.value.unset': '(သတ်မှတ်မထား)',
    'whoami.value.yes': 'ဟုတ်',
    'whoami.value.no': 'မဟုတ်',
    'sponsor.opening': 'sponsors စာမျက်နှာ ဖွင့်နေသည် …',
    'sponsor.fallback': 'sponsor tiers ကြည့်ပြီး apply လုပ်ရန် browser တွင် ဖွင့်ပါ:',
    'reset.prompt': '{path} ကို ဖျက်မလား? (y/N)',
    'reset.kept': 'config ကို ဆက်ထားသည် — ပြောင်းမသွားပါ။',
    'reset.deleted': '{path} ကို ဖျက်ပြီးပါပြီ။',
    'reset.missing': '{path} တွင် config မရှိ — ဖျက်စရာ မရှိပါ။',
    'reset.failed': '{path} ဖျက်မရပါ: {msg}',
    'sync.starting': 'အပေါ်က script များကို ဆွဲချနေသည် …',
    'sync.fresh': '{name}: {before} → {after}',
    'sync.unchanged': '{name}: မပြောင်းပါ',
    'sync.failed': 'sync မအောင်မြင်ပါ: {msg}',
    'banner.menu.sync': 'upstream scripts cache ကို အတင်းအဓမ္မ refresh',
    'flag.offline': 'network ကိုဖျက်ပြီး embedded scripts သုံးပါ',
    'flag.refresh': 'cache ဖျက်ပြီး upstream မှ ပြန်ဆွဲပါ',
    'doctor.jsonNoBash': 'doctor --json အတွက် bash လိုသည်။',
    'doctor.jsonFailed': 'doctor --json output ဖြတ်တောက်မရ ({msg}); --json မပါပဲ ပြန်ပြေးကြည့်ပါ။',
    'telemetry.optedIn': 'Telemetry ဖွင့်ပြီ — ကျေးဇူး! `vibe-code-tours reset` သို့မဟုတ် ~/.vct/config.json ပြင်ပြီး ပိတ်နိုင်သည်။',
    'telemetry.optedOut': 'Telemetry မပို့ပါ။',
    'banner.menu.telemetry': 'အသုံးပြုမှု anonymous stats — opt in/out',
  },
  kar: {
    // TODO(kar): scaffold — mentor-reviewed translations pending. Falls back to en.
    'banner.tagline': 'AI ဒီးတၢ်ဂုာ်ကျဲးစၢးကွဲးလၢကီၢ်တၢ်ဖံးတၢ်မၤ', // TODO(kar)
    'banner.menu': 'တၢ်မၤလိ', // TODO(kar)
    'lang.switched': 'ဆီတလဲဆူ {lang} လံ.', // TODO(kar)
    'lang.scaffold': 'kar locale အလီၢ်အကျဲဒံးဘၣ်တၢ်ဆဲးဒိၣ်ထီၣ်ဒၣ်အဂံၢ်.', // TODO(kar)
    'cohort.unset': 'တၢ်ဃုထၢ cohort တအိၣ်ဒံးဘၣ်.', // TODO(kar)
    'cohort.set': 'Cohort: {n}',
    // The vast majority of keys fall back to en via t().
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

export function hasNative(key, lang = current) {
  const table = STRINGS[lang];
  if (!table) return false;
  return Object.prototype.hasOwnProperty.call(table, key);
}

export function getLang() {
  return current;
}

export function listLangs() {
  return [...SUPPORTED];
}

export const __test__ = { STRINGS };
