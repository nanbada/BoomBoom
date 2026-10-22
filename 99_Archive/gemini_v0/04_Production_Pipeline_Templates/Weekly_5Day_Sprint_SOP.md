# Weekly 5-Day Production Sprint SOP (AI + 2D Rigging Hybrid Pipeline)

## 1. Pre-Production PSD Layer Hierarchy Standard (Moho Pro 14 / CTA 5)
```text
+ Character_Root_Bone
  ├── Head_Group
  │    ├── Ears_L / Ears_R (Spring Physics enabled for automatic bounce)
  │    ├── Brows_Switch (Normal, Angry, Sad, Shocked)
  │    ├── Eyes_Switch (Normal, +20% Enlarged Shock, Blink, Happy Arc)
  │    ├── Pupils_Target (Tracked to Look-At Bone + Spiral/Star switches)
  │    └── Mouth_12Visemes_Switch (01_MBP to 12_Comic_OOPS)
  ├── Torso_Group (Includes Word-Pop Watch Glow layer on Toby)
  ├── Arm_R / Arm_L (Upper_Arm -> Forearm -> Hand_10Poses_Switch)
  ├── Leg_R / Leg_L (Thigh -> Shin -> Foot_Target_IK)
  └── Tail_Bone_Chain (Spring Physics enabled)
```

## 2. Weekly 5-Day Production Schedule (1x 4:30 Episode + 3x 45s Loop Shorts)
* **Day 1: Script Generation & "Audio-First" Master Timeline**
  - [ ] Generate episode script adhering to the 60:25:15 Ratio, Triple-Lock sequence, and 8–10x repetition escalation.
  - [ ] Record 1-person expressive guide track (1-octave pitch range, +30% vowel elongation, mandatory 0.5s pause before target keywords).
  - [ ] Convert guide vocal via ElevenLabs Speech-to-Speech (STS) into Toby, Momo, Coco, Foxy Lex, and Barnaby vocal stems.
  - [ ] Generate 25-second 120 BPM Word-Pop Chant (Marimba, Xylophone, Pizzicato Strings, Ukulele).
  - [ ] Assemble the complete 4:30 Master Audio Track in Premiere Pro, verifying the 0.3s Clean Vocal Window after every impact SFX.
* **Day 2: AI Consistent Backgrounds & 4-Layer Separation**
  - [ ] Generate backgrounds and target props using locked Wonder Paw Town --sref style seed.
  - [ ] Split into 4 PSD planes: 01_Background_Sky_Walls, 02_Midground_Floor, 03_Target_Vocabulary_Objects (isolated for 12px Glow), 04_Foreground_Props.
* **Day 3 & Day 4: 2D Rig Animation & Phonetic Lip-Sync Polish**
  - [ ] Import Master Audio into Moho Pro 14 / Cartoon Animator 5 and run automatic lip-sync.
  - [ ] Manual 20% Pedagogical Polish: Manually override the 8–10 Target Keyword utterances using the +20% Shout Mouth and exact TH / F / V / L viseme switches.
  - [ ] Block body motion using the 50 Reusable Motion Clips; add custom Squash & Stretch keyframes on Momo's slapstick moments.
  - [ ] Maintain all primary character action inside the Center 9:16 Safe Frame for rapid Shorts conversion.
* **Day 5: Pedagogical VFX, Auto-Ducking & Multi-Format Export**
  - [ ] Apply After Effects/Premiere .mogrt overlays: Triple-Lock Pre-Cue Bubble, 12px Yellow Outline Glow + 25% BG Dimming, Karaoke Syllable Text, and 3s Countdown Quiz Timer.
  - [ ] Enable Sidechain Compressor on BGM (-10 to -12 dB ducking, 15ms attack, 400ms release) and normalize master audio to -14 LUFS (-1.0 dBTP).
  - [ ] Export 16:9 Long-Form Master (4:30) + 3x 9:16 Seamless Infinite-Loop Shorts (45s) + High-CTR Thumbnail.
