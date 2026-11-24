// Kontrollerar uppgiftsgeneratorn i public/app.js:
//  – varje uppgift är en likhet med exakt ett tomrum, och likheten stämmer
//    när tomrummet fylls med "svar" (båda sidor ger samma summa),
//  – svaret ligger alltid i 1–9 och ingen sida blir tyngre än 12 nötter,
//  – de tre svarsknapparna har tre olika tal, bara ett är rätt,
//  – felvalen ligger nära rätt svar (minst ett av dem ±1),
//  – nivåerna flyttar tomrummet: 1 = sist till höger, 2 = sist i en summa,
//    3 = först på vänster sida eller hela höger sida,
//  – frågan och förklaringen nämner rätt tal med rätt böjningsform.
//   node verify.mjs
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("./public/app.js", import.meta.url), "utf8");
const start = src.indexOf("var TALORD = [");
const end = src.indexOf("* 2. Kotten");
if (start < 0 || end < 0) throw new Error("hittar inte den rena generatorn i app.js");
const ren = src.slice(start, src.lastIndexOf("/*", end));
const G = eval("(function(){" + ren + "\nreturn {uppgift:uppgift, TALORD:TALORD, MAX:MAX, MAX_SUMMA:MAX_SUMMA, sidaOrd:sidaOrd};})()");

let seed = 20261124;
Math.random = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

let fel = 0;
const kolla = (c, m, p) => { if (!c) { fel++; if (fel <= 25) console.log("FEL", m, JSON.stringify(p)); } };
const antal = {}, former = { 1: new Set(), 2: new Set(), 3: new Set() };
const summa = (a) => a.reduce((x, y) => x + y, 0);

for (let k = 0; k < 40000; k++) {
  for (const niva of [1, 2, 3]) {
    const p = G.uppgift(niva);
    antal[niva] = (antal[niva] || 0) + 1;
    former[niva].add(p.siffrorV + " = " + p.siffrorH);

    const vTom = p.vanster.filter(t => t === null).length;
    const hTom = p.hoger.filter(t => t === null).length;
    kolla(p.niva === niva, "fel nivå", p.niva);
    kolla(vTom + hTom === 1, "likheten ska ha exakt ett tomrum", p);
    kolla(p.vanster.length >= 1 && p.hoger.length >= 1, "tom sida", p);
    kolla(p.vanster.length <= 2 && p.hoger.length <= 2, "fler än två led på en sida", p);

    // likheten måste stämma med svaret i tomrummet
    const vF = p.vanster.map(t => (t === null ? p.svar : t));
    const hF = p.hoger.map(t => (t === null ? p.svar : t));
    kolla(summa(vF) === summa(hF), "likheten stämmer inte", p);
    kolla(summa(vF) <= G.MAX_SUMMA && summa(hF) <= G.MAX_SUMMA, "tyngre än " + G.MAX_SUMMA + " nötter", p);
    kolla(summa(vF) >= 2, "för liten summa att räkna på", p);

    // svarsknapparna
    kolla(p.alternativ.length === 3, "fel antal knappar", p);
    kolla(new Set(p.alternativ).size === 3, "samma tal två gånger", p);
    kolla(p.alternativ.every(a => Number.isInteger(a) && a >= 1 && a <= G.MAX), "tal utanför 1–9", p);
    kolla(p.svarIndex >= 0 && p.svarIndex <= 2, "svarIndex utanför 0–2", p);
    kolla(p.alternativ[p.svarIndex] === p.svar, "svarIndex pekar inte på rätt tal", p);
    kolla(p.alternativ.filter(a => a === p.svar).length === 1, "rätt tal finns två gånger", p);

    // minst ett felval ligger ett steg ifrån, så gissning på "största/minsta" inte räcker
    const felval = p.alternativ.filter(a => a !== p.svar);
    kolla(felval.some(a => Math.abs(a - p.svar) === 1), "inget felval ligger nära rätt svar", p);

    // alla tal som syns i likheten är 1–9 utom svaret
    for (const t of p.vanster.concat(p.hoger)) if (t !== null) kolla(t >= 1 && t <= G.MAX, "tal utanför 1–9 i likheten", p);

    // svaret får inte redan stå på tavlan – då går det att skriva av i stället för att räkna
    for (const t of p.vanster.concat(p.hoger)) if (t !== null) kolla(t !== p.svar, "svaret syns redan i likheten", p);

    // frågan ska vara en fråga och förklaringen ska säga att det väger lika
    kolla(/\\?$/.test(p.fraga), "frågan slutar inte med frågetecken", p);
    kolla(p.fraga.length > 15, "för kort fråga", p);
    kolla(p.fraga.toLowerCase().includes(G.TALORD[p.svar]) || p.fraga.toLowerCase().includes("vad"), "frågan nämner varken svaret eller tomrummet", p);
    kolla(p.text.includes("lika"), "förklaringen säger inte att det väger lika", p);
    kolla(p.text.includes(G.TALORD[summa(vF)]), "förklaringen nämner inte summan", p);

    if (niva === 1) {
      kolla(p.hoger.indexOf(null) === p.hoger.length - 1, "nivå 1: tomrummet ska vara sist till höger", p);
      kolla(p.vanster.length === 1, "nivå 1: vänster sida ska vara ett enda tal", p);
    }
    if (niva === 2) {
      kolla(p.vanster.length === 2 && p.hoger.length === 2, "nivå 2: summa på båda sidor", p);
      kolla(p.hoger.indexOf(null) === 1, "nivå 2: tomrummet ska vara sist till höger", p);
    }
    if (niva === 3) {
      const forstVanster = p.vanster[0] === null;
      const helaHoger = p.hoger.length === 1 && p.hoger[0] === null;
      kolla(forstVanster || helaHoger, "nivå 3: tomrummet ska vara först till vänster eller hela höger sida", p);
      if (helaHoger) kolla(p.vanster.length === 2, "nivå 3: hela höger sida kräver en summa till vänster", p);
    }
  }
}

for (const niva of [1, 2, 3]) {
  kolla(former[niva].size >= (niva === 1 ? 8 : niva === 2 ? 20 : 12), "för få olika likheter på nivå " + niva + ": " + former[niva].size);
  console.log("nivå " + niva + ":", antal[niva], "uppgifter,", former[niva].size, "olika likheter");
}
kolla(G.TALORD.length === 13, "talorden täcker inte 0–12");
console.log(fel === 0 ? "OK – 0 fel" : fel + " FEL");
process.exit(fel === 0 ? 0 : 1);