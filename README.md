# Psywilizacja — prototyp

Grywalny prototyp gry planszowej **Psywilizacja** („Po Ciszy: Watahy Nowego Świata") —
psia cywilizacja rozwijająca się przez zmysły w świecie po zniknięciu ludzi.

Prototyp cyfrowy służy do testowania zasad i balansu; docelowo gra ma być fizyczną planszówką.

## Zagraj

Wersja live (GitHub Pages): **https://twentyonelab.github.io/psywilizacja/**

## Co jest w prototypie

- Modułowa plansza heksowa (start w stylu HoMM3: wspólny biom w centrum, watahy na obrysie)
- Tura na punktach akcji + kostka rozstrzygnięć (0·0·1·1·2·2)
- Eksploracja „węchem", zdobywanie Tropów, gradient świata (dalej = groźniej)
- Drzewo zmysłów (5 gałęzi × 4 szczeble) + statystyki i trening zabawkami
- Wilki (czarne / białe / szaro-stalowe) + faza wilków i walka
- Prosta AI przeciwników, 5 ścieżek zwycięstwa

## Technologia

React + TypeScript + Vite, Zustand, Framer Motion. Grafika wektorowa (SVG).

```bash
npm install
npm run dev      # serwer deweloperski
npm run build    # build produkcyjny do dist/
```

## Licencja / status

Projekt w rozwoju (wczesny prototyp). © 21 zmysłów.
