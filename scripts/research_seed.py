#!/usr/bin/env python3
"""
research_seed.py — Génère un fichier seed TypeScript pour un artiste.

Usage normal (Discogs + Wikipedia + YouTube) :
    python scripts/research_seed.py "Annie-Flore Batchiellilys" annie-flore-batchiellilys --filename annie-flore
    python scripts/research_seed.py "Mack Joss" mack-joss

Usage depuis une chaîne YouTube (artiste sans données Discogs) :
    python scripts/research_seed.py "André Pépé Nzé" andre-pepe-nze --yt-channel @APN245

Options avancées :
    --images         Chercher les pochettes (Discogs thumb + YouTube fallback)
    --cloudinary     Upload les pochettes vers Cloudinary (implique --images)
    --deepseek       Reformuler la bio + extraire les genres via DeepSeek

Sources: Wikipedia (bio) + Discogs (discographie + tracklists) + YouTube (URLs vidéo / chaîne)
"""

import re
import json
import time
import unicodedata
import argparse
import urllib.parse
import os
import tempfile
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Chargement des variables d'environnement (.env.local)
# ---------------------------------------------------------------------------

def _load_env_local() -> dict[str, str]:
    env: dict[str, str] = {}
    env_path = Path(__file__).parent.parent / ".env.local"
    if not env_path.exists():
        return env
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env

ENV = _load_env_local()


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


def fetch_wikipedia_wikitext(artist_name: str) -> str:
    """Récupère le wikitext complet de la page Wikipedia (fr puis en)."""
    encoded = urllib.parse.quote(artist_name.replace(" ", "_"))
    params = {
        "action": "query", "prop": "revisions", "rvprop": "content",
        "titles": encoded, "format": "json", "rvslots": "main",
    }
    for lang in ["fr", "en"]:
        try:
            r = requests.get(f"https://{lang}.wikipedia.org/w/api.php",
                             headers=BASE_HEADERS, params=params, timeout=10)
            if r.status_code != 200:
                continue
            pages = r.json().get("query", {}).get("pages", {})
            pid = list(pages.keys())[0]
            if pid == "-1":
                continue
            content = (pages[pid].get("revisions") or [{}])[0] \
                        .get("slots", {}).get("main", {}).get("*", "")
            if content:
                return content
        except Exception as e:
            print(f"  ⚠ Wikipedia wikitext : {e}")
    return ""


def parse_wikipedia_discography(wikitext: str, artist_name: str) -> list[dict]:
    """Extrait la discographie depuis le wikitext Wikipedia."""
    disc_m = re.search(
        r"==\s*[Dd]iscograph[^\n=]*==(.+?)(?:==\s*[^=]|$)",
        wikitext, re.DOTALL
    )
    if not disc_m:
        print("  ✗ Wikipedia : section Discographie introuvable")
        return []

    section = disc_m.group(1)
    seen_titles: set[str] = set()
    entries: list[tuple[str, int]] = []

    # Plusieurs formats wikitext : ''Titre'' (an) | [[Titre]] (an) | Titre (an)
    for pattern in [
        r"\*\s*'{2,3}([^'\n]+?)'{2,3}\s*\((\d{4})\)",
        r"\*\s*\[\[([^\]|\n]+?)(?:\|[^\]\n]*)?\]\]\s*\((\d{4})\)",
        r"\*\s*([A-ZÀ-Ü][^(\n*]{2,50}?)\s*\((\d{4})\)",
    ]:
        for m in re.finditer(pattern, section):
            title = m.group(1).strip()
            year = int(m.group(2))
            key = slugify(title)
            if key in seen_titles or not (1950 <= year <= 2030):
                continue
            seen_titles.add(key)
            entries.append((title, year))

    entries.sort(key=lambda x: x[1])
    print(f"  ✓ Wikipedia discographie : {len(entries)} album(s) trouvé(s)")

    seen_slugs: set[str] = set()
    discography = []
    for title, year in entries:
        sl = slugify(title)
        slug = sl if sl not in seen_slugs else f"{sl}-{year}"
        seen_slugs.add(slug)
        print(f"  → {year}  {title}")
        discography.append({
            "title": title, "year": year, "slug": slug,
            "format": "Album", "label": "", "genre": "",
            "description": "", "credits": None, "image_url": None, "tracks": [],
        })

    return discography


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
DISCOGS_TOKEN    = ENV.get("DISCOGS_TOKEN") or os.getenv("DISCOGS_TOKEN")

