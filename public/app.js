/* Kotten och vågen – likhetstecknets betydelse (MA.1-3.2.1).
   Statisk app, inga beroenden. En våg med två vågskålar: på ena sidan ligger
   nötter, på den andra ligger några nötter och en tom plats. Barnet pekar på
   den siffra som ska fylla platsen så att vågen väger jämnt – alltså så att
   likheten stämmer. Frågan läses upp på svenska, inget måste läsas.
   Allt ritas i kod: vågen, nötterna och Kotten i SVG, ljud i WebAudio.
   Uppgiftsgeneratorn är en ren funktion som verify.mjs kontrollerar. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 1. Ren uppgiftsgenerator                                            *
   *    En uppgift är en likhet med exakt ett tomrum. Nivåerna flyttar     *
   *    tomrummet: först sist på höger sida, sedan mitt i en summa, sedan  *
   *    först på vänster sida. Svaret är alltid 1–9.                       *
   * ------------------------------------------------------------------ */
  var TALORD = ["noll", "ett", "två", "tre", "fyra", "fem", "sex",
    "sju", "åtta", "nio", "tio", "elva", "tolv"];

  var MAX = 9;          /* fler nötter än nio går inte att räkna på en skärm */
  var MAX_SUMMA = 12;   /* och ingen sida får bli tyngre än tolv nötter */

  function heltal(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  function blanda(a) {
    var i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* Två felval: det ena ligger alltid ett steg ifrån rätt svar (aldrig samma
     tal, aldrig utanför 1–9), det andra två steg ifrån eller på andra sidan.
     Då räcker det inte att gissa på "största" eller "minsta" talet. */
  function felval(ratt) {
    var ett = Math.random() < 0.5 ? ratt - 1 : ratt + 1;
    if (ett < 1 || ett > MAX) ett = ratt === 1 ? ratt + 1 : ratt - 1;
    var kandidater = blanda([ratt - 2, ratt + 2, ratt - 1, ratt + 1]);
    var tva = null;
    kandidater.forEach(function (v) {
      if (tva === null && v !== ratt && v !== ett && v >= 1 && v <= MAX) tva = v;
    });
    if (tva === null) {
      blanda([1, 2, 3, 4, 5, 6, 7, 8, 9]).forEach(function (v) {
        if (tva === null && v !== ratt && v !== ett) tva = v;
      });
    }
    return [ett, tva];
  }

  /* Skriver en sida av likheten som talord: [3, null] -> "tre plus vad då" */
  function sidaOrd(terms) {
    return terms.map(function (t) {
      return t === null ? "vad då" : TALORD[t];
    }).join(" plus ");
  }
  function sidaSiffror(terms) {
    return terms.map(function (t) { return t === null ? "?" : String(t); }).join(" + ");
  }

  /* Frågan: tomrummets plats avgör hur den sägs. */
  function fragaFor(v, h) {
    var hSaknas = h.indexOf(null) >= 0;
    if (v[0] === null) {
      return "Vad plus " + TALORD[v[1]] + " är lika med " + TALORD[h[0]] + "?";
    }
    if (hSaknas && h.length === 1) {
      return sidaOrd(v) + " är lika med vad då?";
    }
    /* tomrummet sist på höger sida – en eller två kända nötter framför */
    return sidaOrd(v) + " är lika med " + TALORD[h[0]] + " plus vad då?";
  }

  /* Förklaringen som sägs när svaret är rätt – hela likheten uttalad. */
  function textFor(v, h, svar) {
    var vfylld = v.map(function (t) { return t === null ? svar : t; });
    var hfylld = h.map(function (t) { return t === null ? svar : t; });
    var summaV = vfylld.reduce(function (a, b) { return a + b; }, 0);
    return sidaOrd(vfylld) + " är lika med " + sidaOrd(hfylld) +
      ". Båda sidor är " + TALORD[summaV] + ". Nu väger det lika!";
  }

  /* Nivå 1: a = b + ?   Nivå 2: a + b = c + ?   Nivå 3: ? + b = a, och a + b = ? */
  function uppgift(niva) {
    niva = niva === 2 || niva === 3 ? niva : 1;
    var v, h, svar, försök = 0;

    do {
      försök++;
      if (niva === 1) {
        var b = heltal(1, 4);
        do { svar = heltal(1, MAX - b); } while (svar === b);
        v = [b + svar];           /* vänster sida: hela antalet */
        h = [b, null];
      } else if (niva === 2) {
        /* c får inte vara samma tal som a eller b: då vore uppgiften "skriv av
           talet på andra sidan" i stället för att räkna ut skillnaden. */
        var a = heltal(1, 4), b2 = heltal(1, 4);
        var c;
        do { c = heltal(1, 4); } while (c === a || c === b2 || a + b2 - c === c);
        svar = a + b2 - c;
        v = [a, b2];
        h = [c, null];
      } else {
        if (Math.random() < 0.5) {
          var b3 = heltal(1, 4);
          do { svar = heltal(1, MAX - b3); } while (svar === b3);
          v = [null, b3];
          h = [b3 + svar];
        } else {
          var a3 = heltal(1, 5), b4 = heltal(1, 4);
          svar = a3 + b4;
          v = [a3, b4];
          h = [null];
        }
      }
    } while (försök < 200 && (svar < 1 || svar > MAX ||
      v.filter(function (t) { return t !== null; }).reduce(function (x, y) { return x + y; }, 0) + (v.indexOf(null) >= 0 ? svar : 0) > MAX_SUMMA ||
      h.filter(function (t) { return t !== null; }).reduce(function (x, y) { return x + y; }, 0) + (h.indexOf(null) >= 0 ? svar : 0) > MAX_SUMMA ||
      h.length === 1 && v.length === 1));

    var alt = blanda([svar].concat(felval(svar)));
    return {
      niva: niva,
      vanster: v,
      hoger: h,
      svar: svar,
      fraga: fragaFor(v, h),
      text: textFor(v, h, svar),
      siffrorV: sidaSiffror(v),
      siffrorH: sidaSiffror(h),
      alternativ: alt,
      svarIndex: alt.indexOf(svar),
      /* antal kända nötter per sida – det som ligger på vågen innan svaret */
      kandV: v.filter(function (t) { return t !== null; }),
      kandH: h.filter(function (t) { return t !== null; })
    };
  }

  function summa(lista) { return lista.reduce(function (a, b) { return a + b; }, 0); }

  /* ------------------------------------------------------------------ *
   * 2. Kotten (egen SVG-figur, fem uttryck – samma som i familjen)       *
   * ------------------------------------------------------------------ */
  function kottenSvg(uttryck, klass) {
    var F = "#b07d4b", M = "#8a5f36", O = "#2b2118", mun, ogen = "", extra = "";
    if (uttryck === "hejar") { mun = '<path d="M22 36 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else if (uttryck === "firar") {
      mun = '<path d="M21 34 q9 12 18 0" fill="#fff"/><path d="M21 34 q9 12 18 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>';
      extra = '<path d="M10 12 l3 6M50 12 l-3 6M30 6 v5" stroke="#e8a33d" stroke-width="2.2" stroke-linecap="round" fill="none"/>';
    }
    else if (uttryck === "tanker") { mun = '<path d="M24 37 h11" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round" fill="none"/>'; ogen = '<circle cx="46" cy="24" r="4" fill="none" stroke="' + M + '" stroke-width="1.6" opacity=".5"/>'; }
    else if (uttryck === "funderar") { mun = '<path d="M22 38 q8 -6 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    else { mun = '<path d="M22 34 q8 8 16 0" fill="none" stroke="' + O + '" stroke-width="2.4" stroke-linecap="round"/>'; }
    var oga = '<circle cx="23" cy="24" r="5.2" fill="#fff"/><circle cx="37" cy="24" r="5.2" fill="#fff"/>' +
      '<circle cx="24" cy="24.6" r="2.5" fill="' + O + '"/><circle cx="36" cy="24.6" r="2.5" fill="' + O + '"/>';
    return '<svg class="' + (klass || "kotten-svg") + '" viewBox="0 0 60 60" aria-hidden="true">' + extra +
      '<path d="M30 6 q9 4 12 12 q9 12 4 24 q-4 12 -16 14 q-12 -2 -16 -14 q-5 -12 4 -24 q3 -8 12 -12z" fill="' + F + '"/>' +
      '<path d="M19 20 q11 -5 22 0M16 30 q14 -5 28 0M16 40 q14 -4 28 0" stroke="' + M + '" stroke-width="1.7" fill="none" opacity=".85" stroke-linecap="round"/>' +
      oga + ogen + mun + '</svg>';
  }

  /* ------------------------------------------------------------------ *
   * 3. Ljud (WebAudio + talsyntes, skapas vid första gesten)             *
   * ------------------------------------------------------------------ */
  var ac = null, ljudPa = true;
  function ljud(frekvens, längd, typ) {
    if (!ljudPa) return;
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = typ || "sine"; o.frequency.value = frekvens;
      g.gain.value = 0.001; o.connect(g); g.connect(ac.destination);
      var t = ac.currentTime;
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + längd);
      o.start(t); o.stop(t + längd + 0.02);
    } catch (e) { }
  }
  function sag(text) {
    if (!ljudPa) return;
          try { if (window.__rost && window.__rost(text, true)) return; } catch (e) { }
        console.warn('saknar mp3:', text);
  }
  function spar(namn, värde) { try { if (window.skolappar && window.skolappar.event) window.skolappar.event(namn, värde); } catch (e) { } }

  function minskaRorelse() {
    try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
  }

  /* ------------------------------------------------------------------ *
   * 4. Nötter och vågskål, ritade i kod                                  *
   * ------------------------------------------------------------------ */
  var FÄRG = { skal: "#c98a4b", skalMörk: "#a86f36", mössa: "#6b4a24", kant: "#7c5327" };

  function nötRit(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + FÄRG.skal + '" stroke="' + FÄRG.kant + '" stroke-width="' + (r * 0.16) + '"/>' +
      '<path d="M' + (cx - r * 0.55) + ',' + (cy - r * 0.6) + ' q' + (r * 0.55) + ',-' + (r * 0.5) + ' ' + (r * 1.1) + ',0" fill="none" stroke="' + FÄRG.skalMörk + '" stroke-width="' + (r * 0.22) + '" stroke-linecap="round" opacity=".8"/>' +
      '<path d="M' + (cx - r * 0.34) + ',' + (cy - r * 1.02) + ' q' + (r * 0.34) + ',-' + (r * 0.42) + ' ' + (r * 0.68) + ',0" fill="' + FÄRG.mössa + '"/>' +
      '<path d="M' + cx + ',' + (cy - r * 1.4) + ' l' + (r * 0.2) + ',' + (r * 0.34) + '" stroke="' + FÄRG.mössa + '" stroke-width="' + (r * 0.22) + '" stroke-linecap="round"/>';
  }

  /* Nötterna ligger i skålen: högst "per" på en rad, resten på nästa. */
  function nötterRit(cx, basY, n, r, per) {
    var h = "", i, j, w, radY;
    if (n <= 0) return h;
    per = per || 5;
    var rader = Math.ceil(n / per);
    var kvar = n;
    for (i = 0; i < rader; i++) {
      w = Math.min(per, kvar);
      kvar -= w;
      radY = basY - (rader - 1 - i) * (r * 2.2);
      for (j = 0; j < w; j++) {
        h += nötRit(cx + (j - (w - 1) / 2) * (r * 2.15), radY, r);
      }
    }
    return h;
  }

  /* ------------------------------------------------------------------ *
   * 5. Ritningen                                                        *
   *    Två layouter: en bred (iPad liggande, dator) och en smal (telefon,  *
   *    iPad stående) där vågen får plats på höjden och nötterna blir       *
   *    större, så att de går att räkna på en liten skärm.                  *
   * ------------------------------------------------------------------ */
  function layoutFor(el) {
    var r = el.getBoundingClientRect();
    if (r.width && r.height && r.width < r.height * 1.05) {
      return {
        vb: [620, 860], pivot: { x: 310, y: 352 }, arm: 232, chain: 108,
        nut: 15, per: 4, pan: 150, bas: 800, eqY: 108, bom: 12
      };
    }
    return {
      vb: [900, 500], pivot: { x: 450, y: 236 }, arm: 300, chain: 76,
      nut: 11, per: 5, pan: 184, bas: 452, eqY: 96, bom: 12
    };
  }
  var L = layoutFor(document.body);

  var S = {
    skärm: "start", niva: 1, runda: 1, item: 0, svarRätt: 0, stjärnor: 0,
    felförsök: 0, p: null, klar: false, visaRätt: false, visatGrepp: false,
    placerat: null, vinkel: 0, målvinkel: 0
  };

  function målVinkel(p, placerat, visaAllt) {
    var v = summa(p.kandV) + (p.vanster.indexOf(null) >= 0 && placerat !== null ? placerat : 0);
    var h = summa(p.kandH) + (p.hoger.indexOf(null) >= 0 && placerat !== null ? placerat : 0);
    if (visaAllt) {
      v = summa(p.vanster.map(function (t) { return t === null ? p.svar : t; }));
      h = summa(p.hoger.map(function (t) { return t === null ? p.svar : t; }));
    }
    var d = h - v;
    return Math.max(-10, Math.min(10, d * 3.2));
  }

  function ritaVågG(h, p, vinkel, visaAllt) {
    var rad = vinkel * Math.PI / 180;
    var vx = L.pivot.x - Math.cos(rad) * L.arm, vy = L.pivot.y - Math.sin(rad) * L.arm;
    var hx = L.pivot.x + Math.cos(rad) * L.arm, hy = L.pivot.y + Math.sin(rad) * L.arm;

    /* stativ */
    h.push('<rect x="' + (L.pivot.x - 9) + '" y="' + (L.pivot.y - 4) + '" width="18" height="' + (L.bas - L.pivot.y) + '" rx="9" fill="#d9c9b2"/>');
    h.push('<rect x="' + (L.pivot.x - 96) + '" y="' + (L.bas - 6) + '" width="192" height="18" rx="9" fill="#c9b69a"/>');
    h.push('<circle cx="' + L.pivot.x + '" cy="' + L.pivot.y + '" r="11" fill="var(--accent)"/>');

    /* bommen */
    h.push('<line x1="' + vx + '" y1="' + vy + '" x2="' + hx + '" y2="' + hy + '" stroke="var(--accent)" stroke-width="' + L.bom + '" stroke-linecap="round"/>');
    h.push('<circle cx="' + vx + '" cy="' + vy + '" r="8" fill="var(--accent-mörk)"/>');
    h.push('<circle cx="' + hx + '" cy="' + hy + '" r="8" fill="var(--accent-mörk)"/>');

    function skål(cx, cy, sida) {
      var ty = cy + L.chain;
      var o = [];
      var saknas = (sida === "v" ? p.vanster : p.hoger).indexOf(null) >= 0;
      var halv = L.pan / 2;
      /* kedjor */
      o.push('<line x1="' + (cx - halv + 18) + '" y1="' + ty + '" x2="' + cx + '" y2="' + cy + '" stroke="#b9a893" stroke-width="3"/>');
      o.push('<line x1="' + (cx + halv - 18) + '" y1="' + ty + '" x2="' + cx + '" y2="' + cy + '" stroke="#b9a893" stroke-width="3"/>');
      /* skålen */
      o.push('<rect x="' + (cx - halv) + '" y="' + (ty - 4) + '" width="' + L.pan + '" height="26" rx="13" fill="#efe4d4" stroke="#cdbba3" stroke-width="3"/>');
      /* den tomma platsen: en streckad ruta under skålen där svaret ska in,
         och samma ruta fylld med talet när svaret är rätt */
      if (saknas) {
        o.push('<rect class="' + (visaAllt ? "" : "tom-etikett ") + '" x="' + (cx - 27) + '" y="' + (ty + 32) + '" width="54" height="54" rx="14" fill="' +
          (visaAllt ? "#fdf4e6" : "#fff") + '" stroke="var(--stjärna)" stroke-width="3.5" ' +
          (visaAllt ? "" : 'stroke-dasharray="9 7"') + '/>');
        o.push('<text x="' + cx + '" y="' + (ty + 71) + '" text-anchor="middle" font-size="34" font-weight="800" fill="var(--stjärna)">' +
          (visaAllt ? p.svar : "?") + '</text>');
      }
      return o.join("");
    }

    var nV = summa(p.kandV) + (p.vanster.indexOf(null) >= 0 && S.placerat !== null ? S.placerat : 0);
    var nH = summa(p.kandH) + (p.hoger.indexOf(null) >= 0 && S.placerat !== null ? S.placerat : 0);
    if (visaAllt) {
      nV = summa(p.vanster.map(function (t) { return t === null ? p.svar : t; }));
      nH = summa(p.hoger.map(function (t) { return t === null ? p.svar : t; }));
    }

    /* vänster skål */
    h.push(skål(vx, vy, "v"));
    h.push(nötterRit(vx, vy + L.chain - L.nut * 1.6, Math.min(nV, MAX_SUMMA), L.nut, L.per));
    /* höger skål */
    h.push(skål(hx, hy, "h"));
    h.push(nötterRit(hx, hy + L.chain - L.nut * 1.6, Math.min(nH, MAX_SUMMA), L.nut, L.per));

    return h.join("");
  }

  function ekvationRit(h, p, visaAllt) {
    var tokens = [], i;
    for (i = 0; i < p.vanster.length; i++) {
      if (i) tokens.push({ t: "plus" });
      tokens.push(p.vanster[i] === null ? { t: "hal" } : { t: "tal", v: p.vanster[i] });
    }
    tokens.push({ t: "eq" });
    for (i = 0; i < p.hoger.length; i++) {
      if (i) tokens.push({ t: "plus" });
      tokens.push(p.hoger[i] === null ? { t: "hal" } : { t: "tal", v: p.hoger[i] });
    }
    var BREDD = { tal: 40, plus: 64, eq: 74, hal: 62 };
    var tot = tokens.reduce(function (a, t) { return a + BREDD[t.t]; }, 0);
    var x = (L.vb[0] - tot) / 2, y = L.eqY;
    var ut = [];
    ut.push('<rect x="' + (x - 26) + '" y="' + (y - 56) + '" width="' + (tot + 52) + '" height="76" rx="22" fill="#fff" stroke="var(--linje)" stroke-width="3"/>');
    tokens.forEach(function (t) {
      var w = BREDD[t.t], cx = x + w / 2;
      if (t.t === "tal") {
        ut.push('<text x="' + cx + '" y="' + (y + 14) + '" text-anchor="middle" font-size="48" font-weight="800" fill="var(--bläck)">' + t.v + '</text>');
      } else if (t.t === "plus") {
        ut.push('<text x="' + cx + '" y="' + (y + 12) + '" text-anchor="middle" font-size="42" font-weight="700" fill="var(--dämpad)">+</text>');
      } else if (t.t === "eq") {
        ut.push('<text x="' + cx + '" y="' + (y + 12) + '" text-anchor="middle" font-size="42" font-weight="700" fill="var(--accent-mörk)">=</text>');
      } else {
        ut.push('<rect class="hal-ruta" x="' + (cx - 24) + '" y="' + (y - 26) + '" width="48" height="48" rx="12" fill="' +
          (visaAllt ? "var(--accentsvag)" : "#fff") + '" stroke="' + (visaAllt ? "var(--accent)" : "var(--stjärna)") + '" stroke-width="3" ' +
          (visaAllt ? "" : 'stroke-dasharray="8 6"') + '/>');
        ut.push('<text x="' + cx + '" y="' + (y + 14) + '" text-anchor="middle" font-size="40" font-weight="800" fill="' +
          (visaAllt ? "var(--accent-mörk)" : "var(--stjärna)") + '">' + (visaAllt ? p.svar : "?") + '</text>');
      }
      x += w;
    });
    h.push(ut.join(""));
  }

  function ritaScen() {
    var p = S.p, el = document.getElementById("scen");
    if (!p) return;
    L = layoutFor(el);
    var h = [];
    var visaAllt = S.klar;
    h.push('<rect x="0" y="0" width="' + L.vb[0] + '" height="' + L.vb[1] + '" fill="var(--papper)"/>');
    ekvationRit(h, p, visaAllt);
    ritaVågG(h, p, S.vinkel, visaAllt);
    el.setAttribute("viewBox", "0 0 " + L.vb[0] + " " + L.vb[1]);
    el.innerHTML = h.join("");
    el.setAttribute("aria-label",
      "Våg med " + p.siffrorV.replace(/\?/g, "tom plats") + " på vänster sida och " +
      p.siffrorH.replace(/\?/g, "tom plats") + " på höger sida");
  }

  /* Mjuk gång mot målvinkeln. Hoppar direkt om användaren vill ha mindre rörelse. */
  var animId = null;
  function snurra() {
    if (animId) return;
    if (minskaRorelse()) { S.vinkel = S.målvinkel; ritaScen(); return; }
    function steg() {
      var d = S.målvinkel - S.vinkel;
      if (Math.abs(d) < 0.15) { S.vinkel = S.målvinkel; ritaScen(); animId = null; return; }
      S.vinkel += d * 0.22;
      ritaScen();
      animId = requestAnimationFrame(steg);
    }
    animId = requestAnimationFrame(steg);
  }

  function ritaPrickar() {
    var h = "", i;
    for (i = 0; i < RUNDA; i++) h += '<i class="' + (i < S.item ? "klar" : "") + '"></i>';
    document.getElementById("prickar").innerHTML = h;
  }
  function ritaStjärnor() {
    document.getElementById("stjarnor").textContent = "★".repeat(Math.min(S.stjärnor, 12)) + (S.stjärnor > 12 ? "+" : "");
  }
  function kottenByt(uttryck) {
    var el = document.getElementById("kotten");
    if (el) el.innerHTML = kottenSvg(uttryck, "kotten-svg");
  }

  /* ------------------------------------------------------------------ *
   * 6. Svarsknapparna (HTML – stora träffytor, egna aria-etiketter)      *
   * ------------------------------------------------------------------ */
  function ritaSvar() {
    var p = S.p, rad = document.getElementById("svarrad");
    var h = "";
    p.alternativ.forEach(function (tal, i) {
      var klass = "svar-knapp" + (S.klar && i === p.svarIndex ? " ratt" : "") +
        (S.visaRätt && i === p.svarIndex && !S.klar ? " ratt" : "");
      h += '<button class="' + klass + '" data-i="' + i + '" aria-label="svara ' + tal + '">' +
        '<span class="siffra">' + tal + '</span>' +
        '<span class="prickar-tal" aria-hidden="true">' +
        "●".repeat(tal) + '</span></button>';
    });
    rad.innerHTML = h;
    rad.classList.toggle("visa-grepp", !S.visatGrepp && !S.klar);
  }

  /* ------------------------------------------------------------------ *
   * 7. Spelflöde                                                        *
   * ------------------------------------------------------------------ */
  var RUNDA = 8;
  var idleTimer = null;
  function startIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (S.skärm === "spel" && !S.klar && S.felförsök === 0) {
        sag(S.p.fraga); spar("hint");
      }
    }, 12000);
  }

  function nyUppgift() {
    S.p = uppgift(S.niva);
    S.klar = false; S.felförsök = 0; S.visaRätt = false; S.placerat = null;
    S.målvinkel = målVinkel(S.p, null, false);
    ritaScen(); ritaPrickar(); ritaSvar();
    snurra();
    sag(S.p.fraga);
    startIdle();
  }

  function valj(i) {
    if (S.skärm !== "spel" || S.klar) return;
    clearTimeout(idleTimer);
    var p = S.p;
    var tal = p.alternativ[i];
    var knapp = document.querySelector('.svar-knapp[data-i="' + i + '"]');
    if (!S.visatGrepp) { S.visatGrepp = true; document.getElementById("svarrad").classList.remove("visa-grepp"); }

    S.placerat = tal;
    S.målvinkel = målVinkel(p, tal, false);
    ritaScen();
    snurra();

    if (tal === p.svar) {
      S.klar = true; S.visaRätt = true; S.item++; S.svarRätt++; S.stjärnor++;
      S.målvinkel = 0;
      setTimeout(function () { ritaScen(); ritaSvar(); ritaPrickar(); ritaStjärnor(); snurra(); }, 260);
      ljud(520, 0.12, "square");
      setTimeout(function () { ljud(780, 0.14, "sine"); }, 130);
      setTimeout(function () { ljud(1040, 0.18, "sine"); }, 260);
      sag("Rätt! " + p.text);
      kottenByt("firar");
      document.getElementById("svarrad").classList.add("last");
      setTimeout(function () {
        document.getElementById("svarrad").classList.remove("last");
        kottenByt("glad");
        if (S.item >= RUNDA) rundaKlar(); else nyUppgift();
      }, 2400);
    } else {
      S.felförsök++;
      if (knapp) { knapp.classList.add("fel"); setTimeout(function () { knapp.classList.remove("fel"); }, 560); }
      ljud(220, 0.16, "triangle");
      setTimeout(function () { ljud(170, 0.18, "triangle"); }, 150);
      kottenByt("funderar");
      var forMycket = tal > p.svar;
      sag(forMycket ? "För många nötter. Vågen tippar. Prova igen." : "För få nötter. Vågen tippar. Prova igen.");
      spar("hint");
      if (S.felförsök >= 2) {
        S.visaRätt = true;
        ritaSvar();
        sag("Den som lyser är rätt. " + p.text);
        kottenByt("tanker");
        setTimeout(function () {
          S.klar = true; S.item++;
          S.placerat = p.svar; S.målvinkel = 0;
          ritaScen(); ritaSvar(); ritaPrickar();
          snurra();
          if (S.item >= RUNDA) {
            setTimeout(function () { kottenByt("glad"); rundaKlar(); }, 1800);
          } else {
            setTimeout(function () { kottenByt("glad"); nyUppgift(); }, 2200);
          }
        }, 1800);
      } else {
        /* nötterna plockas tillbaka och barnet får en ny chans på samma uppgift */
        setTimeout(function () {
          S.placerat = null;
          S.målvinkel = målVinkel(p, null, false);
          ritaScen(); snurra();
          startIdle();
        }, 1100);
      }
    }
  }

  function rundaKlar() {
    S.skärm = "överlägg";
    var procent = Math.round(100 * S.svarRätt / RUNDA);
    spar("round_done", procent);
    sag("Rundan är klar. " + S.svarRätt + " av " + RUNDA + " rätt.");
    var stegUpp = S.svarRätt >= 6 && S.niva < 3;
    visaOverlay(S.svarRätt >= 6 ? "firar" : "hejar", "Rundan är klar!",
      S.svarRätt + " av " + RUNDA + " rätt. " + S.stjärnor + " stjärnor totalt." +
      (stegUpp ? " Nu blir det svårare!" : ""),
      "En runda till →", function () {
        if (stegUpp) { S.niva++; spar("level", S.niva); }
        S.runda++; startaRunda(S.niva);
      }, true);
  }

  function visaOverlay(uttryck, titel, text, knapptext, vidare, medNiva) {
    var ov = document.getElementById("overlay");
    document.getElementById("ov-bild").innerHTML = kottenSvg(uttryck, "ov-kotten");
    document.getElementById("ov-titel").textContent = titel;
    document.getElementById("ov-text").textContent = text;
    var b = document.getElementById("ov-nasta");
    b.textContent = knapptext;
    b.onclick = function () { ov.hidden = true; vidare(); };
    var n = document.getElementById("ov-niva");
    n.hidden = !medNiva;
    n.onclick = function () { ov.hidden = true; S.niva = S.niva >= 3 ? 1 : S.niva + 1; S.runda++; startaRunda(S.niva); };
    ov.hidden = false;
  }

  function startaRunda(niva) {
    S.niva = niva; S.skärm = "spel"; S.item = 0; S.svarRätt = 0; S.felförsök = 0;
    S.visatGrepp = false; S.vinkel = 0;
    document.getElementById("startskarm").hidden = true;
    document.getElementById("spel").hidden = false;
    document.getElementById("overlay").hidden = true;
    ritaStjärnor(); kottenByt("glad");
    spar("round_start"); spar("level", niva);
    if (niva === 2) setTimeout(function () { sag("Nu ligger nötter på båda sidor. Gör så att det väger lika."); }, 900);
    else if (niva === 3) setTimeout(function () { sag("Nu är det den första siffran som saknas ibland. Lyssna noga."); }, 900);
    nyUppgift();
  }

  function tipsa() {
    if (S.skärm !== "spel" || S.klar) return;
    sag(S.p.fraga);
    spar("hint");
    kottenByt("tanker");
    setTimeout(function () { if (!S.klar) kottenByt("glad"); }, 1600);
  }

  /* ------------------------------------------------------------------ *
   * 8. Händelser och start                                              *
   * ------------------------------------------------------------------ */
  function ritaLjudIkon() {
    document.getElementById("ljudikon").innerHTML = ljudPa
      ? '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 8a5 5 0 0 1 0 8"/>'
      : '<path d="M4 9h3l4-3v12l-4-3H4z"/><path d="M15 9l5 6M20 9l-5 6"/>';
  }

  function bind() {
    document.getElementById("svarrad").addEventListener("pointerdown", function (e) {
      var b = e.target.closest(".svar-knapp");
      if (b && !document.getElementById("svarrad").classList.contains("last")) {
        e.preventDefault(); valj(Number(b.dataset.i));
      }
    });
    document.getElementById("spela").addEventListener("click", function () { ljud(600, 0.1); startaRunda(1); });
    document.getElementById("hjalp").addEventListener("click", tipsa);
    document.getElementById("ljud").addEventListener("click", function () {
      ljudPa = !ljudPa;
      if (!ljudPa && window.__rostStopp) window.__rostStopp();
      ritaLjudIkon(); spar("sound_off");
    });
    document.addEventListener("keydown", function (e) {
      if (S.skärm !== "spel") return;
      if (e.key === "1" || e.key === "ArrowLeft") valj(0);
      if (e.key === "2" || e.key === "ArrowDown") valj(1);
      if (e.key === "3" || e.key === "ArrowRight") valj(2);
      if (e.key === "h" || e.key === "?") tipsa();
    });
    window.addEventListener("resize", function () { if (S.p) ritaScen(); });
  }

  function init() {
    bind(); ritaLjudIkon(); ritaStjärnor(); ritaPrickar();
    document.getElementById("kotten-hud").innerHTML = kottenSvg("glad", "kotten-hud");
    kottenByt("glad");
    window.__game = {
      S: S, uppgift: uppgift, valj: valj, startaRunda: startaRunda,
      nyUppgift: nyUppgift, tipsa: tipsa, ritaScen: ritaScen,
      målVinkel: målVinkel, summa: summa, RUNDA: RUNDA
    };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();