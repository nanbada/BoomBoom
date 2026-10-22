# EP01: Don't Touch the Red Button! — Voice Acting, SFX & VFX Master Directives

* **Episode Code:** BBE-S01-EP01
* **Companion Script:** `EP01_Second_by_Second_Master_Script.md`
* **Target Audio Specification:** Integrated -14 LUFS ($\pm 0.5$), True Peak -1.0 dBTP, Dialogue Center-Panned (-12 to -9 dBFS)
* **Video Format:** 16:9 Canvas (1920x1080) with strict Center 9:16 Action Safe Guard (1080x1920)

---

## Part 1: Voice Acting & Dialogue Performance Directives

### 1. Toby (Lead Hero Detective — Golden Retriever)
* **Vocal Archetype:** Warm, reassuring 8-year-old native English boy detective (General American / Mild RP). Clear, crisp diction without being pedantic. Patient older brother persona.
* **Prosody & Intonation Rules:**
  * **Pitch Modulation:** Modulate across 10–12 semitones. Upward lilt on interrogatives (*"Momo?"*), downward resolute landing on imperatives (*"Don't touch it!"*).
  * **The 0.5-Second Acoustic Frame:** Toby **must** observe a mandatory 0.5-second micro-pause before every target vocabulary word to anchor the listener's focus:
    * `"Momo, NO! ... [0.5s pause] ... DON'T TOUCH IT!"` (00:08)
    * `"The blue button is SMALL. The red button is BIG! ... [0.5s pause] ... Don't touch the BIG RED button!"` (00:35)
  * **Vowel Elongation:** Stressed syllables prolonged by +30% (*"reeeeed"*, *"biiiiiig"*).
  * **Climax Call-and-Response Delivery (02:50 – 03:20):**
    * Call 1: Encouraging, medium intensity (`-12 dBFS`).
    * Call 2: Louder, pushing diaphragmatic projection (`-10 dBFS`).
    * Call 3: Full, passionate shout (`-9 dBFS`, 125% vocal energy, crisp consonant release on `/t/`).

### 2. Momo (Comic Sidekick & Impulsive Foil — Orange Tabby Kitten)
* **Vocal Archetype:** High-pitched (A4–E5 register), bouncy, hyper-elastic 6-year-old kitten. Prone to gasps, breathless whispers, giggles, and sudden comedic pitch spikes.
* **Prosody & Intonation Rules:**
  * **The Irresistible Urge (00:03 – 00:48):** Whispered, breathless awe (*"Ooooh... shiny red button..."*). Cheerful feigned innocence when caught.
  * **The Dance Ray Panic (01:05 – 01:25):** Fast, staccato, syncopated vocal delivery synchronized with jittery tap-dancing feet (*"Whoa-whoa-whoa! I can't stop!"*).
  * **Misfire Banana Pie Gag (02:35 – 02:48):**
    * Pre-pie: Overconfident, smug, rushing (*"I know the magic word! Push the banana!"*).
    * Post-pie: Highly muffled, spitting out thick cream through clenched teeth (*"Pfffft! Not banana!"*). High comedic value.

### 3. Coco (Action Dynamo — Bunny)
* **Vocal Archetype:** Sporty, punchy, rhythmic girl voice.
* **Delivery:** Lead singer of the 120 BPM chant (01:30 – 01:55). Crisp syncopation on upbeat syllables (*"Red BUT-ton, red BUT-ton, ROUND and BRIGHT!"*).

### 4. Digital Word-Pop Watch
* **Vocal Archetype:** Friendly AI chime-synth voice (robotic yet warm, slight ring-modulation effect applied).
* **Lines:**
  * 02:20: *"Word-Pop Watch ready! Speak the magic command 3 times!"*
  * 02:58: *"33% Charged!"*
  * 03:08: *"66% Charged! Almost there!"*
  * 03:18: *"100% MAXIMUM POWER! RESTORATION BEAM READY!"*

---

## Part 2: SFX Engineering Track Sheet & Timecodes

All SFX reference files mapped from `/03_Audio_&_SFX_Bank/03_Master_Cartoon_SFX_30/`:

