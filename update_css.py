import re

with open('client/src/index.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace Theme 1
css = re.sub(r':root \{.*?\/\*.*?THEME 2', r'''
:root {
  --dark-bg:     15 23 42;
  --dark-card:   30 41 59;
  --dark-surf:   51 65 85;
  --dark-border: 14 165 233;

  --accent-cyan:   56 189 248;
  --accent-purple: 236 72 153;
  --accent-pink:   244 114 182;
  --accent-gold:   253 224 71;
  --accent-green:  74 222 128;

  --glow-1: rgba(56, 189, 248, 0.42);
  --glow-2: rgba(236, 72, 153, 0.35);
  --glow-3: rgba(244, 114, 182, 0.25);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 2''', css, flags=re.DOTALL)

# Replace Theme 2
css = re.sub(r'\.theme-inferno \{.*?\/\*.*?THEME 3', r'''
.theme-sunset {
  --dark-bg:     69 10 10;
  --dark-card:   127 29 29;
  --dark-surf:   153 27 27;
  --dark-border: 239 68 68;

  --accent-cyan:   251 146 60;
  --accent-purple: 248 113 113;
  --accent-pink:   250 204 21;
  --accent-gold:   254 240 138;
  --accent-green:  163 230 53;

  --glow-1: rgba(251, 146, 60, 0.48);
  --glow-2: rgba(239, 68, 68, 0.38);
  --glow-3: rgba(250, 204, 21, 0.28);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 3''', css, flags=re.DOTALL)

# Replace Theme 3
css = re.sub(r'\.theme-matrix \{.*?\/\*.*?THEME 4', r'''
.theme-rainforest {
  --dark-bg:     6 78 59;
  --dark-card:   4 120 87;
  --dark-surf:   5 150 105;
  --dark-border: 16 185 129;

  --accent-cyan:   52 211 153;
  --accent-purple: 110 231 183;
  --accent-pink:   167 243 208;
  --accent-gold:   252 211 77;
  --accent-green:  52 211 153;

  --glow-1: rgba(52, 211, 153, 0.45);
  --glow-2: rgba(16, 185, 129, 0.38);
  --glow-3: rgba(110, 231, 183, 0.25);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 4''', css, flags=re.DOTALL)

# Replace Theme 4
css = re.sub(r'\.theme-monochrome \{.*?\/\*.*?THEME 5', r'''
.theme-coral {
  --dark-bg:     17 94 89;
  --dark-card:   15 118 110;
  --dark-surf:   13 148 136;
  --dark-border: 244 63 94;

  --accent-cyan:   251 113 133;
  --accent-purple: 45 212 191;
  --accent-pink:   94 234 212;
  --accent-gold:   253 164 175;
  --accent-green:  20 184 166;

  --glow-1: rgba(251, 113, 133, 0.35);
  --glow-2: rgba(45, 212, 191, 0.30);
  --glow-3: rgba(94, 234, 212, 0.20);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 5''', css, flags=re.DOTALL)

# Replace Theme 5
css = re.sub(r'\.theme-arctic \{.*?\/\*.*?THEME 6', r'''
.theme-daybreak {
  --dark-bg:     49 46 129;
  --dark-card:   67 56 202;
  --dark-surf:   79 70 229;
  --dark-border: 129 140 248;

  --accent-cyan:   96 165 250;
  --accent-purple: 192 132 252;
  --accent-pink:   244 114 182;
  --accent-gold:   253 224 71;
  --accent-green:  52 211 153;

  --glow-1: rgba(96, 165, 250, 0.45);
  --glow-2: rgba(192, 132, 252, 0.35);
  --glow-3: rgba(244, 114, 182, 0.25);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 6''', css, flags=re.DOTALL)

# Replace Theme 6
css = re.sub(r'\.theme-tokyo \{.*?\/\*.*?THEME 7', r'''
.theme-violet {
  --dark-bg:     76 29 149;
  --dark-card:   91 33 182;
  --dark-surf:   109 40 217;
  --dark-border: 217 70 239;

  --accent-cyan:   232 121 249;
  --accent-purple: 192 38 211;
  --accent-pink:   56 189 248;
  --accent-gold:   250 204 21;
  --accent-green:  52 211 153;

  --glow-1: rgba(232, 121, 249, 0.48);
  --glow-2: rgba(192, 38, 211, 0.38);
  --glow-3: rgba(56, 189, 248, 0.28);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 7''', css, flags=re.DOTALL)

# Replace Theme 7
css = re.sub(r'\.theme-cyber \{.*?\/\*.*?THEME 8', r'''
.theme-autumn {
  --dark-bg:     120 53 15;
  --dark-card:   146 64 14;
  --dark-surf:   180 83 9;
  --dark-border: 245 158 11;

  --accent-cyan:   251 191 36;
  --accent-purple: 252 211 77;
  --accent-pink:   248 113 113;
  --accent-gold:   253 230 138;
  --accent-green:  163 230 53;

  --glow-1: rgba(251, 191, 36, 0.48);
  --glow-2: rgba(245, 158, 11, 0.35);
  --glow-3: rgba(252, 211, 77, 0.25);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   THEME 8''', css, flags=re.DOTALL)

# Replace Theme 8
css = re.sub(r'\.theme-amethyst \{.*?\/\*.*?BASE', r'''
.theme-frost {
  --dark-bg:     30 41 59;
  --dark-card:   51 65 85;
  --dark-surf:   71 85 105;
  --dark-border: 94 234 212;

  --accent-cyan:   20 184 166;
  --accent-purple: 45 212 191;
  --accent-pink:   167 243 208;
  --accent-gold:   253 230 138;
  --accent-green:  163 230 53;

  --glow-1: rgba(94, 234, 212, 0.45);
  --glow-2: rgba(45, 212, 191, 0.38);
  --glow-3: rgba(167, 243, 208, 0.25);
}

/* ═══════════════════════════════════════════════════════════════════════════════════════════════════
   BASE''', css, flags=re.DOTALL)

css = re.sub(r'\.theme-monochrome \.btn-primary.*?theme-monochrome input::placeholder \{.*?\}', '', css, flags=re.DOTALL)
css = re.sub(r'\.theme-cyber \.btn-primary.*?transparent !important;\s*\}', '', css, flags=re.DOTALL)

with open('client/src/index.css', 'w', encoding='utf-8') as f:
    f.write(css)
