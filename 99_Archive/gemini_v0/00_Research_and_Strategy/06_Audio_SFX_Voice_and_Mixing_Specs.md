# [Research Module 6] Audio Engineering, Sound Design (SFX), Voice Acting Prosody & Musical Earworm Architecture (Target Ages: 5–10)

## 1. The 5 Essential SFX Categories & The EFL Anti-Collision Rule

| SFX Category | Core Sound Palette | Pedagogical & Psychological Function |
|---|---|---|
| 1. Elastic Slapstick Physics | Boings, spring coils, rubber stretches, slide whistles, timpani hits, squeaky squashes. | Removes pain from physical falls and turns mistakes into elastic comedy. |
| 2. Lexical & Visual UI Pop-Ups | Bubble pops, cork plops, crisp paper whooshes, sparkle chimes. | Directs the viewer's eye to appearing flashcards or glowing outlines within 0.1s. |
| 3. Internal State & Emotion Cues | Stomach growls, heartbeat thumps, dizzy cuckoos, deflating balloons, kettle whistles. | Translates abstract states (hungry, scared, dizzy, tired, angry) into sound symbols. |
| 4. Gamification & Quiz Mechanics | Woodblock ticking clock (Tick-Tock), bright "Ding-Ding!", kids cheering "Yay!", muted trombone. | Triggers active vocal output during 3-second countdown quizzes. |
| 5. Hyper-Exaggerated Foley | Crispy apple crunches ("Eat"), heavy bass stomps ("Giant/Big"), pizzicato tiptoes ("Quiet"). | Reinforces action verbs and adjectives through heightened sensory realism. |

### The EFL Anti-Collision Audio Law (Mandatory Sequence)
Never overlap a loud crash or explosion with the consonant attack of a target English word:
* `-0.3s (Anticipation SFX):` Slide whistle up as character jumps.
* `0.0s (Impact SFX):` BOING! as character lands.
* `+0.3s (Clean Vocal Window):` SFX decays by 80%, leaving a crystal-clear acoustic pocket for: *"Bounce! I can bounce!"*

## 2. Voice Acting (VO) Prosody & The Acoustic Frame

| Vocal Parameter | Ages 5–7 Standard (Starter Track) | Ages 8–10 Standard (Mystery Track) |
|---|---|---|
| Speech Rate (WPM) | 90 – 110 WPM (Spacious, deliberate) | 120 – 145 WPM (Energetic, natural flow) |
| Pitch Variation Range | 10 – 14 Semitones (>1 Octave) | 7 – 10 Semitones (Dramatic acting) |
| Vowel & Consonant Articulation | +30% Vowel Elongation on stressed syllables + crisp final consonants (/t/, /d/, /k/, /p/, /s/). | Clear Rhythm-Group Chunking between clauses. |
| The "Acoustic Frame" Pause | Insert a mandatory 0.5-second micro-pause immediately before the target keyword: *"Touch the... [0.5s pause] ...RED button!"* | Use 0.6s–1.0s dramatic suspense pauses before revealing clues. |

**3-Tier Vocal Casting:** (1) High Register (250–350 Hz) curious peer voice, (2) Textured/Comedic sidekick voice (switching to 100% clean diction on target words), (3) Warm Mid-Low Register (130–200 Hz) leader/narrator voice.

## 3. BGM Tempo Mapping, Safe Instrumentation & Broadcast Mixing Specs
* **Tempo (BPM) Mapping:**
  * 95–108 BPM: Mystery setup, tiptoeing, curiosity.
  * 115–125 BPM (120 BPM Golden Standard): Vocabulary Chants (2 beats/sec matches kids' clapping rhythm).
  * 135–150 BPM: Slapstick chases and climax action bursts.
* **Frequency-Safe Instruments (Protecting 1.5–4.5 kHz Speech Intelligibility):**
  * Use fast-decay percussive/plucked instruments: Marimba, Xylophone, Woodblocks, Pizzicato Strings, Ukulele, Acoustic Upright Bass. Avoid dense distorted guitars or mid-range synth walls.
* **Broadcast Loudness & Sidechain Ducking Specifications:**
  * Master Loudness: -14 LUFS (Integrated), -1.0 dBTP (True Peak Max).
  * Dialogue Track: -12 to -9 dBFS, center-panned, high-pass filter at 100 Hz, +2.5 dB EQ presence boost at 3.2 kHz.
  * Automated Sidechain Ducking: Normal BGM sits at -18 to -20 dBFS. Whenever dialogue triggers, sidechain compression ducks BGM by -10 to -12 dB (down to -30 dBFS) with a 15ms Attack and 400ms Release.