| Timecode | SFX Filename | Description & Action Cue | Mix Level (dBFS) | Anti-Collision Window Check |
| :--- | :--- | :--- | :---: | :--- |
| **00:00.50** | `13_Watch_Beep_Prompt.wav` | Low pulsating hum from red button | -22 dBFS | Ambient loop; no dialogue clash |
| **00:03.20** | `03_Tiptoe_Sneak_Xylophone.wav` | Momo tiptoeing toward pedestal | -16 dBFS | Ends at 00:05.00 before whisper |
| **00:07.20** | `01_Slide_Whistle_Up.wav` | Toby leaps through air across frame | -12 dBFS | Peaks at 00:07.80; decays by 00:08.10 |
| **00:08.20** | `[CLEAN VOCAL WINDOW]` | 0.3s silence window before Toby speaks | $-\infty$ | **PASS:** 0.35s decay before "Momo, NO!" |
| **00:12.80** | `27_Stinger_BoomBoom_Taiko.wav`| Sonic Branding: 2x Taiko boom + chime | -6 dBFS | Full impact during title card (no dialogue) |
| **00:32.00** | `12_Pop_Bubble_Large.wav` | Blue button lights up with pop | -14 dBFS | Precedes dialogue by 0.4s |
| **00:46.00** | `29_Squeak_Toy_Small.wav` | Momo's soft paw touches button | -10 dBFS | Instant comic tactile poke |
| **00:47.00** | `04_Rumble_Building_Low.wav` | Pedestal rumbles deep inside floor | -15 dBFS | Low frequency (sub-120 Hz); leaves voice clear |
| **00:58.00** | `05_Cartoon_Zip_Dash.wav` | Dance ray zaps Momo's tail | -10 dBFS | Quick 0.2s zap |
| **01:02.00** | `06_Boing_Spring_Loud.wav` | Momo's feet bouncing like springs | -12 dBFS | Alternates between Momo's vocal lines |
| **01:18.00** | `09_Crash_Dishes_Light.wav` | Coat rack wobbles and tea kettle clatters| -14 dBFS | Background Foley layer |
| **01:29.50** | `[BGM CHANT IN]` | 120 BPM Earworm Chant stems start | -14 LUFS | Vocals sit comfortably on top (-10 dBFS) |
| **02:02.00** | `17_Steam_Hiss_Overheat.wav` | Red button base vents white steam | -16 dBFS | High-pass filtered above 5 kHz |
| **02:22.00** | `13_Watch_Beep_Prompt.wav` | Watch LCD turns on | -12 dBFS | Precedes AI voice |
| **02:40.00** | `16_Misfire_Buzzer_Sad.wav` | Wrong word buzzer (*"Wah-wah-wah"*) | -10 dBFS | Triggers immediately on "banana" |
| **02:42.50** | `07_Pie_Splat_Wet.wav` | Banana cream pie hits Momo's face | -8 dBFS | Wet comedic splat |
| **02:43.00** | `[CLEAN VOCAL WINDOW]` | 0.4s decay while cream drips | $-\infty$ | **PASS:** Momo mumbles only after splat decays |
| **02:53.00** | `14_Watch_Charge_Glissando.wav`| Battery charge stage 1 (33%) | -12 dBFS | Synced with call 1 |
| **03:03.00** | `14_Watch_Charge_Glissando.wav`| Battery charge stage 2 (66%) | -10 dBFS | Synced with call 2 |
| **03:13.00** | `18_Chime_Correct_Star.wav` | Battery charge stage 3 (100% full) | -8 dBFS | Triumphant glissando & starburst |
| **03:21.00** | `15_Magic_Beam_Fire.wav` | Restoration Laser shoots from watch | -8 dBFS | 1.8s energetic sci-fi laser burst |
| **03:23.50** | `06_Boing_Spring_Loud.wav` | Red button pops back up to resting state| -10 dBFS | Comic relief spring pop |
| **03:45.00** | `25_Quiz_Clock_Tick_3s.wav` | 3-second wooden countdown clock | -14 dBFS | Woodblock tick-tock under question |
| **03:48.00** | `18_Chime_Correct_Star.wav` | Quiz Q1 correct answer chime | -10 dBFS | Crisp bell |
| **03:58.00** | `25_Quiz_Clock_Tick_3s.wav` | Quiz Q2 countdown clock | -14 dBFS | Woodblock tick-tock |
| **04:01.00** | `29_Squeak_Toy_Small.wav` | Big button bounces with squeak | -12 dBFS | Tactile feedback |
| **04:12.00** | `30_Sparkle_Success_End.wav` | 3 Badges awarded; quiz completed | -10 dBFS | Glockenspiel shimmer |
| **04:22.00** | `04_Rumble_Building_Low.wav` | Heavy floor vibration under door | -12 dBFS | Foreboding rumble |
| **04:24.00** | `08_Hollow_Wood_Bonk.wav` | 3 colossal thuds (*THUMP THUMP THUMP*) | -7 dBFS | Door frame shakes |

