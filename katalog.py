#!/usr/bin/env python3
"""Lägger Kotten och vågen i katalogen (pending), sätter bild och Lgr22-punkter.
Kör mot admin-ytan via mcp.py (create_app/update_app/set_app_image)."""
import json
import sys

sys.path.insert(0, "/opt/data/projects/skolappar-next")
import mcp

LONG = (
    "Kotten och vågen är ett matematikspel om likhetstecknet för åk 1–3. En balansvåg "
    "står mitt på skärmen med två skålar, och ovanför står samma likhet med siffror: "
    "till exempel 4 + 4 = 2 + ?. På ena skålen ligger nötterna för den sidan, på den "
    "andra de nötter som redan finns där, och under skålen som saknar nötter står en "
    "streckad guldruta med ett frågetecken. Vågen tippar redan innan barnet svarar, så "
    "det syns vilken sida som väger för lite.\n\n"
    "Tre stora sifferknappar längst ned (med lika många prickar under siffran) är det "
    "enda barnet behöver träffa. När barnet pekar faller nötterna i skålen och vågen "
    "svänger. Stämmer likheten stannar bommen vågrät, rutan fylls med talet och Kotten "
    "säger hela likheten på svenska: ”fyra plus fyra är lika med två plus sex. Båda "
    "sidor är åtta. Nu väger det lika!” Är det fel tippar vågen synligt, en röst säger "
    "”för många nötter, prova igen” och nötterna plockas tillbaka – inget går förlorat, "
    "och barnet får en ny chans på samma uppgift.\n\n"
    "Svårighetsgraden flyttar tomrummet i små steg: först hela antalet på ena sidan "
    "(9 = 4 + ?), sedan summa på båda sidor (4 + 3 = 2 + ?), och sist tomrummet först "
    "(? + 2 = 8) eller en helt tom höger sida (3 + 2 = ?). Svaret står aldrig redan på "
    "tavlan, så det går inte att skriva av – barnet måste räkna. En runda är åtta "
    "uppgifter och tar ungefär 3–5 minuter. Prickar och stjärnor visar hur det går, och "
    "resultatrutan säger hur många av åtta som blev rätt.\n\n"
    "Vågen, nötterna och Kotten är ritade i koden – inga bildfiler och inga anrop till "
    "andra webbplatser. Frågan läses upp på svenska (webbläsarens talsyntes), så barnet "
    "behöver inte kunna läsa. Högtalarknappen läser om frågan och ljudknappen stänger av "
    "både tal och ljud. Gratis, ingen inloggning, inga annonser, inga länkar ut."
)

KAT = [
    "bae12b83-f7a5-4aec-b9a6-23e3b6936414",  # Matte (subject)
    "e8c8feb2-2704-4f70-a268-7122d226cd83",  # FK–2 (age)
    "0d9fb3f2-c3de-4685-938b-210d0c85ab08",  # Spel (app_type)
    "39d19ce9-f042-49e5-bbb0-b32a742e715c",  # Alla enheter (device)
]

args = {
    "title": "Kotten och vågen",
    "description": "Peka på siffran som gör att vågen väger jämnt. Likhetstecknets betydelse, åk 1–3.",
    "url": "https://kottenvagen.shipholm.dev",
    "long_description": LONG,
    "image_url": "https://kottenvagen.shipholm.dev/kort.png",
    "status": "pending",
    "category_ids": KAT,
    "creator_name": "Magnus Froste",
}

res = mcp.call("create_app", args, admin=True)
print("CREATE:", json.dumps(res, ensure_ascii=False)[:900])

app = res.get("app") or res
aid = app.get("id") if isinstance(app, dict) else None
if not aid:
    lst = mcp.call("list_apps", {"limit": 200}, admin=True)
    for a in lst if isinstance(lst, list) else lst.get("apps", []):
        if a.get("title") == "Kotten och vågen":
            aid = a["id"]
print("ID:", aid)

if aid:
    u = mcp.call("update_app", {"id": aid, "curriculum_ids": ["MA.1-3.2.1"], "status": "pending"}, admin=True)
    print("UPDATE:", json.dumps(u, ensure_ascii=False)[:600])
    s = mcp.call("set_app_image", {"id": aid,
                                   "image_url": "https://kottenvagen.shipholm.dev/kort.png"}, admin=True)
    print("IMAGE:", json.dumps(s, ensure_ascii=False)[:400])