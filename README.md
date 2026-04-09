# HTPC Game Launcher

Een **SteamOS-achtige console-ervaring** op Windows voor je TV. Volledig bestuurbaar met een gamepad - geen muis of toetsenbord nodig!

## Features

- **Automatische Steam detectie** - Vindt al je Steam games automatisch
- **Custom games toevoegen** - Voeg je eigen .exe games toe
- **Volledige gamepad ondersteuning** - 8BitDo 2C en Xbox controllers
- **Liquid Glass UI** - Premium design met glazen effecten en animaties
- **TV-vriendelijk** - Grote tekst, hoge contrast, duidelijke focus
- **Start met Windows** - Optioneel automatisch opstarten
- **Naadloze terugkeer** - Keer automatisch terug naar launcher na game afsluiten

## Systeemvereisten

| Component | Minimum |
|-----------|---------|
| OS | Windows 10/11 |
| RAM | 4 GB |
| Scherm | 1080p+ (aanbevolen voor TV) |
| Controller | 8BitDo 2C, Xbox, of compatible |
| Software | Node.js 18+ (alleen voor development) |

## Installatie

### Methode 1: Directe installatie (Aanbevolen)

1. **Download de laatste release**
   - Ga naar [Releases](https://github.com/zrowan1/htpc-game-launcher/releases)
   - Download `HTPC-Game-Launcher-Setup.exe`

2. **Installeer de app**
   - Dubbelklik op de gedownloade installer
   - Volg de installatiewizard
   - Kies installatielocatie (standaard: `C:\Program Files\HTPC Game Launcher`)

3. **Start de app**
   - Via Start Menu: `HTPC Game Launcher`
   - Of dubbelklik de snelkoppeling op je bureaublad

### Methode 2: Vanaf source (Development)

Voor ontwikkelaars of als je de laatste features wilt testen:

```bash
# 1. Clone de repository
git clone https://github.com/zrowan1/htpc-game-launcher.git

# 2. Ga naar de projectmap
cd htpc-game-launcher

# 3. Installeer dependencies
npm install

# 4. Start de applicatie
npm start
```

#### Build een executable

```bash
# Maak een Windows installer
npm run dist

# De installer staat in de `dist` map
```

## Eerste keer opstarten

Bij het eerste gebruik:

1. **Steam library wordt automatisch gescand**
   - Alle geïnstalleerde Steam games verschijnen in het grid
   - Dit kan 10-30 seconden duren

2. **(Optioneel) Voeg custom games toe**
   - Druk op **Y** (gele knop) om een game toe te voegen
   - Selecteer het .exe bestand van je game

3. **Configureer instellingen** (optioneel)
   - Druk op **B** (rode knop) voor instellingen
   - Schakel "Auto-start with Windows" in als gewenst

## Bediening

### Gamepad (8BitDo 2C / Xbox)

| Knop | Actie |
|------|-------|
| **D-Pad** | Navigeer door games |
| **A (Groen)** | Start geselecteerde game |
| **B (Rood)** | Open instellingen menu |
| **Y (Geel)** | Voeg nieuwe game toe |
| **X (Blauw)** | Vernieuw Steam library |
| **LB/RB** | Snel scrollen (pagina omhoog/omlaag) |
| **Start/Menu** | App volledig herstarten |

### Toetsenbord (Fallback)

| Toets | Actie |
|-------|-------|
| **Pijltjestoetsen** | Navigeren |
| **Enter** | Start game / Bevestig |
| **Escape** | Terug / Annuleer |
| **Y** | Voeg game toe |
| **B** | Open instellingen |
| **R** | Vernieuw library |

### Instellingen Menu (B-knop)

- **Auto-start with Windows** - Start automatisch bij Windows opstart
- **Fullscreen Mode** - Schakel tussen fullscreen en venster
- **Theme** - Kies licht/donker thema
- **Refresh Steam Library** - Handmatig Steam games verversen
- **Restart App** - Herstart de applicatie
- **Exit to Desktop** - Sluit de launcher af

### Game Toevoegen (Y-knop)

1. Druk op **Y** om het "Add Game" dialoog te openen
2. Geef een naam voor de game
3. Selecteer het .exe bestand
4. (Optioneel) Voeg een banner/artwork toe
5. Bevestig met **A**

## Tips voor TV gebruik

- **Resolutie**: Zet Windows schaling op 100-125% voor beste resultaat
- **HDR**: App ondersteunt HDR voor levendige kleuren
- **Controller**: Sluit je controller aan VOOR je de app start
- **Audio**: Zet Windows geluid aan voor de beste ervaring

## Veelvoorkomende problemen

### App start niet op
- Controleer of Windows 10/11 is geïnstalleerd
- Zorg dat je de juiste architectuur hebt (x64)
- Probeer als administrator uit te voeren

### Steam games verschijnen niet
- Zorg dat Steam is geïnstalleerd en minstens 1 keer is gestart
- Controleer of games geïnstalleerd zijn in een standaard Steam library
- Druk op **X** om handmatig te verversen

### Controller werkt niet
- Sluit controller aan VOOR je de app start
- Gebruik XInput modus (X + Start op 8BitDo)
- Test de controller in Windows game controller instellingen

### Game start niet
- Controleer of het .exe pad correct is
- Sommige games vereisen administrator rechten
- Anti-cheat kan conflicten veroorzaken

### Na game sluiten keer ik niet terug
- Sommige games sluiten niet correct af
- Gebruik Alt+Tab om terug te keren naar de launcher
- Druk op Start/Menu om de app te herstarten

## Development

### Project structuur

```
src/
├── main/              # Electron main process
│   ├── services/      # Game launching, Steam integration
│   └── preload.js     # Secure API
├── renderer/          # React UI
│   ├── components/    # GameGrid, GameCard, etc.
│   ├── hooks/         # useGamepad, useGames
│   └── services/      # API layer
└── shared/            # Constants
```

### Commands

| Commando | Beschrijving |
|----------|-------------|
| `npm start` | Start in development mode |
| `npm run build` | Build voor productie |
| `npm run dist` | Maak Windows installer |
| `npm run dev:web` | Test UI in browser (zonder Electron) |

### Meer informatie

- [AGENTS.md](AGENTS.md) - Gedetailleerde architectuur & design systeem
- [CLAUDE.md](CLAUDE.md) - Development workflow
- [SPEC.md](HTPC_GameLauncher_SPEC.md) - Technische specificatie

## Roadmap

- [x] **Fase 1 (MVP)** - Basis launcher met Steam detectie
- [ ] **Fase 2** - Cover art, favorieten, filters, power menu
- [ ] **Fase 3** - Epic Games, Game Pass, GOG, emulators
- [ ] **Fase 4** - Game details, audio feedback, screenshots

## Bijdragen

Bugs gevonden of feature requests? Maak een [Issue](https://github.com/zrowan1/htpc-game-launcher/issues) aan!

## Licentie

MIT License - Zie [LICENSE](LICENSE) voor details.

---

**Veel gameplezier!** 🎮
