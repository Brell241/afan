#!/usr/bin/env python3
"""
research_seed.py — Génère un fichier seed TypeScript pour un artiste.

Usage normal (Discogs + Wikipedia + YouTube) :
    python scripts/research_seed.py "Annie-Flore Batchiellilys" annie-flore-batchiellilys --filename annie-flore
    python scripts/research_seed.py "Mack Joss" mack-joss

Usage depuis une chaîne YouTube (artiste sans données Discogs) :
    python scripts/research_seed.py "André Pépé Nzé" andre-pepe-nze --yt-channel @APN245

Sources: Wikipedia (bio) + Discogs (discographie + tracklists) + YouTube (URLs vidéo / chaîne)
"""

import re
import json
import time
import unicodedata
import argparse
import urllib.parse
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------

def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def make_const_name(artist_name: str) -> str:
    """'Annie-Flore Batchiellilys' → 'ANNIE_FLORE'"""
    words = re.sub(r"[^A-Za-z0-9 ]", " ", artist_name).split()
    return re.sub(r"_+", "_", "_".join(words[:2]).upper()).strip("_")


# ---------------------------------------------------------------------------
# Wikipedia
# ---------------------------------------------------------------------------

WIKI_SUMMARY_FR = "https://fr.wikipedia.org/api/rest_v1/page/summary/{}"
WIKI_SUMMARY_EN = "https://en.wikipedia.org/api/rest_v1/page/summary/{}"
BASE_HEADERS = {"User-Agent": "AfanSeedResearch/1.0 (research bot)"}


def fetch_wikipedia_bio(artist_name: str) -> dict:
    encoded = urllib.parse.quote(artist_name.replace(" ", "_"))
    for url in [WIKI_SUMMARY_FR.format(encoded), WIKI_SUMMARY_EN.format(encoded)]:
        try:
            r = requests.get(url, headers=BASE_HEADERS, timeout=10)
            if r.status_code == 200:
                extract = r.json().get("extract", "").strip()
                if extract:
                    print(f"  ✓ Wikipedia : {len(extract)} car.")
                    return {
                        "bio": extract,
                        "born_year": _extract_first_year(extract),
                        "death_year": _extract_death_year(extract),
                    }
        except Exception as e:
            print(f"  ⚠ Wikipedia : {e}")
    print("  ✗ Wikipedia : aucune bio trouvée")
    return {"bio": "", "born_year": None, "death_year": None}


def _extract_first_year(text: str) -> int | None:
    m = re.search(r"\b(19[2-9]\d|20[0-2]\d)\b", text)
    return int(m.group(1)) if m else None


def _extract_death_year(text: str) -> int | None:
    for p in [
        r"(?:mort|décédé|disparu|died).*?\b(19[2-9]\d|20[0-2]\d)\b",
        r"\b(19[2-9]\d|20[0-2]\d)\b.*?(?:mort|décédé|disparu|died)",
    ]:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return int(m.group(1))
    return None


# ---------------------------------------------------------------------------
# Discogs
# ---------------------------------------------------------------------------

DISCOGS_SEARCH   = "https://api.discogs.com/database/search"
DISCOGS_RELEASES = "https://api.discogs.com/artists/{id}/releases"
DISCOGS_RELEASE  = "https://api.discogs.com/releases/{id}"
DISCOGS_TOKEN    = None  # Optionnel : token pour lever le rate limit


def _discogs_get(url: str, params: dict | None = None) -> dict | None:
    headers = dict(BASE_HEADERS)
    if DISCOGS_TOKEN:
        headers["Authorization"] = f"Discogs token={DISCOGS_TOKEN}"
    try:
        r = requests.get(url, headers=headers, params=params, timeout=15)
        if r.status_code == 200:
            return r.json()
        if r.status_code == 429:
            print("  ⚠ Discogs rate limit — pause 15s")
            time.sleep(15)
            r = requests.get(url, headers=headers, params=params, timeout=15)
            if r.status_code == 200:
                return r.json()
        print(f"  ⚠ Discogs {r.status_code}")
    except Exception as e:
        print(f"  ⚠ Discogs : {e}")
    return None