# Genres Discogs incompatibles avec un artiste de musique africaine francophone
_SUSPICIOUS_FOR_AFRICAN = re.compile(
    r'\b(?:drum\s*[&n]\s*bass|dnb|techno|trance|metal|thrash|grunge|punk|'
    r'edm|dubstep|house|ambient|new\s*age|folk\s*rock|indie\s*rock|'
    r'psychedelic|prog(?:ressive)?|noise|post.rock|shoegaze|'
    r'hip.hop|hip\s*hop|rap|r&b|rnb)\b',
    re.IGNORECASE,
)


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

    if genre and _SUSPICIOUS_FOR_AFRICAN.search(genre):
        print(f"  ⚠ Genre suspect pour un artiste africain ({genre}) — release ignorée")
        return {}

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

    # Image primaire (uri150 = thumbnail public 150px)
    images = data.get("images", [])
    primary_img = next((i for i in images if i.get("type") == "primary"), images[0] if images else None)
    image_url = primary_img.get("uri150") if primary_img else None

    time.sleep(0.6)
    return {
        "tracks": tracks,
        "label": label,
        "format": fmt,
        "genre": genre,
        "description": description,
        "credits": " · ".join(credits_parts) or None,
        "image_url": image_url,
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

        # thumb = miniature publique (150x150) présente dans la liste des releases
        thumb = rel.get("thumb") or ""

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
            # Priorité : image haute-res du détail release > thumb de la liste
            "image_url": detail.get("image_url") or thumb or None,
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
    m = re.search(r'var ytInitialData = ({.*?});</script>', html, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
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
    """Récupère les vidéos d'une chaîne YouTube (handle @APN245 ou ID UCAFRTRYx...)."""
    if channel_handle.startswith("UC") or channel_handle.startswith("/channel/"):
        cid = channel_handle.lstrip("/channel/")
        url = f"https://www.youtube.com/channel/{cid}/videos"
    elif channel_handle.startswith("@"):
        url = f"https://www.youtube.com/{channel_handle}/videos"
    else:
        url = f"https://www.youtube.com/@{channel_handle}/videos"
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


def fetch_youtube_playlist(playlist_url: str) -> list[dict]:
    """
    Récupère les pistes d'une playlist YouTube (y compris les playlists YouTube Music OLAK5uy_...).
    Les titres sont déjà propres et correspondent directement aux noms de chansons.
    """
    r = _yt_get(playlist_url)
    if not r:
        return []
    data = _extract_yt_initial_data(r.text)
    if not data:
        print("  ⚠ Impossible de lire la playlist")
        return []

    tracks: list[dict] = []
    seen_ids: set[str] = set()

    for pvr in _find_all(data, "playlistVideoRenderer"):
        vid_id = pvr.get("videoId", "")
        if not vid_id or vid_id in seen_ids:
            continue
        t = pvr.get("title", {})
        title = "".join(run["text"] for run in t.get("runs", [])) or t.get("simpleText", "")
        if not title:
            continue
        seen_ids.add(vid_id)
        tracks.append({
            "title": title.strip(),
            "track_number": len(tracks) + 1,
            "youtube_url": f"https://www.youtube.com/watch?v={vid_id}",
        })

    print(f"  ✓ Playlist : {len(tracks)} piste(s)")
    return tracks


def search_youtube_playlist_url(query: str) -> str | None:
    """
    Cherche une playlist YouTube (filtre type=playlist) et retourne l'URL de la première.
    Très efficace pour trouver les playlists d'albums YouTube Music (OLAK5uy_...).
    """
    url = (
        "https://www.youtube.com/results"
        f"?search_query={urllib.parse.quote(query)}&sp=EgIQAw%3D%3D"
    )
    r = _yt_get(url)
    if not r:
        return None
    data = _extract_yt_initial_data(r.text)
    if not data:
        return None

    for pr in _find_all(data, "playlistRenderer"):
        playlist_id = pr.get("playlistId", "")
        if playlist_id:
            return f"https://www.youtube.com/playlist?list={playlist_id}"
    return None


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


def fetch_yt_thumbnail(youtube_url: str) -> str | None:
    """Retourne l'URL de la miniature HD d'une vidéo YouTube (publique)."""
    m = re.search(r"v=([A-Za-z0-9_\-]{11})", youtube_url)
    if not m:
        return None
    vid_id = m.group(1)
    for quality in ("maxresdefault", "hqdefault", "mqdefault"):
        thumb_url = f"https://i.ytimg.com/vi/{vid_id}/{quality}.jpg"
        try:
            r = requests.head(thumb_url, timeout=6)
            if r.status_code == 200:
                return thumb_url
        except Exception:
            pass
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

    hashtags = re.findall(r"#([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ']+)", raw_title)
    song_hashtags = [
        h for h in hashtags
        if slugify(h) not in artist_parts
        and len(h) > 2
        and "." not in h
        and not re.match(r"^[A-Z][a-z]$", h)
    ]
    if song_hashtags:
        title = re.sub(r"(?<=[a-zÀ-ÿ])(?=[A-ZÀ-Ü])", " ", song_hashtags[0])
        title = title.strip()
        return title[0].upper() + title[1:]

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

    cleaned = re.sub(re.escape(artist_name), "", raw_title, flags=re.IGNORECASE)
    cleaned = re.sub(
        r"\b(?:clip|officiel|official|version|feat|ft\.?|live|lyric|audio|hd|hq|sous.titr[eé])\b",
        "", cleaned, flags=re.IGNORECASE
    )
    cleaned = re.sub(r"[^\w\s\'\-]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -–—")
    return cleaned if len(cleaned) > 2 else raw_title.strip()


_NON_SONG_KEYWORDS = re.compile(
    r"\b(?:oligui|nguema|dialogue\s+national|prestation|conf[eé]rence|"
    r"interview|[eé]mission|journal|tv|feat\.|featuring|remix|dj\s|mix\b|"
    r"reportage|traduction|translation|excuses?|arnaque|maffioso|bamilek[eé]|"
    r"kribien|d[eé]dicace|veuve|peuple gabonais)\b",
    re.IGNORECASE,
)


def _is_song_video(video: dict, artist_name: str) -> bool:
    """Retourne False si la vidéo est clairement une non-chanson."""
    title = video.get("title", "")

    if _NON_SONG_KEYWORDS.search(title):
        return False

    # Rejeter les titres trop longs (> 80 car.) — généralement des titres de vidéos d'actualité
    if len(title) > 80:
        return False

    # Rejeter les titres entièrement en MAJUSCULES + longs (style news YouTube)
    stripped = re.sub(r"[^A-Za-z]", "", title)
    if len(stripped) > 15 and stripped == stripped.upper():
        return False

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
    original_channel_videos = fetch_channel_videos(channel_handle)
    channel_videos = list(original_channel_videos)

    print(f"\n  Recherche clips supplémentaires...")
    search_vids = search_youtube_videos(f"{artist_name} clip officiel", max_results=20)
    time.sleep(0.5)

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

    return [{
        "title": "Principales œuvres",
        "year": 2000,
        "slug": "principales-oeuvres",
        "format": "Compilation YouTube",
        "label": "",
        "genre": "Folk-Pop Fang",
        "description": "",
        "credits": None,
        "image_url": None,
        "tracks": tracks,
    }]


# ---------------------------------------------------------------------------
# GStore Music — scraping des tracklists
# ---------------------------------------------------------------------------

GSTORE_BASE = "https://gstoremusic.com"
GSTORE_HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/124.0.0.0 Safari/537.36"}


def fetch_gstore_artist(artist_name: str) -> tuple[str, str] | None:
    """Cherche l'artiste sur GStore, retourne (id, slug) ou None."""
    try:
        r = requests.post(
            GSTORE_BASE + "/",
            data={"search": artist_name, "recherche": ""},
            headers=GSTORE_HEADERS, timeout=12,
        )
        if r.status_code == 200:
            m = re.search(r'href="/artistes/(\d+)-([^"]+)"', r.text)
            if m:
                print(f"  ✓ GStore : {m.group(2)} (id={m.group(1)})")
                return m.group(1), m.group(2)
    except Exception as e:
        print(f"  ⚠ GStore : {e}")
    print("  ✗ GStore : artiste introuvable")
    return None


def fetch_gstore_album_urls(gstore_id: str, gstore_slug: str) -> list[dict]:
    """Retourne la liste des albums de l'artiste sur GStore."""
    url = f"{GSTORE_BASE}/albums/{gstore_id}-{gstore_slug}"
    try:
        r = requests.get(url, headers=GSTORE_HEADERS, timeout=12)
        if r.status_code != 200:
            return []
        seen: set[str] = set()
        albums = []
        for m in re.finditer(rf'href="(/albums/{re.escape(gstore_slug)}/\d+-[^"]+)"', r.text):
            path = m.group(1)
            if path in seen:
                continue
            seen.add(path)
            nearby = r.text[r.text.find(path): r.text.find(path) + 400]
            title_m = re.search(r'<h3[^>]*>\s*<a[^>]*>([^<]+)</a>', nearby)
            albums.append({
                "url": GSTORE_BASE + path,
                "title": title_m.group(1).strip() if title_m else "",
            })
        print(f"  ✓ GStore : {len(albums)} album(s) trouvé(s)")
        return albums
    except Exception as e:
        print(f"  ⚠ GStore albums : {e}")
        return []


def fetch_gstore_tracklist(album_url: str) -> list[dict]:
    """Scrape la tracklist d'une page album GStore."""
    try:
        r = requests.get(album_url, headers=GSTORE_HEADERS, timeout=12)
        if r.status_code != 200:
            return []
        tracks = []
        for row in re.finditer(r'<tr>([\s\S]*?)</tr>', r.text):
            row_text = row.group(1)
            if 'colspan' in row_text or 'song_list' in row_text or '<th>' in row_text:
                continue
            # Supprimer les commentaires HTML avant d'extraire les cellules
            row_clean = re.sub(r'<!--[\s\S]*?-->', '', row_text)
            cells = re.findall(r'<td[^>]*>([\s\S]*?)</td>', row_clean)
            if len(cells) < 3:
                continue
            num_s   = re.sub(r'<[^>]+>', '', cells[0]).strip()
            title_s = re.sub(r'<[^>]+>', '', cells[1]).strip()
            # La durée (HH:MM:SS) peut être à n'importe quel index selon le HTML
            dur_s = next(
                (re.sub(r'<[^>]+>', '', c).strip()
                 for c in cells
                 if re.match(r'\d{2}:\d{2}:\d{2}', re.sub(r'<[^>]+>', '', c).strip())),
                None,
            )
            if not num_s.isdigit() or not title_s or not dur_s:
                continue
            tracks.append({"title": title_s, "track_number": int(num_s),
                           "duration": dur_s, "youtube_url": None})
        if tracks:
            print(f"  ✓ GStore tracklist : {len(tracks)} titre(s)")
        return tracks
    except Exception as e:
        print(f"  ⚠ GStore tracklist : {e}")
        return []


def _videos_to_tracks(videos: list[dict], artist_name: str, strict: bool = True) -> list[dict]:
    """
    Convertit une liste de vidéos YouTube en tracks.
    strict=False : n'exige pas le nom de l'artiste dans le titre/chaîne (pour les recherches ciblées).
    """
    tracks: list[dict] = []
    seen: set[str] = set()
    for v in videos:
        raw = v.get("title", "")
        if strict and not _is_song_video(v, artist_name):
            continue
        if not strict:
            if _NON_SONG_KEYWORDS.search(raw):
                continue
            # Mêmes filtres heuristiques qu'en mode strict : titre trop long ou ALL CAPS = actu/gossip
            if len(raw) > 80:
                continue
            stripped = re.sub(r"[^A-Za-z]", "", raw)
            if len(stripped) > 15 and stripped == stripped.upper():
                continue
        title = _extract_song_title_from_video(v["title"], artist_name)
        s = slugify(title)
        if s in seen or len(s) < 2:
            continue
        seen.add(s)
        tracks.append({
            "title": title,
            "track_number": len(tracks) + 1,
            "youtube_url": f"https://www.youtube.com/watch?v={v['id']}",
        })
    return tracks


def build_youtube_compilation(artist_name: str) -> list[dict]:
    """
    Dernier recours : recherche YouTube générale sur l'artiste
    et construit un album 'Principales œuvres'.
    """
    tracks: list[dict] = []
    for query in [
        f"{artist_name} clip officiel",
        f"{artist_name} musique",
        artist_name,
    ]:
        if tracks:
            break
        print(f"  → YouTube : {query}...")
        vids = search_youtube_videos(query, max_results=30)
        time.sleep(0.5)
        # Mode non-strict : la recherche est déjà ciblée sur l'artiste
        tracks = _videos_to_tracks(vids, artist_name, strict=False)

    if not tracks:
        print("  ✗ Aucune vidéo trouvée")
        return []

    print(f"  ✓ {len(tracks)} titre(s) récupérés")
    return [{
        "title": "Principales œuvres",
        "year": 2000,
        "slug": "principales-oeuvres",
        "format": "Compilation YouTube",
        "label": "",
        "genre": "",
        "description": "",
        "credits": None,
        "image_url": None,
        "tracks": tracks,
    }]


def enrich_albums_from_gstore_and_youtube(
    discography: list[dict],
    artist_name: str,
    album_playlists: dict[str, str] | None = None,
) -> None:
    """
    Pour les albums sans tracklist (typiquement issus de Wikipedia ou stubs Discogs) :
    0. Playlist explicite passée via --yt-playlist
    1. GStore Music
    1b. Playlist YouTube automatique (recherche par type=playlist)
    2. Recherche YouTube ciblée sur l'album
    3. Recherche YouTube générale → album "Principales œuvres"
    """
    print("\n📦 GStore Music — recherche des tracklists...")
    gstore_info = fetch_gstore_artist(artist_name)
    gstore_albums: list[dict] = []
    if gstore_info:
        gstore_albums = fetch_gstore_album_urls(*gstore_info)
        time.sleep(0.5)

    for album in discography:
        if album.get("tracks"):
            continue  # déjà renseigné (Discogs)

        # 0. Playlist explicite (--yt-playlist)
        if album_playlists and album["slug"] in album_playlists:
            playlist_url = album_playlists[album["slug"]]
            print(f"  → Playlist explicite : {album['title']}...")
            tracks = fetch_youtube_playlist(playlist_url)
            if tracks:
                album["tracks"] = tracks
                album["format"] = "YouTube Music"
                continue

        # 1. GStore
        gstore_match = next(
            (ga for ga in gstore_albums
             if slugify(ga["title"]) == slugify(album["title"])
             or slugify(album["title"]) in slugify(ga["title"])),
            None,
        )
        if gstore_match:
            print(f"  → {album['title']} sur GStore...")
            tracks = fetch_gstore_tracklist(gstore_match["url"])
            time.sleep(0.5)
            if tracks:
                album["tracks"] = tracks
                continue

        # 1b. Playlist YouTube automatique
        print(f"  → Playlist YouTube : {artist_name} {album['title']}...")
        playlist_url = search_youtube_playlist_url(f"{artist_name} {album['title']}")
        time.sleep(0.5)
        if playlist_url:
            print(f"    {playlist_url}")
            tracks = fetch_youtube_playlist(playlist_url)
            time.sleep(0.3)
            if tracks:
                album["tracks"] = tracks
                album["format"] = "YouTube Music"
                continue

        # 2. YouTube ciblé sur l'album (mode non-strict : la requête est déjà ciblée)
        print(f"  → YouTube : {artist_name} – {album['title']}...")
        vids = search_youtube_videos(f"{artist_name} {album['title']}", max_results=20)
        time.sleep(0.5)
        tracks = _videos_to_tracks(vids, artist_name, strict=False)

        # 2b. 2e tentative YouTube avec l'année si la première est vide
        if not tracks and album.get("year"):
            print(f"  → YouTube : {artist_name} {album['year']}...")
            vids = search_youtube_videos(f"{artist_name} {album['year']}", max_results=20)
            time.sleep(0.5)
            tracks = _videos_to_tracks(vids, artist_name, strict=False)

        if tracks:
            album["tracks"] = tracks
            album["format"] = "Compilation YouTube"
            continue

        # 3. Recherche générale (plusieurs requêtes) → Principales œuvres
        tracks = []
        for query in [
            f"{artist_name} clip officiel",
            f"{artist_name} musique",
            artist_name,
        ]:
            print(f"  → YouTube (général) : {query}...")
            vids = search_youtube_videos(query, max_results=30)
            time.sleep(0.5)
            tracks = _videos_to_tracks(vids, artist_name, strict=False)
            if tracks:
                break

        if tracks:
            album["title"]  = "Principales œuvres"
            album["slug"]   = "principales-oeuvres"
            album["format"] = "Compilation YouTube"
            album["tracks"] = tracks


# ---------------------------------------------------------------------------
# Enrichissement YouTube des tracks existants (URLs manquantes)
# ---------------------------------------------------------------------------

def enrich_with_youtube(artist_name: str, discography: list[dict]) -> None:
    """Cherche une URL YouTube pour chaque track qui n'en a pas encore."""
    to_enrich = [
        (album, track)
        for album in discography
        for track in album["tracks"]
        if not track.get("youtube_url")
    ]
    if not to_enrich:
        return
    total = len(to_enrich)
    print(f"\n  Recherche YouTube ({total} tracks sans URL)...")
    for done, (_, track) in enumerate(to_enrich, 1):
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
# Images — résolution des pochettes
# ---------------------------------------------------------------------------

def process_album_images(discography: list[dict], use_cloudinary: bool) -> None:
    """
    Pour chaque album :
    1. Garde l'image Discogs si présente (déjà dans album["image_url"])
    2. Fallback : miniature YouTube de la première piste avec une URL
    3. Si --cloudinary : upload vers Cloudinary pour obtenir une version 600×600 WebP
    """
    print(f"\n🖼  Résolution des pochettes ({len(discography)} albums)...")
    for album in discography:
        raw_url = album.get("image_url")

        if not raw_url:
            for track in album.get("tracks", []):
                yt_url = track.get("youtube_url")
                if yt_url:
                    raw_url = fetch_yt_thumbnail(yt_url)
                    if raw_url:
                        print(f"  ↩ Thumb YouTube → {album['title'][:40]}")
                        break

        if not raw_url:
            print(f"  ✗ Aucune image : {album['title'][:40]}")
            album["image_url"] = None
            continue

        if use_cloudinary:
            cl_url = upload_to_cloudinary(raw_url, album["slug"])
            album["image_url"] = cl_url or raw_url
        else:
            album["image_url"] = raw_url
            print(f"  ✓ Image : {album['title'][:40]}")


def upload_to_cloudinary(image_url: str, public_id: str) -> str | None:
    """Upload une image vers Cloudinary (600×600 WebP, crop centré)."""
    try:
        import cloudinary
        import cloudinary.uploader
    except ImportError:
        print("  ⚠ cloudinary non installé — pip install cloudinary")
        return None

    cloud_name = ENV.get("CLOUDINARY_CLOUD_NAME")
    api_key    = ENV.get("CLOUDINARY_API_KEY")
    api_secret = ENV.get("CLOUDINARY_API_SECRET")

    if not all([cloud_name, api_key, api_secret]):
        print("  ⚠ Credentials Cloudinary manquants dans .env.local")
        return None

    cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret)

    # Discogs images nécessitent parfois un download préalable (auth)
    file_to_upload: str | bytes = image_url
    tmp_path: str | None = None

    if "discogs.com" in image_url and DISCOGS_TOKEN:
        tmp_path = _download_to_tmp(image_url)
        if tmp_path:
            file_to_upload = tmp_path

    try:
        result = cloudinary.uploader.upload(
            file_to_upload,
            public_id=f"afan/albums/{public_id}",
            overwrite=True,
            resource_type="image",
            transformation=[
                {"width": 600, "height": 600, "crop": "fill", "gravity": "center"},
                {"format": "webp", "quality": "auto"},
            ],
        )
        url = result.get("secure_url", "")
        print(f"  ✓ Cloudinary : {url}")
        return url
    except Exception as e:
        print(f"  ⚠ Cloudinary : {e}")
        return None
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


def _download_to_tmp(url: str) -> str | None:
    """Télécharge une image dans un fichier temporaire, retourne le chemin."""
    headers = dict(BASE_HEADERS)
    if DISCOGS_TOKEN:
        headers["Authorization"] = f"Discogs token={DISCOGS_TOKEN}"
    try:
        r = requests.get(url, headers=headers, timeout=20, stream=True)
        if r.status_code == 200:
            suffix = ".jpg" if "jpeg" in r.headers.get("content-type", "") else ".jpg"
            fd, path = tempfile.mkstemp(suffix=suffix)
            with os.fdopen(fd, "wb") as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            return path
        print(f"  ⚠ Download image HTTP {r.status_code}")
    except Exception as e:
        print(f"  ⚠ Download image : {e}")
    return None


# ---------------------------------------------------------------------------
# DeepSeek — reformulation bio + extraction genres
# ---------------------------------------------------------------------------

DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"


def _deepseek_call(prompt: str, api_key: str, system: str = "", max_tokens: int = 600) -> str | None:
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})
    try:
        r = requests.post(
            DEEPSEEK_API_URL,
            json={"model": "deepseek-chat", "messages": messages, "max_tokens": max_tokens, "temperature": 0.7},
            headers=headers,
            timeout=30,
        )
        if r.status_code == 200:
            return r.json()["choices"][0]["message"]["content"].strip()
        print(f"  ⚠ DeepSeek HTTP {r.status_code} : {r.text[:200]}")
    except Exception as e:
        print(f"  ⚠ DeepSeek : {e}")
    return None


