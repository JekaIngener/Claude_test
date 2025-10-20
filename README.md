# PDF Stempel Designer

Ein interaktives Web-Tool zum Erstellen von PDF-Stempeln mit Formularfeldern für www.stempel4punkt0.de

## Features

### ✨ Haupt-Features
- **Interaktiver Canvas-Editor** mit Drag & Drop Funktionalität
- **Größenänderung** durch Ziehen an Resize-Handles
- **Layer-Management** (Ebenen verschieben, kopieren, löschen)
- **Freie Farbauswahl** für alle Elemente
- **PDF Export** mit interaktiven Formularfeldern

### 🎨 Verfügbare Elemente

#### Formen & Elemente
- **Rechteck** - Mit konfigurierbarer Rahmenstärke und Füllung
- **Linie** - Mit einstellbarer Dicke
- **Text** - Mit Schriftgröße, Fett-Option und Farbauswahl
- **Logo** - Upload von PNG/SVG Dateien (500-1000 KB)

#### Formularfelder
- **Textfeld** - Einzeilig oder mehrzeilig
- **Datumsfeld** - Spezielles Feld für Datumseingaben
- **Dropdown** - Mit konfigurierbaren Optionen
- **Checkbox** - Mit optionaler Beschriftung
- **Radio Buttons** - Mit mehreren Auswahloptionen

### 🛠️ Eigenschaften-Editor
- Position (X, Y Koordinaten)
- Größe (Breite, Höhe)
- Farbe mit visueller Farbauswahl
- Deckkraft/Transparenz
- Element-spezifische Eigenschaften

### 📐 Canvas-Einstellungen
- Benutzerdefinierte Größe (Breite & Höhe in Pixeln)
- Standard: A4 Format (595 x 842 px)

## Installation

### Voraussetzungen
- Node.js (Version 14 oder höher)
- npm oder yarn

### Schritte

1. **Dependencies installieren**
   ```bash
   npm run install-all
   ```

   Dies installiert alle benötigten Pakete für Frontend und Backend.

2. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

   Dies startet gleichzeitig:
   - Backend-Server auf Port 5000
   - React-Frontend auf Port 3000

3. **Browser öffnen**

   Öffnen Sie http://localhost:3000 in Ihrem Browser

## Verwendung

### Neues Element hinzufügen
1. Klicken Sie auf ein Werkzeug in der linken Werkzeugleiste
2. Klicken Sie auf die Canvas, um das Element zu platzieren

### Element bearbeiten
1. Klicken Sie auf ein Element auf der Canvas
2. Verwenden Sie das Eigenschaften-Panel auf der rechten Seite
3. Ziehen Sie das Element, um es zu verschieben
4. Ziehen Sie an den Resize-Handles, um die Größe zu ändern

### Logo hochladen
1. Klicken Sie auf das "Logo" Werkzeug
2. Wählen Sie eine PNG oder SVG Datei (500-1000 KB)
3. Das Logo wird automatisch auf der Canvas platziert

### Layer verwalten
1. Verwenden Sie das Layer-Panel auf der rechten Seite
2. Klicken Sie auf die Pfeile, um die Ebenen-Reihenfolge zu ändern
3. Verwenden Sie das Kopier-Symbol zum Duplizieren
4. Verwenden Sie das Papierkorb-Symbol zum Löschen

### PDF exportieren
1. Klicken Sie auf "PDF Exportieren" in der oberen rechten Ecke
2. Die PDF-Datei wird mit allen interaktiven Formularfeldern heruntergeladen

## Technologie-Stack

### Frontend
- **React 18** - UI Framework
- **react-color** - Farbauswahl-Komponente
- **react-icons** - Icon-Bibliothek
- **axios** - HTTP Client

### Backend
- **Node.js** - Runtime
- **Express** - Web Framework
- **pdf-lib** - PDF-Generierung mit Formularfeldern
- **multer** - Datei-Upload Middleware

## Projektstruktur

```
pdf-stamp-tool/
├── client/                 # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React Komponenten
│   │   │   ├── Canvas.js   # Haupt-Canvas Editor
│   │   │   ├── Toolbar.js  # Werkzeugleiste
│   │   │   ├── PropertiesPanel.js
│   │   │   ├── LayerPanel.js
│   │   │   └── TemplatePanel.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── pdfController.js
│   │   ├── routes/
│   │   │   └── pdfRoutes.js
│   │   └── server.js
│   └── package.json
└── package.json           # Root package.json
```

## API Endpunkte

### POST /api/pdf/generate
Generiert eine PDF-Datei mit interaktiven Formularfeldern.

**Request Body:**
```json
{
  "elements": [...],
  "pageWidth": 595,
  "pageHeight": 842
}
```

**Response:** PDF Binary Data

### POST /api/upload
Lädt ein Bild (Logo) hoch.

**Form Data:**
- `image`: PNG oder SVG Datei (500-1000 KB)

**Response:**
```json
{
  "success": true,
  "filename": "...",
  "path": "/uploads/...",
  "size": 750000
}
```

## Zukünftige Features (Vorlagen-Panel)

- Vorgefertigte Stempel-Designs
- Branchen-spezifische Vorlagen
- Eigene Vorlagen speichern
- Vorlagen teilen

## Browser-Unterstützung

- Chrome (empfohlen)
- Firefox
- Safari
- Edge

## Lizenz

Proprietär - Alle Rechte vorbehalten

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklungsteam.