---

## Part 3: VFX & MOGRT Post-Production Cue Sheet

| Timecode | VFX Preset Name | Visual Treatment & Specifications | Target Screen Element |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:05** | `VFX_Pulsing_Glow` | 8-frame loop pulsating radial glow (`#FF2A2A`), opacity 40% $\rightarrow$ 85% | Red button dome surface |
| **00:08.50** | `VFX_12px_Yellow_Glow` | 12px solid yellow outline (`#FFEE00`) with 25% background dimming for 1.2s | Toby's outstretched warning paws |
| **00:09.00** | `MOGRT_Elastic_Text` | Bold rounded font (*Fredoka One*), `0% -> 115% -> 95% -> 100%` scale bounce | `"DON'T TOUCH IT!"` text popup |
| **00:12.80** | `VFX_Star_Sparks` | 24 radiant golden starburst particles emitting from watch lens | Center screen transition |
| **00:32.00** | `MOGRT_Kinetic_Word` | Word `"SMALL"` scales down to 60%; word `"BIG"` inflates to 140% like a balloon | Over Blue & Red buttons |
| **00:50.00** | `VFX_Alarm_Wash` | Red overlay strobe flash (`#FF0000`, 30% opacity, 120ms cycle) | Full canvas background |
| **00:58.00** | `VFX_Dance_Ray` | Neon cyan & magenta zigzag laser with particle trail linking ceiling to tail | Ceiling emitter to Momo |
| **01:30 – 01:55** | `MOGRT_Karaoke_Sync` | Syllable-by-syllable fill color change from `#FFFFFF` to `#FFD600` on 120 BPM beats | Bottom third center lyric banner |
| **01:54.00** | `MOGRT_Freeze_Stamp` | Word `"FREEZE!"` stamps onto screen with ice crystal frost spreading 15px | Center frame overlay |
| **02:02.00** | `VFX_Steam_Particles` | Semi-transparent white puffy cloud sprites drifting upward | Pedestal base |
| **02:20.00** | `VFX_Watch_HUD` | Circular holographic display projected from watch, displaying blinking digital eyes | Toby's wrist |
| **02:42.50** | `VFX_Pie_Splash` | Cream yellow splatter mask expanding across Momo's facial layer over 4 frames | Momo's head rig |
| **02:52.00** | `VFX_Battery_Meter_33`| First segment of circular battery illuminates bright neon gold (`#FFCC00`) | Holographic HUD |
| **03:02.00** | `VFX_Battery_Meter_66`| Second segment illuminates; electric arc sparks dance around HUD rim | Holographic HUD |
| **03:12.00** | `VFX_Battery_Meter_100`| Third segment fills; radiant golden rays shoot 360 degrees, screen pulse | Full HUD explosion |
| **03:21.00** | `VFX_Restoration_Beam`| 48px wide rainbow-gold beam with chromatic aberration and particle sparks | Watch to red button |
| **03:45 – 04:15** | `MOGRT_Quiz_Timer_UI` | Wooden clipboard frame, animated circular 3-second pie-wedge countdown graphic | Top right screen corner |
| **04:25.00** | `VFX_Glow_Footprint` | Radioactive lime green slime footprint (`#39FF14`) glowing softly with steam | Floor welcome mat |
| **04:29.50** | `VFX_Hard_Cut_Black` | Instant 1-frame cut to absolute black (`#000000`) at exactly 04:30.00 | Full screen blackout |
