# portodrac.es

Privat webbsida för familjen. Två språk: **svenska** (standard) och **engelska**.
Skyddad med **ett delat lösenord** via en Netlify Edge Function.

Ingen byggprocess, inga beroenden — HTML, CSS och lite JavaScript.

## Struktur

```
site/                        allt som publiceras
  index.html                 sidans innehåll
  login.html                 inloggningssidan (egen, självständig)
  css/style.css              formgivning, inkl. mörkt läge
  js/i18n.js                 all text på båda språken
  js/main.js                 språkväxling (SV/EN), sparas i localStorage
  _redirects                 /login -> login.html
  robots.txt                 hindrar sökmotorer från att indexera

netlify/functions/login.js           tar emot lösenordet, sätter cookie
netlify/edge-functions/gate.js       grinden framför varje sida
netlify.toml                         publicerar site/, inte koden
```

`netlify/` publiceras aldrig — `publish = "site"` i `netlify.toml` ser till det.

## Hur inloggningen fungerar

1. Alla requests går först genom `gate.js` (edge function, körs före de statiska filerna).
2. Saknas en giltig cookie `pd_session` → redirect till `/login`.
3. `/login` visar `login.html`, som postar lösenordet till `/.netlify/functions/login`.
4. Stämmer lösenordet mot env-variabeln `SITE_PASSWORD` sätts cookien:
   `HMAC-SHA256(lösenord, "portodrac-session-v1")`, `HttpOnly`, `Secure`, `SameSite=Lax`, 30 dagar.
5. Grinden räknar fram samma token och jämför. Lösenordet finns aldrig i koden,
   i cookien eller i de publicerade filerna.

Bieffekt: **byts lösenordet loggas alla ut** — den gamla cookien slutar gälla.

## Ändra text

1. Öppna `site/js/i18n.js` och ändra strängen för rätt nyckel — **båda** språken.
2. Ny text på sidan? Lägg till `data-i18n="mitt.nyckelnamn"` i `site/index.html`
   och samma nyckel i `sv` och `en`.

Nycklarna `page.title` och `page.description` styr flikens titel och beskrivningen.

## Bilder

Bilderna ligger i `site/img/` (mappen finns, tom så länge). Säg till nanobot vilka filer
som hör ihop — t.ex. "dessa tre är från Gotland" — så byggs galleriet och alt-texterna
skrivs på båda språken.

- Filnamn: gemener och bindestreck, inga å/ä/ö eller mellanslag (`sommar-2026-01.jpg`)
- Max ~1600 px på längsta sidan räcker, då laddar sidan snabbt
- En bild per motiv — kollage blir svåra att beskriva

## Förhandsgranska lokalt

```
python scripts\serve.py
```

Öppna <http://localhost:8765>. `?lang=en` tvingar engelska.

Testa inloggningen lokalt (samma cookie och samma algoritm som på Netlify):

```
$env:SITE_PASSWORD="testlosen"; python scripts\serve.py
```

## Kontroller innan commit

```
python scripts\check_site.py     # texter, filer och Netlify-konfigurationen
node scripts\test_auth.mjs       # inloggning + grind, 25 tester
python scripts\check_login_ui.py # inloggningssidan i headless-webbläsare, 13 kontroller
```

`check_login_ui.py` öppnar sidan i Edge/Chrome utan fönster och kollar visa/dölj-knappen,
felläget (`?fel=1`) och att sidan inte får horisontell scroll i mobilbredd.

`check_site.py` klagar om `COOKIE_NAME` eller `TOKEN_MESSAGE` skiljer sig mellan
`login.js` och `gate.js`, eller om grinden slutat undanta inloggningssidans adresser.

## Publicera på Netlify

1. Pusha repot till GitHub (branchen `feature/first-page` eller `main`).
2. Netlify → **Add new project** → **Import an existing project** → GitHub → välj `portodrac.es`.
3. Build command: **lämna tomt**. Publish directory: **`site`** (står redan i `netlify.toml`).
4. **Project configuration → Environment variables → Add a variable**
   - Key: `SITE_PASSWORD`
   - Value: lösenordet ni vill ha
   - Scopes: **Functions** (måste vara med, annars når grinden inte värdet)
5. Deploya. Miljövariabler slår igenom först vid **ny deploy** — ändrar ni lösenordet, deploya om.
6. Koppla domänen `portodrac.es` under **Domain management**.

## Vad skyddet inte gör

- **Ett gemensamt lösenord** — ingen vet vem som är inloggad, och alla måste byta samtidigt.
  Vill ni separata konton krävs Netlify Identity/Auth0 eller Cloudflare Access.
- **Ingen spärr mot upprepade försök.** Vill ni ha det: Netlify → Security → Rate limiting.
- **Cookien gäller i 30 dagar** och kan inte återkallas per person — bara genom att byta lösenord.
- Repot är publikt: koden är läsbar, men lösenordet ligger bara i Netlifys miljövariabler.

## Nästa steg

- [ ] Riktigt innehåll (namn, kalender, bilder)
- [ ] Koppla domänen portodrac.es
- [ ] Bestämma om vi vill ha separata konton i stället för ett delat lösenord

## Webmaster

`ROADMAP.md` är backloggen. Webmastern (skill: `skills/webmaster/SKILL.md`) tar en post
per körning, kör kontrollerna och öppnar en PR mot `main` — den mergar aldrig själv.

Allt arbete sker i `main`; webmastern gör sina ändringar på `webmaster/<kort-namn>`
och lämnar dem som PR för granskning.

```
python scripts\webmaster_status.py     # branch, kontroller, nästa poster
```
