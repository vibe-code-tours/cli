# Vibe Code Tours — Support FAQ (draft v1)

> Auto-distilled from 2028 real Discord messages (#setup-help, #ch-*, #general), 2026-06-14.
> **DRAFT — mentor review required before bot use.** Commands taken from real threads; verify each.
> Bilingual EN + မြန်မာ. 6 curated entries (drifted/dup drafts removed).

## Index
1. `doctor.sh` image report not generated in WSL
2. Node.js Version Mismatch in doctor.sh (Mac)
3. GitHub CLI `gh auth login` Web Authentication Failure
4. Claude API Key Conflict Warning
5. Merged PR Not Appearing on Website
6. Submitting Chapter Assignments

---


### `doctor.sh` image report not generated in WSL
**Problem (EN):** `doctor.sh` does not generate image reports (PNG/SVG) when run in WSL.
**ပြဿနာ (MM):** `doctor.sh` ကို WSL မှာ run ရင် ပုံ report (PNG/SVG) တွေ ထုတ်မပေးဘူး။
**Fix:**
```
sudo apt update && sudo apt install -y librsvg2-bin imagemagick
bash doctor.sh
```
**Note (EN):** Install the image conversion libraries (`librsvg2-bin` and `imagemagick`) first, then re-run `doctor.sh` to generate image reports.
**မှတ်ချက် (MM):** ပုံ report တွေ မှန်မှန်ကန်ကန် ထွက်ဖို့ `doctor.sh` မ run ခင် `librsvg2-bin` နဲ့ `imagemagick` lib တွေကို အရင် install လုပ်ပြီးမှ ပြန် run ပါ။

---

### Node.js Version Mismatch in doctor.sh (Mac)
**Problem (EN):** Running `doctor.sh` shows a cross sign for Node.js on macOS, often due to an incorrect Node.js version.
**ပြဿနာ (MM):** `doctor.sh` script ကို run တဲ့အခါ Mac မှာ Node.js အတွက် cross sign ပြနေပါတယ်၊ ဒါက Node.js version မမှန်လို့ ဖြစ်တတ်ပါတယ်။
**Fix:**
```
nvm install 22
nvm use 22
```
**Note (EN):** The `doctor.sh` script requires a specific Node.js LTS version (e.g., 22.x). Ensure your active Node.js version matches the one specified in the script or documentation.
**မှတ်ချက် (MM):** `doctor.sh` script က သတ်မှတ်ထားတဲ့ Node.js LTS version (ဥပမာ 22.x) ကို လိုအပ်ပါတယ်။ script သို့မဟုတ် documentation မှာ ဖော်ပြထားတဲ့ version နဲ့ ကိုက်ညီမှုရှိမရှိ စစ်ဆေးပါ။

---

### GitHub CLI `gh auth login` Web Authentication Failure
**Problem (EN):** `gh auth login` fails with "failed to authenticate via web browser, read: connection reset by peer" even after GitHub website shows successful authentication.
**ပြဿနာ (MM):** `gh auth login` ဝင်တဲ့အခါ web browser နဲ့ auth လုပ်ပြီးပေမယ့် "connection reset by peer" ဆိုတဲ့ error တက်နေတာမျိုးပါ။ Github Website မှာတော့ "Congratulations, you're all set!" လို့ ပြနေပါတယ်။
**Fix:**
```
doctor.sh update
```
**Note (EN):** This often indicates a network issue (VPN, proxy, firewall) or an outdated `gh` CLI. Ensure `ssh -T git@github.com` works.
**မှတ်ချက် (MM):** ဒါက network ပြဿနာ (VPN, proxy, firewall) ဒါမှမဟုတ် `gh` CLI က အဟောင်းဖြစ်နေတာကြောင့် ဖြစ်နိုင်ပါတယ်။ `ssh -T git@github.com` အလုပ်လုပ်လားဆိုတာ သပ်သပ်စစ်ကြည့်နော်။

---

### Claude API Key Conflict Warning
**Problem (EN):** I'm getting warnings or connection issues with Claude because I might have configured both `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` in my shell profile.
**ပြဿနာ (MM):** Claude မှာ warning တွေ ဒါမှမဟုတ် ချိတ်ဆက်မှုပြဿနာတွေ တက်နေတာက `ANTHROPIC_API_KEY` နဲ့ `ANTHROPIC_AUTH_TOKEN` နှစ်ခုလုံးကို ကိုယ့် shell profile ထဲမှာ ထည့်ထားမိလို့ ဖြစ်နိုင်ပါတယ်နော်။
**Fix:**
```
# For Bash users:
nano ~/.bashrc
# Find and remove the line setting ANTHROPIC_AUTH_TOKEN. Save and exit.
source ~/.bashrc

# For Zsh users:
nano ~/.zshrc
# Find and remove the line setting ANTHROPIC_AUTH_TOKEN. Save and exit.
source ~/.zshrc
```
**Note (EN):** This specific issue occurs when both `ANTHROPIC_API_KEY` and `ANTHROPIC_AUTH_TOKEN` are defined, causing a conflict.
**မှတ်ချက် (MM):** ဒီပြဿနာလေးက `ANTHROPIC_API_KEY` နဲ့ `ANTHROPIC_AUTH_TOKEN` နှစ်ခုလုံးကို တစ်ပြိုင်တည်း သတ်မှတ်ထားမိရင် ဖြစ်တတ်တဲ့ conflict လေးပါ။

---

### Merged PR Not Appearing on Website
**Problem (EN):** My Pull Request (PR) was merged, but my changes are not appearing on the website.
**ပြဿနာ (MM):** ကျွန်တော့် Pull Request (PR) က merge ဖြစ်သွားပြီ၊ ဒါပေမဲ့ website မှာ ကျွန်တော့် ပြောင်းလဲမှုတွေ ပေါ်မလာသေးပါဘူး။
**Fix:**
```bash
# Add the upstream remote (run this only once per repository)
git remote add upstream https://github.com/vibe-code-tours/vibe-code-tours.github.io.git

# Sync your local main branch with the upstream main
git fetch upstream
git checkout main
git merge upstream/main

# Push the synced changes to your fork on GitHub
git push origin main
```
**Note (EN):** After a PR is merged into the main project, your personal fork does not automatically update. You need to manually sync your fork with the upstream repository.
**မှတ်ချက် (MM):** PR ကို main project ထဲသို့ merge လုပ်ပြီးနောက်၊ သင်၏ကိုယ်ပိုင် fork သည် အလိုအလျောက် update ဖြစ်မည်မဟုတ်ပါ။ သင်၏ fork ကို upstream repository နှင့် ကိုယ်တိုင် sync လုပ်ရန်လိုအပ်ပါသည်။

---

### Submitting Chapter Assignments
**Problem (EN):** Students need to submit their completed chapter assignments, which are expected as GitHub Gists, to the bot for evaluation.
**ပြဿနာ (MM):** သင်ခန်းစာအတွက် ပြီးစီးသွားတဲ့အလုပ်တွေကို (GitHub Gist အနေနဲ့) bot ကို submit လုပ်ပြီး စစ်ဆေးဖို့ လိုအပ်ပါတယ်။
**Fix:**
```
/submit ch-1 https://gist.github.com/myoaung/bc63e214fc7eec4cc2c9bba3871e8d2d
```
**Note (EN):** Always submit a valid GitHub Gist URL. Do not try to submit local file paths or raw image data. If you get an error that your GitHub account is already linked to another student, contact a mentor.
**မှတ်ချက် (MM):** မှန်ကန်တဲ့ GitHub Gist URL ကိုသာ submit လုပ်ပါ။ ကိုယ့်စက်ထဲက ဖိုင်လမ်းကြောင်းတွေ (ဥပမာ ပုံဖိုင်တွေ) ဒါမှမဟုတ် ပုံအချက်အလက်တွေကို တိုက်ရိုက် submit မလုပ်ပါနဲ့။ သင့် GitHub account က တခြားကျောင်းသားနဲ့ ချိတ်ဆက်ပြီးသားဖြစ်နေတယ်ဆိုတဲ့ error တက်လာရင် mentor ကိုဆက်သွယ်ပါ။

---

### Set up Claude Code + API key (Myanmar)
**Problem (EN):** How do I install Claude Code and configure my cohort key? (claude.ai is blocked in Myanmar)
**ပြဿနာ (MM):** Claude Code ကို install လုပ်ပြီး cohort key ဘယ်လို config လုပ်ရမလဲ။ (Myanmar မှာ claude.ai ပိတ်ထားတယ်)
**Fix:**
```
# 1. Install everything (nvm+Node22, uv+Python, git, gh, Claude Code, opencode).
#    Claude Code installs via npm when claude.ai is blocked — no geo-restriction.
curl -fsSL https://raw.githubusercontent.com/vibe-code-tours/vibecode-setup/main/student-setup.sh | bash

# 2. Get your key: run /mykey in the Discord/Telegram class channel (bot DMs VIBE_KEY + VIBE_PROXY).

# 3. Point Claude Code at the cohort proxy with your key:
curl -fsSLO https://raw.githubusercontent.com/vibe-code-tours/vibecode-setup/main/api-setup.sh
VIBE_KEY=sk-... VIBE_PROXY=https://<proxy> bash api-setup.sh

# 4. Verify
claude --version
```
**Note (EN):** Do NOT use `curl claude.ai/install.sh` alone in Myanmar — it's blocked. If npm is missing, student-setup.sh installs Node first. WSL with native-Windows claude: the script configures that, no second copy. Never paste your key in a public channel.
**မှတ်ချက် (MM):** Myanmar မှာ `curl claude.ai/install.sh` တစ်ခုတည်း မသုံးပါနဲ့ — ပိတ်ထားတယ်။ npm မရှိရင် student-setup.sh က Node အရင် install ပေးတယ်။ key ကို public channel မှာ ဘယ်တော့မှ မ paste ပါနဲ့။

---

### Show your Claude Certifications / cert badge on your builder card
**Problem (EN):** I earned Claude 101 / Claude Code 101 — how do I show the badge on vibecode.tours?
**ပြဿနာ (MM):** Claude 101 / Claude Code 101 ရပြီ — vibecode.tours card မှာ badge ဘယ်လို ပြရမလဲ။
**Fix:**
```
# In your profile: src/content/builders/<you>.md — add a certs: block
certs:
  claude_101: https://verify.skilljar.com/c/XXXXXXXX
  claude_code_101: https://verify.skilljar.com/c/YYYYYYYY
# Commit + PR. Badges show as amber, linked to your proof.
```
**Note (EN):** ⚠️ The keys MUST go UNDER `certs:` — at the top level they won't show. Full verify URL recommended (optional). Guide w/ pictures: https://github.com/vibe-code-tours/vibecode-setup/blob/main/CERTS.md
**မှတ်ချက် (MM):** ⚠️ key တွေက `certs:` **အောက်မှာ** ထားရမယ် — top level မှာ မပေါ်ဘူး။ verify URL အပြည့် သုံးတာ ကောင်း (optional)။ လမ်းညွှန်: https://github.com/vibe-code-tours/vibecode-setup/blob/main/CERTS.md
