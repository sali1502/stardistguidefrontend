# Guide för webbtillgänglighet - Stardist

## Översikt
Det här är en Single-Page-Application (SPA) byggd med Vue.js och Bootstrap som fungerar som ett innehållshanteringssystem (CMS) för webbutvecklingsprocesser med fokus på webbtillgänglighet.<br>

*Detaljerad dokumentation och arkitekturbeskrivning finns i separat rapport.*<br>

## Krav
* Node.js 18.0 eller senare<br>
* npm för pakethantering<br>

## Teknisk arkitektur
* **Frontend:** Vue.js 3.5 med Bootstrap 5.3<br>
* **Routing:** Vue Router 4.5<br>
* **State management:** Pinia 3.0<br>
* **HTTP-klient:** Axios för API-anrop<br>
* **Ikoner:** Bootstrap Icons<br>
* **Build-verktyg:** Vite 6.2<br>
* **API-integration:** Konsumerar stardistguidebackend API<br>
* **Autentisering:** JWT-bearer tokens lagrade i localStorage<br>
* **Säkerhet:** Hashade lösenord<br>
* **Design:** Responsiv design med reaktiv data och two-way binding<br>

## Roller och behörigheter
**Admin**<br>
* Full CRUD-behörighet för användare, projekt, checklistpunkter och inlägg<br>
* Tillgång till alla vyer och funktioner<br>

**Designer, Utvecklare och Testare**<br>
* Rollspecifika dashboards<br>
* Projektval och checklisthantering<be>
* Läsning av rollspecifika inlägg<br>
* Markering av checklistpunkter för att indikera arbetsprogression<br>

## Funktioner
* **Progressionsvy:** Realtidsuppdatering av progressionsbarer som visar projektstatus och rollspecifik progression<br>
* **Rollbaserade checklistor:** Varje roll kan markera sina specifika arbetsuppgifter<br>
* **Dynamisk uppdatering:** Progressionsbarer uppdateras automatiskt när användare interagerar med checklistor<br>

## Deployment
* **Frontend:** Konfigurerad för Netlify<br>
* **Backend API:** Konfigurerad för Render<br>

**Instruktioner som kommer med Vue 3:**

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
