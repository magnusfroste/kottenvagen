# KONCEPT – Kotten och vågen

**Mål (en sak):** barnet ska förstå att likhetstecknet betyder *lika mycket på båda
sidor* – inte "nu kommer svaret" – och kunna fylla i det tal som fattas i en likhet.

**Målgrupp:** FK–2 (innehållet hör till åk 1–3 matematik). Spelbart utan att kunna läsa.

**Kärnmekanik (touch först):** en balansvåg med två skålar. Upp till vågen står samma
likhet med siffror, t.ex. `4 + 4 = 2 + ?`. På vänster skål ligger nötterna som hör till
vänster sida, på höger skål de som redan finns där, och under höger skål en streckad
guldruta med `?`. Vågen tippar åt den tyngre sidan redan innan barnet svarar, så barnet
ser vilken sida som väger för lite. Tre stora sifferknappar (med lika många prickar under
siffran) står längst ned; barnet pekar på en. Nötterna faller i skålen, vågen svänger och
stannar bara i våg när likheten stämmer. Rätt svar: bommen står rakt, rutan fylls med
talet, Kotten firar och säger hela likheten ("fyra plus fyra är lika med två plus sex.
Båda sidor är åtta. Nu väger det lika!"). Fel svar: vågen tippar synligt, Kotten funderar,
en röst säger "för många nötter, prova igen" och nötterna plockas tillbaka – ingen förlust.

**5-minuterssession:** åtta uppgifter per runda, ungefär 3–5 minuter. "En runda till"-knapp.

**Belöning barnet kan berätta om:** stjärnor, "8 av 8 rätt" – och att det kan säga att
"nio är lika med fyra plus fem, båda sidor är nio".

**Vad barnet lär:** likhetstecknets betydelse och sambandet mellan addition och subtraktion.
Nivå 1: `9 = 4 + ?` (hela antalet på ena sidan). Nivå 2: `4 + 3 = 2 + ?` (summa på båda
sidor). Nivå 3: tomrummet flyttar till första platsen `? + 2 = 8`, och ibland är hela höger
sida tom `3 + 2 = ?`.

**Lgr22:** MA.1-3.2.1 – "Matematiska likheter och likhetstecknets betydelse." (ordagrant ur
Skolverkets syllabus-API, hämtad 2026-11-23)

**Varför det funkar på iPad:** en våg, tre sifferknappar, inget att läsa i spelytan. Frågan
läses upp på svenska. I liggande läge är nötterna 12 px i radie och knapparna 160 × 100 px;
i stående läge byter vågen layout, nötterna blir 18 px så att de går att räkna även på en
telefon (9 px på 390 × 844) och knapparna är 96 × 84 px. 0 px scroll i alla fyra storlekar.

## Testplan (mätbara krav)

1. `node verify.mjs`: 120 000 uppgifter, 0 fel. Likheten stämmer när tomrummet fylls,
   exakt ett tomrum, svaret 1–9, ingen sida tyngre än 12 nötter, tre olika sifferknappar
   med bara ett rätt svar, minst ett felval ±1, och **svaret får aldrig redan stå på
   tavlan** (annars går det att skriva av i stället för att räkna).
2. 0 px scroll (båda axlarna) i 1024×768, 768×1024, 390×844 och 1440×900, mätt **efter**
   att startskärmen är borta.
3. En hel runda spelas med pekdon (`Input.dispatchTouchEvent`): 8/8, stjärnor, prickar,
   resultatruta som är ogenomskinlig och ligger över HUD:en.
4. Två fel i rad → rätt knapp lyser, rutan fylls, uppgiften går vidare.
5. Vågen visar rätt tippning: den tyngre sidan hänger lägre, och vid rätt svar står
   bommen vågrät (mätt som `vinkel === 0` i den exponerade state:n).
6. Ingen inloggning, inga länkar ut, ingen reklam, ingen tredjeparts-CDN förutom kotten.js.
7. Kortbilden är ett spelmoment 1200×900 (4:3) utan pålagd text.

## Validering före bygge

`delegate_task` finns inte i den här sessionen (inga subagent-verktyg), så den hårda
go/no-go:n gjordes som en skriftlig egenkontroll mot de tre frågorna:

- **Skulle ett barn spela det frivilligt i 5 minuter?** Ja – vågen rör sig av sig själv när
  nötterna faller i, och det är den rörelsen som är belöningen. Tre val, talad fråga, åtta
  uppgifter. Risken är att det blir "räkna ut för hand med en bild ovanpå"; därför tippar
  vågen även på fel svar, så barnet får en andra chans med information i stället för ett
  "fel".
- **Träffar det ett verkligt kunskapskrav?** Ja – MA.1-3.2.1 är ordagrant citerat. Det är
  dessutom ett av de mest undersökta missförstånden i åk 1–3: barn som läst `3 + 4 = 7`
  tror att `=` betyder "ger". I katalogen (56 rader, admin-ytan) fanns ingen app länkad
  till MA.1-3.2.1 – `Mathsnake`, `Tiokamrater` och `MatteMästaren` ligger på 1.1/1.6/1.7.
- **Teknisk risk:** låg. Ren SVG, ingen fysikmotor (vinkeln räknas ur skillnaden mellan
  sidorna), generatorn verifieras headless, inga bildfiler, ingen tidspress.

**Iterationer efter test:** (a) skålamas sifferetiketter togs bort – de upprepade likheten
och gav tre ställen att läsa; kvar är likheten överst och en guldkantad ruta under den skål
som saknar nötter. (b) Första versionen kunde ge `4 + 3 = 4 + ?` och `2 + 4 = 3 + ?`, där
svaret gick att skriva av – nu förbjuder generatorn att svaret redan syns, och verify.mjs
kontrollerar det. (c) Stående läge fick egen layout (620 × 860, större nötter), eftersom
nötterna på en telefon annars bara var 4,8 px i radie och omöjliga att räkna.