def fetch_discogs_artist_id(artist_name: str) -> int | None:
    data = _discogs_get(DISCOGS_SEARCH, {"q": artist_name, "type": "artist", "per_page": 5})
    if not data or not data.get("results"):
        print("  ✗ Discogs : artiste introuvable")
        return None
    a = data["results"][0]
    print(f"  ✓ Discogs : {a.get('title')} (id={a.get('id')})")
    return a.get("id")


def fetch_discogs_artist_profile(artist_id: int) -> str:
    data = _discogs_get(f"https://api.discogs.com/artists/{artist_id}")
    if not data:
        return ""
    profile = (data.get("profile") or "").strip()
    profile = re.sub(r'\[/?[a-z](?:=[^\]]+)?\]', '', profile).strip()
    return profile[:1200] if profile else ""


def fetch_discogs_tracklist(release_id: int) -> dict:
    data = _discogs_get(DISCOGS_RELEASE.format(id=release_id))
    if not data:
        return {}

    tracks = [
        {"title": t.get("title", "").strip(), "track_number": i, "youtube_url": None}
        for i, t in enumerate(data.get("tracklist", []), 1)
        if t.get("type_") == "track"
    ]

    labels = data.get("labels", [])
    label = ""
    if labels:
        name = labels[0].get("name", "")
        catno = labels[0].get("catno", "")
        label = f"{name} ({catno})" if catno and catno.lower() != "none" else name

    formats = data.get("formats", [])
    fmt = formats[0].get("name", "") if formats else ""

    genres = data.get("genres", []) + data.get("styles", [])
    genre = " / ".join(genres[:2]) if genres else ""

    notes = re.sub(r"\[/?[a-z=0-9]+\]", "", (data.get("notes") or "")).strip()
    description = notes[:400] if notes else ""

    seen_roles: set[str] = set()
    credits_parts = []
    for ea in data.get("extraartists", []):
        role, name = ea.get("role", "").strip(), ea.get("name", "").strip()
        if role and name and role not in seen_roles:
            credits_parts.append(f"{role} : {name}")
            seen_roles.add(role)
        if len(credits_parts) >= 8:
            break

    time.sleep(0.6)
    return {
        "tracks": tracks,
        "label": label,
        "format": fmt,
        "genre": genre,
        "description": description,
        "credits": " · ".join(credits_parts) or None,
    }


def build_discography_from_discogs(artist_name: str, artist_id: int) -> list[dict]:
    data = _discogs_get(
        DISCOGS_RELEASES.format(id=artist_id),
        {"sort": "year", "sort_order": "asc", "per_page": 100},
    )
    if not data:
        return []

    releases = [r for r in data.get("releases", []) if r.get("role", "").lower() in ("main", "")]
    print(f"  ✓ {len(releases)} releases trouvées")

    discography = []
    seen_slugs: set[str] = set()
    seen_titles: set[str] = set()

    for rel in releases:
        title = rel.get("title", "").strip()
        year = rel.get("year") or 0
        if not title or not year or title.lower() == artist_name.lower():
            continue
        title_key = slugify(title)
        if title_key in seen_titles:
            continue
        seen_titles.add(title_key)
        slug = title_key if title_key not in seen_slugs else f"{title_key}-{year}"
        if slug in seen_slugs:
            continue
        seen_slugs.add(slug)

        print(f"  → {year}  {title}")
        detail = fetch_discogs_tracklist(rel["id"]) if rel.get("id") else {}
        discography.append({
            "title": title,
            "year": year,
            "slug": slug,
            "format": detail.get("format") or "",
            "label": detail.get("label") or "",
            "genre": detail.get("genre") or "",
            "description": detail.get("description") or "",
            "credits": detail.get("credits"),
            "tracks": detail.get("tracks", []),
        })

    return discography


