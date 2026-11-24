# Kotten och vågen

Statisk webbapp (åk 1–3, matematik): likhetstecknets betydelse. Två vågskålar visar en
likhet med ett tomrum; barnet pekar på den siffra som gör att båda sidor väger lika. Frågan
läses upp på svenska och svaret syns som nötter som faller i skålen. Tränar MA.1-3.2.1
(”Matematiska likheter och likhetstecknets betydelse”).

Inga beroenden, inga konton, ingen spårning utöver skolappar-kodsnutten.

- `public/` – hela appen (serveras av nginx i containern)
- `verify.mjs` – maskinell kontroll av uppgiftsgeneratorn (`node verify.mjs`)
- `kit.py` – ritar ikoner, favicon och og-bild
- `katalog.py` – lägger appen i skolappar-katalogen som pending

Kör lokalt: `cd public && python3 -m http.server 8093`