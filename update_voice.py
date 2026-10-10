import re

with open('client/src/components/VoiceAssistant.jsx', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace theme names
js = js.replace("ocean: '🌌 Cosmic Stargate'", "nebula: '🌌 Deep Space Nebula'")
js = js.replace("inferno: '🌋 Inferno Solaris'", "sunset: '🏜️ Sunset Mirage'")
js = js.replace("matrix: '⚡ Cyberpunk Holo-Matrix'", "rainforest: '🌿 Neon Rainforest'")
js = js.replace("monochrome: '🌑 Monolith Chrono'", "coral: '🪸 Deep Coral Reef'")
js = js.replace("arctic: '🧊 Glacial Prism'", "daybreak: '🌅 Daybreak Horizon'")
js = js.replace("tokyo: '🪩 Retro Synthwave Highway'", "violet: '🔮 Electric Violet'")
js = js.replace("cyber: '👑 Imperial Gold Luxe'", "autumn: '🍂 Golden Autumn'")
js = js.replace("amethyst: '🌿 Bio-Luminescent Pandora'", "frost: '❄️ Mint Frosting'")

# Replace ALL_THEMES array
new_all_themes = "['theme-sunset', 'theme-rainforest', 'theme-coral', 'theme-daybreak', 'theme-violet', 'theme-autumn', 'theme-frost']"
js = re.sub(r"const ALL_THEMES = \['theme-inferno'.*?\];", "const ALL_THEMES = " + new_all_themes + ";", js)

# Replace the switch logic
new_logic = '''      let newTheme = 'nebula';
      if (command.includes('sunset') || command.includes('fire') || command.includes('orange') || command.includes('mirage')) newTheme = 'sunset';
      else if (command.includes('rainforest') || command.includes('forest') || command.includes('green') || command.includes('leaves')) newTheme = 'rainforest';
      else if (command.includes('coral') || command.includes('reef') || command.includes('teal') || command.includes('ocean')) newTheme = 'coral';
      else if (command.includes('daybreak') || command.includes('horizon') || command.includes('morning') || command.includes('sunrise')) newTheme = 'daybreak';
      else if (command.includes('violet') || command.includes('purple') || command.includes('electric') || command.includes('neon')) newTheme = 'violet';
      else if (command.includes('autumn') || command.includes('gold') || command.includes('golden') || command.includes('fall')) newTheme = 'autumn';
      else if (command.includes('frost') || command.includes('mint') || command.includes('ice') || command.includes('snow')) newTheme = 'frost';
      else if (command.includes('nebula') || command.includes('space') || command.includes('stars')) newTheme = 'nebula';

      ALL_THEMES.forEach(cls => document.body.classList.remove(cls));
      if (newTheme !== 'nebula') document.body.classList.add(`theme-${newTheme}`);'''

js = re.sub(r"let newTheme = 'ocean';.*?if \(newTheme !== 'ocean'\) document\.body\.classList\.add\(`theme-\$\{newTheme\}`\);", new_logic, js, flags=re.DOTALL)

with open('client/src/components/VoiceAssistant.jsx', 'w', encoding='utf-8') as f:
    f.write(js)
