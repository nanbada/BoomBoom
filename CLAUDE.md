# BoomBoom English — project instructions

<!-- Maintainer notes (stripped from Claude's context):
- Keep this file under ~120 lines. Facts live in 00_Plan/; progress lives in aidd_docs/worklog.md.
- Shared working rules (authority, git, secrets, language, worklog) come from ~/.claude/CLAUDE.md; do not repeat them here.
- When 03_Pipeline/ exists, add its build/test/render commands under "Pipeline" and consider moving that section to .claude/rules/pipeline.md with `paths: ["03_Pipeline/**"]`.
-->

BoomBoom English is a pre-launch YouTube channel of English-only 2D cartoons (characters: Toby & Momo). Meaning is carried by visuals, never by translation. One owner produces everything; Claude helps with planning, scripts, docs and the production pipeline.

## Sources of truth

- `00_Plan/02_Season1_Launch_Plan.md` is canonical. Before scripting, read §§2–3, 6, 10. Before pipeline or asset work, read §§4–8, 11, 14. Read other sections as relevant. If a request conflicts with the plan, say so and propose a plan update instead of silently diverging.
- `00_Plan/01_Research_Review.md` holds the keep/fix/archive verdicts on the legacy Gemini research.
- `00_Plan/03_Voice_Decision.md` holds voice engine, casting and voice-asset rules. Read it before voice or audio pipeline work.
- Legacy material (`00_Research_and_Strategy/` … `05_Episodes/`, `README.md`, `README_KR.md`) is reference-only; the plan overrides it. Do not edit originals: Phase 0 archives them to `99_Archive/gemini_v0/`. Write revised deliverables into the target layout below.
- Gemini's YouTube statistics are owner-accepted planning assumptions, not operating targets; operating baselines come from the channel's first eight weeks (plan §13). When quoting a number outside the repo, attach its original source and date if known, otherwise attribute it to the Gemini research.
- The `00_Plan/` docs are mirrored in the claude.ai Project "BoomBoom English". After changing them, tell the owner the mirror needs updating.

Target layout (plan §14):

```
00_Plan/  01_Bible/  02_Assets/  03_Pipeline/  04_Episodes/EPxx_<slug>/  05_Ops/  99_Archive/gemini_v0/
```

## Owner decisions (fixed unless the owner changes them)

- Season 1 audience: ages 5–7, CEFR Pre-A1, one track. The 8–10 mystery track is deferred to Season 2.
- Weekly output: 1 new episode (3:00–3:30) + 2 Shorts (30–45 s, each self-contained). A 15–25 min compilation every 4–6 episodes.
- Season 1 cast: Toby, Momo, Barnaby only. Sets: treehouse HQ and town square.
- Budget: free/open-source first. Approved paid services (approved 2026-10-22, plan v2.4): Gemini API (TTS, paid tier only) and Fish Audio API (Drama 3) pay-as-you-go for voices; ElevenLabs Starter is the fallback, paid only if both fail. Ask before adding any other paid tool, upgrading a plan, or anything else that incurs API charges.
- Voices: Toby, Momo and Barnaby, designed in the owner's account (Gemini Voice Design / Fish voice models; ElevenLabs as fallback) and never shared publicly. Child timbre vs. young-sounding adult timbre and the main engine (Gemini vs. Fish) are open until the Phase 1 pilot (plan §8, `00_Plan/03_Voice_Decision.md`); make no API call to an engine (Voice Design, TTS, model upload) until that doc's pre-use terms checks for it are done (Gemini age clause; Fish commercial and training-use terms). Never record, clone or imitate a real child's voice. No speech-to-speech.
- Made for Kids: set the channel and every upload to Made for Kids, and review uploads privately before release.
- The channel About text does not mention AI. Set each upload's "AI use" flag by YouTube's rules: not required for non-realistic animation; required for realistic synthetic scenes or videos centred on AI-generated music. Keep correct automatic AI labels, and raise the About decision with the owner again if automatic labeling starts (plan §§6, 8).
- The channel is run personally, not by the academy (Remotion's free license applies).

## Content rules (episodes, Shorts, titles, thumbnails)

- When an episode uses the Word-Pop Watch, it responds only to imperatives and does exactly what was said, so the resolution visibly matches the command. In non-Watch episodes, show the target expression's meaning through character actions and visuals. Plan §10 says which episodes use the Watch.
- Use plan §10's main target, support and review expressions (`—` means none; do not invent one). Keep other sentences to 2–5 words; listed one-word utterances stay as they are. Check vocabulary against the Cambridge Pre A1 Starters list; use off-list words only when the picture makes the meaning unambiguous.
- The banana-pie gag punishes choosing a word with the wrong meaning, never pronunciation or accent.
- Viewer participation offers say / whisper / point. Never demand shouting, and never imply the video can hear the child (no microphone icon, no reactive volume meter).
- Episodes end with the problem solved. The next-episode teaser previews the topic in a few seconds; never use threats, rescue pleas, or "click the next video" (Made for Kids videos have no cards or end screens).
- Before scripting, write `episode_card.md` (learning goal, conflict, resolution, visual explanation) and check it against earlier episodes. Swapping words into a reused story template is not allowed (YouTube inauthentic-content policy).
- Titles and thumbnails must match what the episode actually teaches; no keyword stuffing.
- Safety: nothing a child could dangerously imitate; tension stays at curiosity level; no flashing faster than 3 per second, harsh screen shake, or sudden loud sounds.
- Audio: let impact SFX decay before a target word, duck BGM under dialogue, master to -14 LUFS / -1 dBTP.
- Character and world designs are original. Never prompt with "like <existing show or character>".

## Pipeline (03_Pipeline/, not built yet)

- Stack (plan §5): Remotion (React + TypeScript), Gemini or Fish TTS generated per dialogue turn, a local free forced aligner for word timings (chosen in Phase 1), Rhubarb Lip Sync (start with the 6 basic mouth shapes), ffmpeg loudnorm. Characters are hand-authored layered SVG.
- Chant accompaniment defaults to a coded 120 BPM pattern rendered with FluidSynth; record each soundfont's license and attribution terms. Any other music source (e.g. Suno, Eleven Music) needs a plan update, verified commercial-use rights for the exact plan, and approval for new charges.
- Each episode's input is `04_Episodes/EPxx_<slug>/script.yaml`. Validate it against a schema, parse it safely, and never pass its strings into shell commands or `eval`.
- Render 16:9 and 9:16 from the same scene data with separate camera and caption layouts; do not center-crop.
- The pipeline makes no LLM API calls; scripts are drafted in chat.
- Image generation (plan §5 '이미지 생성'): Claude owns the story — direction, storyboard (`storyboard.md`), script and every image prompt. GPT only draws: run codex CLI's built-in image tool (`$imagegen`) on the ChatGPT login, passing Claude's prompt verbatim (check the codex session log), never the API-key script path. Antigravity CLI `agy` is a fallback for technical or quality failure only, after its pre-use checks pass; never route a policy refusal to another tool, and never use `--dangerously-skip-permissions`. Before any voice placement or Remotion work on an episode, generate every asset on the storyboard's asset list: each background per camera angle, each prop separately (and per state); reuse existing assets. Final characters stay hand-drawn SVG; no text inside images; no photoreal images; prompts start from `01_Bible/image_style.md`. Raw PNGs go to `02_Assets/_raw/<assetID>_v<n>_<tool>.png` (gitignored, backed up); log every image in `05_Ops/assets_log.csv`.
- Keep API keys only in `.env` (gitignored) and set usage caps.
- Keep raw voice audio, rendered videos and large binaries out of Git; back up scripts, vector/audio sources and final renders in two locations (plan §7).
- Record every generated or third-party asset in `05_Ops/assets_log.csv` (file, tool, plan, model, date, license, human edits) and every voice ID/prompt in `05_Ops/voices.md`. Verify commercial-use rights for the exact service, plan and generation date; ElevenLabs Free-plan and Beta outputs are not commercially usable.
- Check current official docs before choosing a library version or relying on an API detail.

## Children and student data

- Classroom viewing tests are offline, with guardian notice and consent, and record aggregate counts only. Never store or upload student names, faces, voices or verbatim answers, including to AI services or in videos.
- Do not build anything that collects data from children online without a separate COPPA / Korean PIPA review first.

## Workflow

- Get a Codex cross-review before asking the owner to approve a substantial plan change (`/codex:adversarial-review`) and before reporting pipeline code as done (`/codex:review`). In Cowork sessions the equivalents are the `codex-review:plan` and `codex-review:code` skills. If a review cannot run, report it as pending.
- Korean documents: prefer prose unless structure helps; no closing recap; avoid filler phrases (주목할 점은, 중요한 것은, 결론적으로, 요약하자면, 정리하면, 다시 말해) and unsupported intensifiers (매우, 상당히, 효과적으로, 혁신적인, 강력한).
