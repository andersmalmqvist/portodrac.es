# Roadmap — portodrac.es

Webmastern tar **en** post per körning, uppifrån i "Kan göras själv", och bockar av
i samma PR. Poster under "Väntar på beslut" kräver svar från Anders först.

## Väntar på beslut

- [x] Allt ligger i `main`, som är Netlify:s produktionsbranch.
- [ ] Vilket lösenord ska familjen ha? (sätts som `SITE_PASSWORD` i Netlify, aldrig i repot)
- [ ] Ska domänen `portodrac.es` kopplas till Netlify, och vem äger DNS:en?
- [x] **Bildgalleriet är avfärdat** (beslut 2026-10-24): Anders vill inte lägga foton på nätet,
      inte ens bakom lösenordet. Inga bilder publiceras; `site/img/` får vara tom.
- [ ] Vad ska sidan heta och innehålla? Familjemedlemmar, kalender, länkar? (Bilder är
      avfärdat — se ovan.)
- [ ] Ett delat lösenord nu, eller separata konton (Netlify Identity / Cloudflare Access)?

## Kan göras själv

- [ ] **Riktig startsida**: gör om hero + korten till sektioner som går att fylla på
      (kalender, länkar) i stället för platshållare.
- [ ] **Kalender utan backend**: `site/data/calendar.json` + rendering i `main.js`,
      med svenska/engelska datumformat. Fungerar statiskt, inget API.
- [x] **Bildgalleriet borttaget**: "Bilder"-kortet och `photos.*`-nycklarna är borta sedan
      Anders beslutat att inga foton publiceras. Lägg inte tillbaka något galleri.
- [x] **404-sida** på båda språken, med länk tillbaka (Netlify serverar `404.html` automatiskt).
- [ ] **Språkval i URL:en**: `?lang=en` finns, men överväg `/en/` så länkar går att dela.
- [ ] **Tillgänglighetsgenomgång**: fokusordning, kontrast, `prefers-reduced-motion`,
      skärmläsartest av språkväxlaren (den ska meddela byte, inte bara byta text).
- [ ] **Tydligare inloggningssida**: "kom ihåg mig", visa/dölj lösenord, och en rad om
      vem man kontaktar om lösenordet glömts.
- [ ] **Rate limiting** på `/.netlify/functions/login` (Netlify Security → Rate limiting)
      — dokumentera inställningen i README när den är på.
- [ ] **`site/icons/`**: favicon + apple-touch-icon så fliken inte är tom.
- [ ] **Utloggning**: liten länk som rensar cookien (`/logga-ut` → `Set-Cookie: Max-Age=0`).
- [x] **Egen kontroll av live-sajten**: `python scripts/test_live.py` verifierar att `/` ger 302
      till `/login` och att inloggning fungerar. Körd mot https://portodrac.netlify.app — 11 gröna.
      Kvar: samma koll när portodrac.es är kopplad.

## Tekniska skulder

- [ ] `scripts/serve.py` och Netlify-funktionen har var sin implementation av samma
      HMAC — överväg att generera båda från en gemensam spec, eller dokumentera varför inte.
- [ ] Ingen CI: överväg GitHub Actions som kör `check_site.py` + `test_auth.mjs` på varje PR.
- [ ] `netlify.toml` saknar `[[headers]]` för `site/js/*`-cachning (medvetet: no-store är säkrare).
