# Document Studio

Offline Windows-desktopapplicatie voor offertes, facturen en administratie van ALKA Visuals en Technisch Bouwadvies.

## Ontwikkelen

1. Installeer Node.js 20+ en de Rust-toolchain via https://rustup.rs.
2. Installeer Microsoft C++ Build Tools met de workload **Desktop development with C++**.
3. Open PowerShell in deze map en voer `npm install` uit.
4. Start de desktopapp met `npm run tauri dev`.

Alle applicatiegegevens staan lokaal in SQLite in de Windows AppData-map van de gebruiker. De app maakt bij iedere wijziging maximaal 25 interne herstelpunten. Via Instellingen kan een draagbare JSON-back-up worden gemaakt of hersteld.

## Windows-installer bouwen

Voer `npm run tauri build` uit. De NSIS-installer verschijnt onder `src-tauri/target/release/bundle/nsis/`.

## Browsermodus voor ontwikkeling

`npm run dev` start een lokale ontwikkelversie. Deze gebruikt alleen voor de browserpreview `localStorage`; de geïnstalleerde Tauri-app gebruikt SQLite.

## Belangrijke werkwijze

- Een documentnummer wordt pas bij **Definitief uitgeven** vastgelegd.
- Conceptpreview en conceptopslag reserveren geen nummer.
- Een uitgegeven PDF wordt als historische snapshot bij het document bewaard.
- Geïmporteerde Excelregels krijgen bron **Excel-import** en worden niet stilzwijgend gewijzigd.
- Een nieuwe openstaande app-factuur staat in Vooradministratie. Na **Betaald** verschijnt hij bij Facturen; het databaserecord wordt niet verwijderd.
