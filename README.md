# portodrac.es

Privat webbsida för familjen. Två språk: **svenska** (standard) och **engelska**.

Ingen byggprocess, inga beroenden — bara HTML, CSS och lite JavaScript.

## Struktur

```
index.html        sidans innehåll (rubriker, sektioner, textnycklar)
css/style.css     all formgivning, inkl. mörkt läge
js/i18n.js        all text på båda språken
js/main.js        språkväxling (SV/EN), sparas i localStorage
robots.txt        hindrar sökmotorer från att indexera sidan
```

## Ändra text

1. Öppna `js/i18n.js` och ändra strängen för rätt nyckel — **båda** språken.
2. Ny text på sidan? Lägg till `data-i18n="mitt.nyckelnamn"` i `index.html`
   och samma nyckel i `sv` och `en` i `js/i18n.js`.

Nycklar som `page.title` och `page.description` styr flikens titel och beskrivningen.

## Förhandsgranska lokalt

```
python scripts\serve.py
```

Öppna <http://localhost:8765>. Lägg till `?lang=en` i adressen för att tvinga engelska.

## Kontrollera innan commit

```
python scripts\check_site.py
```

Kontrollerar att varje textnyckel finns i båda språken, att filerna som `index.html`
pekar på existerar, och att `noindex` finns kvar.

## Integritet

Sidan är tänkt att bara familjen ska nå. Tänk på att:

- `noindex` + `robots.txt` bara hindrar sökmotorer — **inte** någon som har länken.
- GitHub Pages på ett publikt repo gör både källkod och sida läsbar för alla.
- Vill vi ha riktigt skydd krävs inloggning framför sidan (t.ex. Cloudflare Access
  eller Netlify med lösenord) — det är ett separat steg.

## Nästa steg

- [ ] Riktigt innehåll (namn, kalender, bilder)
- [ ] Besluta om skydd/inloggning
- [ ] Välj publicering (GitHub Pages, Cloudflare Pages, Netlify …)