def clean_bio_deepseek(bio: str, artist_name: str, api_key: str) -> str:
    """Reformule la bio Wikipedia brute en texte narratif (2-3 § en français)."""
    if not bio or not api_key:
        return bio
    print("  🤖 DeepSeek — Reformulation de la bio...")
    result = _deepseek_call(
        f"Voici la biographie Wikipedia de {artist_name} :\n\n{bio}\n\n"
        "Réécris-la en 2-3 paragraphes courts et captivants. "
        "Réponds uniquement avec le texte de la biographie.",
        api_key,
        system=(
            "Tu es un rédacteur spécialisé dans la musique d'Afrique centrale. "
            "Transforme les textes Wikipedia bruts en biographies narratives et engageantes, "
            "en français, en conservant tous les faits essentiels."
        ),
        max_tokens=600,
    )
    if result:
        print(f"  ✓ Bio reformulée : {len(result)} car.")
        return result
    return bio


def generate_genre_tags_deepseek(bio: str, api_key: str) -> str:
    """Extrait 2-4 mots-clés de genres musicaux précis depuis la bio."""
    if not bio or not api_key:
        return ""
    print("  🤖 DeepSeek — Extraction des genres...")
    result = _deepseek_call(
        f"À partir de cette biographie, extrais les genres musicaux précis de cet artiste :\n{bio[:600]}",
        api_key,
        system=(
            "Tu es un expert en musique africaine. "
            "Réponds UNIQUEMENT avec 2-4 tags de genres séparés par ' / ' "
            "(ex: 'Makossa / Afrobeat' ou 'Folk-Pop Fang / Musique traditionnelle'). "
            "Pas d'autre texte."
        ),
        max_tokens=60,
    )
    return result or ""


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
        image_url: savedImageUrls[disc.slug] ?? disc.image_url ?? null,
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
        f"    image_url: {_ts_str(album.get('image_url'))},",
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
                        help="Handle de la chaîne YouTube officielle (ex: @APN245)")
    parser.add_argument("--no-youtube", action="store_true", help="Désactiver la recherche YouTube")
    parser.add_argument("--images", action="store_true",
                        help="Chercher les pochettes (Discogs thumb + YouTube fallback)")
    parser.add_argument("--cloudinary", action="store_true",
                        help="Uploader les pochettes vers Cloudinary en 600×600 WebP (implique --images)")
    parser.add_argument("--deepseek", action="store_true",
                        help="Reformuler la bio et extraire les genres via DeepSeek")
    parser.add_argument("--deepseek-key", metavar="KEY",
                        help="Clé API DeepSeek (sinon lu depuis DEEPSEEK_API_KEY dans .env.local)")
    parser.add_argument("--discogs-id", metavar="ID", type=int,
                        help="ID Discogs de l'artiste (évite la recherche auto et les ambiguïtés de noms)")
    parser.add_argument("--yt-playlist", action="append", metavar="SLUG=URL",
                        help="Playlist YouTube pour un album spécifique "
                             "(ex: feeling-love=https://www.youtube.com/playlist?list=...). "
                             "Peut être répété pour plusieurs albums.")
    args = parser.parse_args()

    artist_name = args.artist_name
    artist_slug = args.artist_slug
    filename    = args.filename or artist_slug

    # Parsing des playlists explicites --yt-playlist slug=url
    album_playlists: dict[str, str] = {}
    for item in (args.yt_playlist or []):
        if "=" in item:
            slug, _, url = item.partition("=")
            album_playlists[slug.strip()] = url.strip()
        else:
            print(f"  ⚠ --yt-playlist ignoré (format attendu SLUG=URL) : {item}")
    use_images      = args.images or args.cloudinary
    use_cloudinary  = args.cloudinary
    use_deepseek    = args.deepseek

    deepseek_key = args.deepseek_key or ENV.get("DEEPSEEK_API_KEY") or os.getenv("DEEPSEEK_API_KEY")
    if use_deepseek and not deepseek_key:
        print("⚠  --deepseek activé mais DEEPSEEK_API_KEY introuvable — DeepSeek désactivé")
        use_deepseek = False

    print(f"\n{'='*60}")
    print(f"  Artiste : {artist_name}")
    print(f"  Slug DB : {artist_slug}")
    print(f"  Fichier : src/seed/{filename}.ts")
    if args.yt_channel:
        print(f"  Chaîne  : {args.yt_channel}")
    flags = []
    if use_images:    flags.append("images")
    if use_cloudinary: flags.append("cloudinary")
    if use_deepseek:  flags.append("deepseek")
    if flags:
        print(f"  Options : {', '.join(flags)}")
    print(f"{'='*60}\n")

    # 1. Wikipedia
    print("📖 Wikipedia...")
    wiki = fetch_wikipedia_bio(artist_name)

    # 2. Discogs
    print("\n🎵 Discogs...")
    if args.discogs_id:
        discogs_id = args.discogs_id
        print(f"  ✓ Discogs ID forcé : {discogs_id}")
    else:
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

    # 3. Fallback : discographie Wikipedia si Discogs n'a rien
    if not discography:
        print("\n📖 Discographie Wikipedia (fallback)...")
        wikitext = fetch_wikipedia_wikitext(artist_name)
        if wikitext:
            discography = parse_wikipedia_discography(wikitext, artist_name)

    # 4. Fallback ultime YouTube
    if not discography and not args.no_youtube:
        if args.yt_channel:
            print(f"\n📺 Construction depuis la chaîne YouTube {args.yt_channel}...")
            discography = build_discography_from_youtube(args.yt_channel, artist_name)
        else:
            print(f"\n📺 Aucune source structurée — compilation YouTube générale...")
            discography = build_youtube_compilation(artist_name)

    # 5a. Enrichissement des tracklists + URLs YouTube
    elif discography and not args.no_youtube:
        # Albums sans tracklist (Wikipedia) → GStore puis YouTube
        if any(not a.get("tracks") for a in discography) or album_playlists:
            enrich_albums_from_gstore_and_youtube(discography, artist_name, album_playlists=album_playlists)
        # Tous les tracks sans URL YouTube
        enrich_with_youtube(artist_name, discography)

    # 5b. Pochettes
    if use_images and discography:
        process_album_images(discography, use_cloudinary=use_cloudinary)

    # 5c. DeepSeek
    if use_deepseek and deepseek_key:
        print("\n🤖 DeepSeek...")
        wiki["bio"] = clean_bio_deepseek(wiki["bio"], artist_name, deepseek_key)
        genre_tags = generate_genre_tags_deepseek(wiki["bio"], deepseek_key)
        if genre_tags:
            print(f"  ✓ Genres : {genre_tags}")
            # Injecter les tags dans les albums sans genre
            for album in discography:
                if not album.get("genre"):
                    album["genre"] = genre_tags

    # 6. Génération TypeScript
    print("\n📝 Génération TypeScript...")
    ts_content = generate_typescript(
        artist_name=artist_name,
        artist_slug=artist_slug,
        bio=wiki["bio"],
        born_year=wiki["born_year"],
        death_year=wiki["death_year"],
        discography=discography,
    )

    # 7. Écriture
    project_root = Path(__file__).parent.parent
    output_path = project_root / "src" / "seed" / f"{filename}.ts"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(ts_content, encoding="utf-8")

    # Preview JSON pour l'interface admin
    json_preview = {
        "artist_name": artist_name,
        "artist_slug": artist_slug,
        "bio": wiki["bio"][:600] + ("…" if len(wiki["bio"]) > 600 else ""),
        "born_year": wiki.get("born_year"),
        "death_year": wiki.get("death_year"),
        "albums": [
            {
                "title": a["title"],
                "year": a["year"],
                "slug": a["slug"],
                "format": a.get("format", ""),
                "label": a.get("label", ""),
                "genre": a.get("genre", ""),
                "image_url": a.get("image_url"),
                "track_count": len(a.get("tracks", [])),
            }
            for a in discography
        ],
    }
    json_path = project_root / "src" / "seed" / f"{filename}.json"
    json_path.write_text(json.dumps(json_preview, ensure_ascii=False, indent=2), encoding="utf-8")

    total_tracks = sum(len(a["tracks"]) for a in discography)
    yt_found     = sum(1 for a in discography for t in a["tracks"] if t.get("youtube_url"))
    img_found    = sum(1 for a in discography if a.get("image_url"))

    print(f"\n✅ {output_path}")
    print(f"   {len(discography)} albums · {total_tracks} tracks · {yt_found} YouTube URLs · {img_found} pochettes")
    print("\n⚠  Relire et compléter les descriptions avant de lancer le seed !\n")


if __name__ == "__main__":
    main()
