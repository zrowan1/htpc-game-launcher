# Browser Testing Guide

Deze app kan ook in de browser getest worden zonder Electron. Dit is handig voor het testen van UI wijzigingen op verschillende apparaten.

## Quick Start

```bash
# Genereer SSL certificaten (éénmalig)
npm run certs

# Start de app in HTTPS mock mode
npm run dev:web:https
```

De app is nu beschikbaar op `https://<jouw-ip>:5173`

## Scripts

- `npm run dev:web` - Start in HTTP modus (alleen localhost)
- `npm run dev:web:https` - Start in HTTPS modus (toegankelijk vanaf netwerk)
- `npm run certs` - Genereer nieuwe SSL certificaten

## Mock API

In browser modus werkt de app met een mock API die:
- Games opslaat in localStorage
- Steam integratie simuleert
- Game launch toont een alert (start geen echte games)
- Een visuele indicator toont dat je in mock mode bent

## Vanaf andere apparaten verbinden

1. Start de app: `npm run dev:web:https`
2. Zoek je IP adres: `ipconfig` (Windows) of `ifconfig` (Mac/Linux)
3. Open op je telefoon/tablet/laptop: `https://<jouw-ip>:5173`
4. Accepteer het self-signed SSL certificaat (dit is veilig voor lokaal testen)

## Belangrijke verschillen met Electron

| Feature | Electron | Browser Mock |
|---------|----------|--------------|
| Games opslaan | JSON bestand | localStorage |
| Steam games | Echt ophalen | Mock data |
| Game starten | Start exe/steam | Alert tonen |
| Fullscreen | Venster controls | Browser fullscreen |
| Controller | Direct input | Gamepad API |

## Troubleshooting

### "Certificaat niet vertrouwd"
Dit is normaal bij self-signed certificaten. Klik op "Advanced" → "Proceed anyway" (Chrome) of voeg een uitzondering toe.

### "Cannot connect"
Controleer firewall instellingen en zorg dat poort 5173 open staat.

### Mock data wissen
```javascript
localStorage.removeItem('mock-games')
location.reload()
```

## Productie build

De browser modus is alleen voor testen. Voor productie gebruik:
```bash
npm run build
```
Dit maakt een Windows executable.