# ---------------------------------------------------------------------------
# YouTube — scraping
# ---------------------------------------------------------------------------

YT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9",
    # Cookie pour bypass la page de consentement YouTube (EU)
    "Cookie": "CONSENT=YES+cb; SOCS=CAESEwgDEgk0OTA5NzU4MzYaAmZyIAEaBgiA_LysBg",
}


def _yt_get(url: str) -> requests.Response | None:
    try:
        r = requests.get(url, headers=YT_HEADERS, timeout=12)
        if r.status_code == 200:
            return r
        print(f"  ⚠ YouTube {r.status_code} : {url}")
    except Exception as e:
        print(f"  ⚠ YouTube : {e}")
    return None


def _extract_yt_initial_data(html: str) -> dict | None:
    """Extrait le JSON ytInitialData depuis une page YouTube."""
    # Pattern fiable : YouTube écrit toujours `var ytInitialData = {...};</script>`
    m = re.search(r'var ytInitialData = ({.*?});</script>', html, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # Fallback : sans le `;` exact
    m = re.search(r'ytInitialData\s*=\s*({.+?});\s*</script>', html, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    return None


def _find_all(obj, key: str, acc: list | None = None) -> list:
    """Cherche récursivement toutes les valeurs pour une clé dans un dict/list imbriqué."""
    if acc is None:
        acc = []
    if isinstance(obj, dict):
        if key in obj:
            acc.append(obj[key])
        for v in obj.values():
            _find_all(v, key, acc)
    elif isinstance(obj, list):
        for item in obj:
            _find_all(item, key, acc)
    return acc


def _extract_videos_from_yt_data(data: dict) -> list[dict]:
    """Extrait la liste de vidéos depuis un ytInitialData."""
    videos = []
    seen_ids: set[str] = set()

    # Chercher tous les videoRenderer
    for vr in _find_all(data, "videoRenderer"):
        vid_id = vr.get("videoId", "")
        if not vid_id or vid_id in seen_ids:
            continue
        t = vr.get("title", {})
        title = "".join(r["text"] for r in t.get("runs", [])) or t.get("simpleText", "")
        channel = ""
        owner = vr.get("ownerText", {})
        if "runs" in owner:
            channel = "".join(r["text"] for r in owner["runs"])
        if title:
            seen_ids.add(vid_id)
            videos.append({"id": vid_id, "title": title, "channel": channel})

    # Chercher aussi les richItemRenderer (pages de chaînes)
    for ri in _find_all(data, "richItemRenderer"):
        vr = ri.get("content", {}).get("videoRenderer", {})
        vid_id = vr.get("videoId", "")
        if not vid_id or vid_id in seen_ids:
            continue
        t = vr.get("title", {})
        title = "".join(r["text"] for r in t.get("runs", [])) or t.get("simpleText", "")
        if title:
            seen_ids.add(vid_id)
            videos.append({"id": vid_id, "title": title, "channel": ""})

    return videos


def fetch_channel_videos(channel_handle: str) -> list[dict]:
    """Récupère les vidéos d'une chaîne YouTube (handle ex: @APN245)."""
    handle = channel_handle if channel_handle.startswith("@") else f"@{channel_handle}"
    url = f"https://www.youtube.com/{handle}/videos"
    print(f"  Chaîne : {url}")
    r = _yt_get(url)
    if not r:
        return []
    data = _extract_yt_initial_data(r.text)
    if not data:
        print("  ⚠ Impossible de lire le contenu de la chaîne")
        return []
    videos = _extract_videos_from_yt_data(data)
    print(f"  ✓ {len(videos)} vidéos trouvées sur la chaîne")
    return videos


def search_youtube_videos(query: str, max_results: int = 30) -> list[dict]:
    """Recherche des vidéos YouTube pour une requête."""
    url = f"https://www.youtube.com/results?search_query={urllib.parse.quote(query)}"
    r = _yt_get(url)
    if not r:
        return []
    data = _extract_yt_initial_data(r.text)
    if not data:
        return []
    return _extract_videos_from_yt_data(data)[:max_results]


def search_youtube_url(query: str) -> str | None:
    """Retourne l'URL de la première vidéo pour une requête."""
    videos = search_youtube_videos(query, max_results=1)
    if videos:
        return f"https://www.youtube.com/watch?v={videos[0]['id']}"
    return None


# ---------------------------------------------------------------------------
# Extraction de titres depuis les vidéos YouTube
# ---------------------------------------------------------------------------

def _extract_song_title_from_video(raw_title: str, artist_name: str) -> str:
    """
    Extrait un titre de chanson propre depuis un titre de vidéo YouTube.
    Ex: 'Esprit et Culture... #AwouMawou#A.PepeNze' → 'Awou Mawou'
    Ex: 'DZALE - Andre Pépé NZE ( Clip Officiel)' → 'Dzale'
    Ex: 'André Pépé Nzé - Andia (Clip officiel)' → 'Andia'
    """
    artist_parts = {slugify(p) for p in artist_name.split() if len(p) > 2}

    # Cas 1 : hashtag de chanson (#MotsCollés ou #motCollé)
    hashtags = re.findall(r"#([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ']+)", raw_title)
    song_hashtags = [
        h for h in hashtags
        if slugify(h) not in artist_parts
        and len(h) > 2
        and "." not in h                        # exclure "A.PepeNze"
        and not re.match(r"^[A-Z][a-z]$", h)   # exclure initiales courtes
    ]
    if song_hashtags:
        # Séparer le CamelCase/camelCase : "AwouMawou" → "Awou Mawou", "nkoumElone" → "nkoum Elone"
        title = re.sub(r"(?<=[a-zÀ-ÿ])(?=[A-ZÀ-Ü])", " ", song_hashtags[0])
        # Capitaliser le premier mot
        title = title.strip()
        return title[0].upper() + title[1:]

    # Cas 2 : "Artiste - SongTitle (…)" → prendre ce qui est après le tiret
    artist_prefix = re.escape(artist_name[:6])
    m = re.match(
        rf"^(?:{artist_prefix}[^–—\-]*?)\s*[-–—]\s*(.+?)(?:\s*[\(\[].*)?$",
        raw_title, re.IGNORECASE
    )
    if m:
        title = m.group(1).strip()
        title = re.sub(r"\s+", " ", title)
        if title.isupper():
            title = title.capitalize()
        return title

    # Cas 3 : "TITRE - Artiste (…)" → prendre ce qui est avant le tiret
    m = re.match(
        rf"^(.+?)\s*[-–—]\s*(?:{artist_prefix}|[A-Z]{{2,}})",
        raw_title, re.IGNORECASE
    )
    if m:
        title = m.group(1).strip()
        title = re.sub(r"\s+", " ", title)
        if title.isupper():
            title = title.capitalize()
        return title

    # Cas 4 : nettoyage générique
    cleaned = re.sub(re.escape(artist_name), "", raw_title, flags=re.IGNORECASE)
    cleaned = re.sub(
        r"\b(?:clip|officiel|official|version|feat|ft\.?|live|lyric|audio|hd|hq|sous.titr[eé])\b",
        "", cleaned, flags=re.IGNORECASE
    )
    cleaned = re.sub(r"[^\w\s\'\-]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -–—")
    return cleaned if len(cleaned) > 2 else raw_title.strip()


# Mots-clés indiquant que la vidéo n'est pas une chanson de l'artiste
_NON_SONG_KEYWORDS = re.compile(
    r"\b(?:oligui|nguema|dialogue\s+national|prestation|conference|"
    r"interview|emission|journal|tv|feat\.|featuring|remix|dj\s|mix\b)\b",
    re.IGNORECASE,
)


def _is_song_video(video: dict, artist_name: str) -> bool:
    """Retourne False si la vidéo est clairement une non-chanson."""
    title = video.get("title", "")
    # Exclure si le titre contient des mots-clés non-musicaux
    if _NON_SONG_KEYWORDS.search(title):
        return False
    # Exclure si le titre ne contient aucune référence à l'artiste ET ne vient pas de sa chaîne
    artist_short = artist_name.split()[0][:4].lower()
    channel = video.get("channel", "").lower()
    if not re.search(re.escape(artist_short), title, re.IGNORECASE) and artist_short not in channel:
        return False
    return True


def build_discography_from_youtube(channel_handle: str, artist_name: str) -> list[dict]:
    """
    Construit une discographie depuis une chaîne YouTube.
    Chaque vidéo devient un track dans un album unique 'Principales œuvres'.
    """
    # 1. Vidéos de la chaîne officielle
    original_channel_videos = fetch_channel_videos(channel_handle)
    channel_videos = list(original_channel_videos)

    # 2. Compléter avec une recherche YouTube pour trouver les clips d'autres chaînes
    print(f"\n  Recherche clips supplémentaires...")
    search_vids = search_youtube_videos(f"{artist_name} clip officiel", max_results=20)
    time.sleep(0.5)

    # Fusionner : chaîne officielle en priorité
    seen_ids = {v["id"] for v in channel_videos}
    seen_titles = {slugify(_extract_song_title_from_video(v["title"], artist_name)) for v in channel_videos}

    for v in search_vids:
        if v["id"] in seen_ids:
            continue
        if not _is_song_video(v, artist_name):
            continue
        song_title = _extract_song_title_from_video(v["title"], artist_name)
        title_key = slugify(song_title)
        if title_key in seen_titles or len(title_key) < 2:
            continue
        seen_ids.add(v["id"])
        seen_titles.add(title_key)
        channel_videos.append(v)

    # 3. Construire les tracks
    #    - vidéos de la chaîne officielle : acceptées sans filtre (c'est la chaîne de l'artiste)
    #    - vidéos supplémentaires (search) : filtrées
    tracks = []
    seen_song_slugs: set[str] = set()
    official_ids = {v["id"] for v in original_channel_videos}

    for v in channel_videos:
        is_official = v["id"] in official_ids
        if not is_official and not _is_song_video(v, artist_name):
            print(f"    ✗ Ignoré : {v['title'][:60]}")
            continue
        song_title = _extract_song_title_from_video(v["title"], artist_name)
        s = slugify(song_title)
        if s in seen_song_slugs or len(s) < 2:
            continue
        seen_song_slugs.add(s)
        tracks.append({
            "title": song_title,
            "track_number": len(tracks) + 1,
            "youtube_url": f"https://www.youtube.com/watch?v={v['id']}",
        })
        print(f"    ✓ {song_title} → {v['id']}")

    if not tracks:
        return []

    # 4. Créer un album unique regroupant toutes les œuvres
    return [{
        "title": "Principales œuvres",
        "year": 2000,  # année approx., à corriger manuellement
        "slug": "principales-oeuvres",
        "format": "Compilation YouTube",
        "label": "",
        "genre": "Folk-Pop Fang",
        "description": "",
        "credits": None,
        "tracks": tracks,
    }]


# ---------------------------------------------------------------------------
# Enrichissement YouTube pour discographie Discogs existante
# ---------------------------------------------------------------------------

def enrich_with_youtube(artist_name: str, discography: list[dict]) -> None:
    """Cherche une URL YouTube pour chaque track sans URL."""
    total = sum(len(a["tracks"]) for a in discography)
    done = 0
    print(f"\n  Recherche YouTube ({total} tracks)...")
    for album in discography:
        for track in album["tracks"]:
            done += 1
            query = f'{artist_name} {track["title"]}'
            print(f"  [{done}/{total}] {track['title']}", end="", flush=True)
            url = search_youtube_url(query)
            if url:
                track["youtube_url"] = url
                print(f" → {url.split('v=')[-1]}")
            else:
                print(" → null")
            time.sleep(0.8)


# ---------------------------------------------------------------------------
# Génération TypeScript
# ---------------------------------------------------------------------------

SEED_BOILERPLATE = '''\
import {{ config }} from 'dotenv';
config({{ path: '.env.local' }});

import {{ db }} from '../db';
import {{ artists, albums, tracks }} from '../db/schema';
import {{ eq }} from 'drizzle-orm';

const {CONST}_BIO = `{BIO}`;

const {CONST}_DISCOGRAPHY = [
{DISCOGRAPHY}];

export async function seed() {{
  console.log('🌱 Démarrage du seed {NAME}...\\n');

  const [artist] = await db
    .insert(artists)
    .values({{
      name: '{NAME}',
      slug: '{SLUG}',
      bio: {CONST}_BIO,
      photo_url: null,
      avatar_url: null,{BORN}{DEATH}
    }})
    .onConflictDoUpdate({{ target: artists.slug, set: {{ bio: {CONST}_BIO, name: '{NAME}' }} }})
    .returning();

  console.log(`✅ Artiste : ${{artist.name}} (${{artist.id}})\\n`);

  const existingAlbums = await db
    .select({{ slug: albums.slug, image_url: albums.image_url }})
    .from(albums)
    .where(eq(albums.artist_id, artist.id));
  const savedImageUrls: Record<string, string | null> = Object.fromEntries(
    existingAlbums.map((a) => [a.slug, a.image_url])
  );

  await db.delete(albums).where(eq(albums.artist_id, artist.id));

  for (const disc of {CONST}_DISCOGRAPHY) {{
    const [album] = await db
      .insert(albums)
      .values({{
        artist_id: artist.id,
        title: disc.title,
        slug: disc.slug,
        year: disc.year,
        format: disc.format,
        label: disc.label,
        genre: disc.genre,
        description: disc.description,
        credits: disc.credits ?? null,
        image_url: savedImageUrls[disc.slug] ?? null,
      }})
      .returning();

    const trackCount = disc.tracks.length;
    console.log(`  📀 ${{disc.year}} — ${{disc.title}} [${{disc.format}}] · ${{disc.label}}`);

    if (trackCount > 0) {{
      await db.insert(tracks).values(
        disc.tracks.map((t) => ({{
          album_id: album.id,
          title: t.title,
          track_number: t.track_number,
          duration: null,
          youtube_url: t.youtube_url ?? null,
          lyrics_fr: null,
          lyrics_original: null,
          context: null,
        }}))
      );
      console.log(`     └ ${{trackCount}} titre(s)`);
    }}
  }}

  console.log('\\n🌳 Seed terminé.');
}}

if (require.main === module) {{
  seed().then(() => process.exit(0)).catch((err) => {{
    console.error('Erreur seed :', err);
    process.exit(1);
  }});
}}
'''


def _ts_str(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def format_track(t: dict) -> str:
    return (
        f"      {{ title: {json.dumps(t['title'], ensure_ascii=False)}, "
        f"track_number: {t['track_number']}, "
        f"youtube_url: {_ts_str(t.get('youtube_url'))} }}"
    )


def format_album(album: dict) -> str:
    tracks_str = ",\n".join(format_track(t) for t in album["tracks"])
    tracks_block = f"[\n{tracks_str},\n    ]" if album["tracks"] else "[]"
    desc = (album.get("description") or "").replace("`", "'")
    return "\n".join([
        "  {",
        f"    title: {json.dumps(album['title'], ensure_ascii=False)},",
        f"    year: {album['year']},",
        f"    slug: '{album['slug']}',",
        f"    format: {json.dumps(album.get('format', ''), ensure_ascii=False)},",
        f"    label: {json.dumps(album.get('label', ''), ensure_ascii=False)},",
        f"    genre: {json.dumps(album.get('genre', ''), ensure_ascii=False)},",
        f"    description: {json.dumps(desc, ensure_ascii=False)},",
        f"    credits: {_ts_str(album.get('credits'))},",
        f"    tracks: {tracks_block},",
        "  },",
    ])


def generate_typescript(
    artist_name: str,
    artist_slug: str,
    bio: str,
    born_year: int | None,
    death_year: int | None,
    discography: list[dict],
) -> str:
    const = make_const_name(artist_name)
    return SEED_BOILERPLATE.format(
        CONST=const,
        BIO=bio.replace("`", "'"),
        NAME=artist_name,
        SLUG=artist_slug,
        DISCOGRAPHY="\n".join(format_album(a) for a in discography) + "\n",
        BORN=f"\n      born_year: {born_year}," if born_year else "",
        DEATH=f"\n      death_year: {death_year}," if death_year else "",
    )


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Génère un seed TypeScript depuis Wikipedia + Discogs + YouTube."
    )
    parser.add_argument("artist_name", help='Nom complet, ex: "Annie-Flore Batchiellilys"')
    parser.add_argument("artist_slug", help='Slug DB, ex: annie-flore-batchiellilys')
    parser.add_argument("--filename", help="Nom du fichier .ts sans extension (défaut: artist_slug)")
    parser.add_argument("--yt-channel", metavar="HANDLE",
                        help="Handle de la chaîne YouTube officielle (ex: @APN245) — utilisé quand Discogs n'a pas de données")
    parser.add_argument("--no-youtube", action="store_true", help="Désactiver la recherche YouTube")
    args = parser.parse_args()

    artist_name = args.artist_name
    artist_slug = args.artist_slug
    filename = args.filename or artist_slug

    print(f"\n{'='*60}")
    print(f"  Artiste : {artist_name}")
    print(f"  Slug DB : {artist_slug}")
    print(f"  Fichier : src/seed/{filename}.ts")
    if args.yt_channel:
        print(f"  Chaîne  : {args.yt_channel}")
    print(f"{'='*60}\n")

    # 1. Wikipedia
    print("📖 Wikipedia...")
    wiki = fetch_wikipedia_bio(artist_name)

    # 2. Discogs
    print("\n🎵 Discogs...")
    discogs_id = fetch_discogs_artist_id(artist_name)
    discography: list[dict] = []

    if discogs_id:
        print("  Albums...")
        discography = build_discography_from_discogs(artist_name, discogs_id)
        if not wiki["bio"]:
            print("  → Tentative bio Discogs...")
            wiki["bio"] = fetch_discogs_artist_profile(discogs_id)
            if wiki["bio"]:
                print(f"  ✓ Bio Discogs : {len(wiki['bio'])} car.")

    # 3. Si pas de discographie Discogs → utiliser la chaîne YouTube
    if not discography and args.yt_channel and not args.no_youtube:
        print(f"\n📺 Construction depuis la chaîne YouTube {args.yt_channel}...")
        discography = build_discography_from_youtube(args.yt_channel, artist_name)

    # 4. Enrichir avec YouTube si discographie Discogs existante
    elif discography and not args.no_youtube:
        enrich_with_youtube(artist_name, discography)

    # 5. Génération TypeScript
    print("\n📝 Génération TypeScript...")
    ts_content = generate_typescript(
        artist_name=artist_name,
        artist_slug=artist_slug,
        bio=wiki["bio"],
        born_year=wiki["born_year"],
        death_year=wiki["death_year"],
        discography=discography,
    )

    # 6. Écriture
    project_root = Path(__file__).parent.parent
    output_path = project_root / "src" / "seed" / f"{filename}.ts"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(ts_content, encoding="utf-8")

    total_tracks = sum(len(a["tracks"]) for a in discography)
    yt_found = sum(1 for a in discography for t in a["tracks"] if t.get("youtube_url"))

    print(f"\n✅ {output_path}")
    print(f"   {len(discography)} albums · {total_tracks} tracks · {yt_found} YouTube URLs")
    print("\n⚠  Relire et compléter les descriptions avant de lancer le seed !\n")


if __name__ == "__main__":
    main()
