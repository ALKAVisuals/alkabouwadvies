# Aleks Developer Branch — Werkafspraken

Deze branch (`aleks-developer`) is uitsluitend bedoeld als ontwikkel- en testomgeving voor wijzigingen aan de website van Technisch Bouwadvies.

## Belangrijkste regel

**Wijzigingen mogen NOOIT zonder expliciete goedkeuring van Karam naar `main` of naar de live website worden gebracht.**

## Wat wel mag

- Werken aan de website in de branch `aleks-developer`.
- Bestanden aanpassen, toevoegen en verwijderen binnen deze branch.
- Commits maken en pushen naar `aleks-developer`.
- De website lokaal draaien en testen.
- Een Pull Request voorbereiden van `aleks-developer` naar `main` zodat de wijzigingen gezamenlijk beoordeeld kunnen worden.

## Wat niet mag zonder expliciete goedkeuring van Karam

- Rechtstreeks pushen naar `main`.
- Zelf een Pull Request mergen naar `main`.
- Wijzigingen op enige andere manier in `main` plaatsen.
- Een productie-deploy uitvoeren.
- Netlify of een andere productieomgeving handmatig laten deployen.
- De live website technischbouwadvies.nl wijzigen.
- Productie-instellingen, domeininstellingen, betaalinstellingen, formulierkoppelingen of andere live integraties aanpassen.

## Goedkeuringsproces

1. Aleks voert alle werkzaamheden uit in `aleks-developer`.
2. Aleks test de wijzigingen lokaal.
3. Wanneer de wijziging klaar is, wordt deze ter beoordeling aangeboden.
4. Karam controleert en geeft expliciet akkoord.
5. **Pas na dit akkoord** mag de wijziging naar `main` worden gemerged.
6. Pas daarna mag de productieversie / Netlify de nieuwe versie ontvangen.

## Bij twijfel

Als niet duidelijk is of een handeling invloed kan hebben op `main`, Netlify, productiegegevens of de live website: **niet uitvoeren en eerst goedkeuring vragen aan Karam.**

Deze afspraken gelden voor alle wijzigingen in deze branch totdat Karam ze expliciet wijzigt.
