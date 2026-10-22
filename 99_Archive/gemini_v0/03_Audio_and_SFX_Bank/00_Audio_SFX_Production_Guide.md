# 00: Audio & SFX Production Guide

## 1. ElevenLabs Voice Clone Models & Prosody Presets
To maintain voice consistency across high-speed weekly production sprints, all dialogue is generated using consistent ElevenLabs voice IDs or converted via Speech-to-Speech (STS).

### Voice Model Profiles
* **Toby (Hero Detective):**
  * *Persona:* Warm, friendly, enthusiastic 8-year-old native English boy. Clear articulation with gentle patient cadence.
  * *ElevenLabs Settings:* Stability: 65% | Similarity: 85% | Style Exaggeration: 25% | Speaker Boost: ON.
  * *Prosody Rule:* Pitch variation across 10–12 semitones; deliberate 0.5s pause before target vocabulary.
* **Momo (Comic Sidekick):**
  * *Persona:* Bouncy, expressive, mischievous 6-year-old kitten. High-pitched, playful, elastic voice.
  * *ElevenLabs Settings:* Stability: 45% | Similarity: 80% | Style Exaggeration: 55% | Speaker Boost: ON.
  * *Prosody Rule:* Sudden pitch spikes (+14 semitones), elongated vowels (*"Pleeeease!"*), funny giggles and gasps.
* **Coco (Action Bunny):**
  * *Persona:* Rhythmic, energetic, sporty girl voice. Leads chants with punchy syncopated accents.
* **Foxy Lex (Trickster Fox):**
  * *Persona:* Theatrical, sly, snickering rascal with slight British theatrical flair.
* **Narrator (The Guide):**
  * *Persona:* Ultra-clear, gentle storytelling voice for phonetic recaps and 4th-wall prompts.

---

## 2. 120 BPM Earworm Chant Stem Architecture (`02_120BPM_Chant_Stems/`)
Every episode features a 25-second musical micro-chant structured at exactly **120 BPM** (2.0 seconds per measure, 4/4 time signature).

```
[Chant Master Arrangement] (25 Seconds / 120 BPM / Key: C Major or G Major)
├── Stem 01: Lead_Vocal_Chant (Toby, Momo & Kids Chorus call-and-response)
├── Stem 02: Marimba_Melody (High attack, crisp note separation, 2–4 kHz)
├── Stem 03: Pizzicato_Strings_Stabs (Rhythmic pulse on beats 2 & 4)
├── Stem 04: Ukulele_Acoustic_Strum (Mid-range warmth, scooped at 3 kHz)
├── Stem 05: Woodblock_&_Cowbell_Percussion (Clean rhythmic anchor)
└── Stem 06: Upright_Bass_Bounce (Warm low-end foundation, high-pass at 40 Hz)
```

---

## 3. The 30 Master Cartoon SFX Catalog (`03_Master_Cartoon_SFX_30/`)
Organized by comedic category to enforce our **0.3s Clean Vocal Window**:

1. **Anticipation & Eye Cues (01–05):**
   * `01_Slide_Whistle_Up.wav` (Curiosity / Looking up)
   * `02_Blink_Plink.wav` (Sudden confusion)
   * `03_Tiptoe_Sneak_Xylophone.wav` (Sneaking or approaching)
   * `04_Rumble_Building_Low.wav` (Impending disaster)
   * `05_Cartoon_Zip_Dash.wav` (Sudden high-speed launch)
2. **Impacts & Slapstick (06–12):**
   * `06_Boing_Spring_Loud.wav` (Bouncing back)
   * `07_Pie_Splat_Wet.wav` (Banana cream pie / slime face hit)
   * `08_Hollow_Wood_Bonk.wav` (Gentle comedic head bump)
   * `09_Crash_Dishes_Light.wav` (Falling into clutter)
   * `10_Rubber_Stretch_Release.wav` (Elastic snap)
   * `11_Slip_Banana_Whistle.wav` (Foot slipping)
   * `12_Pop_Bubble_Large.wav` (Object appearing / disappearing)
3. **Gadgets & Magic (13–18):**
   * `13_Watch_Beep_Prompt.wav` (Word-Pop Watch activation prompt)
   * `14_Watch_Charge_Glissando.wav` (Charging up on correct English word)
   * `15_Magic_Beam_Fire.wav` (Shooting restoration ray)
   * `16_Misfire_Buzzer_Sad.wav` (Wrong word / comedic misfire)
   * `17_Steam_Hiss_Overheat.wav` (Watch overheating)
   * `18_Chime_Correct_Star.wav` (Success sparkle)
4. **Emotional Reactions (19–24):**
   * `19_Kids_Giggle_Group.wav`
   * `20_Kids_Gasp_Ooh.wav`
   * `21_Kids_Cheer_Hooray.wav`
   * `22_Cat_Purr_Happy.wav`
   * `23_Dog_Pant_TailWag.wav`
   * `24_Comedic_Drama_Trumpet_WahWah.wav`
5. **Interactive UI & Timers (25–30):**
   * `25_Quiz_Clock_Tick_3s.wav` (Ticking countdown clock)
   * `26_Word_Pop_Text_Swoosh.wav` (Karaoke subtitle sliding into frame)
   * `27_Stinger_BoomBoom_Taiko.wav` (Channel sonic branding stinger)
   * `28_Heartbeat_Fast.wav` (Comedic tension)
   * `29_Squeak_Toy_Small.wav` (Touching button / nose poke)
   * `30_Sparkle_Success_End.wav` (Episode resolution glockenspiel)

---

## 4. Broadcast Mixing & Export Checklist
- [ ] Ensure **0.3s Clean Vocal Window** between any impact SFX and the start of dialogue.
- [ ] Set BGM ducking threshold: BGM drops by **-10 dB to -12 dB** whenever vocal speech occurs.
- [ ] Apply +2.5 dB broad EQ bell at **3.2 kHz** on vocal tracks to enhance non-native consonant perception.
- [ ] Verify Master output measures strictly **-14 LUFS ($\pm 0.5$)** and **True Peak does not exceed -1.0 dBTP**.
