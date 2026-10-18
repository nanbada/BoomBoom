# 00: Character Rigs Prompts & 12 EFL Visemes Guide

## 1. Midjourney / Stable Diffusion Consistent Character Sheet Prompts
Use these master text prompts and style references to generate modular, turnaround character assets ready for PSD slicing and 2D skeletal rigging.

### A. Toby (Lead Hero Detective — Golden Retriever)
```text
Full body character turnaround sheet of a cute anthropomorphic golden retriever puppy detective, 2.8 heads tall proportions, friendly large expressive eyes, wearing royal blue detective vest, matching blue flat newsboy cap, bright red sci-fi chunky wristwatch on left wrist with glowing yellow digital face, clean vector animation style, smooth bold outlines, cel-shaded flat colors, solid golden amber fur (#FFB800), pure white background, front view, 3/4 view, side view, back view, multiple hand poses, no gradients, production art for 2D animation rigging --no photorealism, 3d render, shadows --ar 16:9 --v 6.1
```

### B. Momo (Comic Sidekick — Orange Tabby Cat)
```text
Full body character turnaround sheet of an energetic elastic orange tabby kitten, 2.5 heads tall proportions, oversized expressive comic eyes occupying 30% of face, cheerful wide smile with white muzzle for high-contrast mouth shapes, wearing mint green aviator goggles on forehead and mint green small belt snack pouch, coral orange fur with soft brown tabby stripes (#FF6B2B), cute bouncy tail, clean 2D vector animation style, bold outlines, flat colors, front view, 3/4 view, side view, back view, slapstick squashed and stretched poses, pure white background --no 3d render, realistic fur --ar 16:9 --v 6.1
```

### C. Coco (Action Bunny) & Foxy Lex (Trickster Fox)
```text
Full body character design sheet, anthropomorphic cartoon characters: (1) athletic white bunny in neon pink hoodie with spring sneakers, long expressive ears; (2) sleek red fox in purple mini-cape and neon green gadgets, mischievous smile; clean vector line art, animation turnaround model sheet, flat cel-shading, white background --ar 16:9 --v 6.1
```

---

## 2. 2D Rigging Architecture (Moho Pro 14 / Cartoon Animator 5)
To maintain our weekly 5-day sprint schedule, character rigs must follow this standardized group hierarchy:

```
[Character_Master_Group] (Center 9:16 safe constraint)
├── 01_Head_Bone_Root
│   ├── Face_Base (Vector)
│   ├── Eyes_Switch_Group (Blink, Wide, Shock, Squint, Wink)
│   ├── Eyebrows_SmartBones (Curious, Angry, Sad, Happy)
│   ├── 12_Visemes_Mouth_Switch_Group (Vector interpolation enabled)
│   └── Ears_Dynamics (Spring physics enabled)
├── 02_Torso_Bone_Root
│   ├── Upper_Body_Costume (Vest / Hoodie)
│   └── Squash_Stretch_Belly_SmartBone
├── 03_Limbs_IK_Bones
│   ├── Left_Arm_with_Watch_Group (Toby gadget layer)
│   ├── Right_Arm_Hand_Switch_Group (Open, Fist, Point, Thumbs-up, Grab)
│   └── Legs_Smooth_Bend_IK (No sharp joint artifacts)
└── 04_Shadow_Layer (Soft ellipse at feet)
```

---

## 3. The 12 EFL Phonics Viseme Mouth Chart
Accurate visual mouth shapes are essential for non-native children learning English phonetic pronunciation. Model sheets must supply these 12 standardized vector mouth switch layers:

| Viseme ID | Phonemes Represented | Visual Anatomical Shape | Example Target Words |
| :--- | :--- | :--- | :--- |
| **01_MBP** | /m/, /b/, /p/ | Lips firmly closed, compressed flat line | *Momo, Button, Push* |
| **02_AH** | /ɑː/, /æ/, /ʌ/ | Jaw dropped wide open, tongue visible on bottom floor | *Apple, Cat, Hat* |
| **03_EE** | /iː/, /ɪ/, /eɪ/ | Wide horizontal stretch, showing top & bottom teeth | *Cheese, See, Sleep* |
| **04_OO_W** | /uː/, /ʊ/, /w/ | Tight circular puckered "O" opening | *Blue, Shoe, Watch* |
| **05_FV** | /f/, /v/ | Top front teeth clearly biting gently on lower lip | *Fox, Five, Vest* |
| **06_TH** | /θ/, /ð/ | Tongue tip clearly protruding between upper and lower incisors | *This, Thank you, Three* |
| **07_L_N_T_D** | /l/, /n/, /t/, /d/ | Tongue tip elevated touching roof behind upper teeth | *Lion, Touch, Down* |
| **08_R** | /r/, /ɜːr/ | Slightly square rounded lips, tongue pulled back | *Red, Run, Carrot* |
| **09_CH_J_SH**| /tʃ/, /dʒ/, /ʃ/ | Flared square puckered lips with teeth touching | *Chair, Jump, Shoes* |
| **10_SHOUT** | Climax Loud Yell | 130% enlarged oval mouth, tongue vibrating, tonsil visible | *"DON'T TOUCH IT!"* |
| **11_SQUASH** | Comedic Impact | Flat asymmetric wavy mouth, teeth clenched (*Oof!*) | *Banana pie impact* |
| **12_CONFUSED**| Hesitation / Wonder | Zig-zag squiggly mouth with corner quirk (*Hmm...?*) | *Looking at clue* |
