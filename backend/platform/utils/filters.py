from backend import utils as backend_utils
from ..services import db

_TAGNAME2ID = None
_CHANNEL_NAME2ID = None
_SPEAKER_NAME2ID = None
_CHANNEL_ID2NAME = None
_SPEAKER_ID2NAME = None

def _cid2name(conn):
    global _CHANNEL_ID2NAME
    if _CHANNEL_ID2NAME is None:
        _CHANNEL_ID2NAME = {c.id: c.name for c in db.Channel.all(conn)}
    return _CHANNEL_ID2NAME

def _cname2id(conn):
    global _CHANNEL_NAME2ID
    if _CHANNEL_NAME2ID is None:
        _CHANNEL_NAME2ID = {c.name: c.id for c in db.Channel.all(conn)}
    return _CHANNEL_NAME2ID

def _tagname2id(conn):
    global _TAGNAME2ID
    if _TAGNAME2ID is None:
        _TAGNAME2ID = {t.name: t.id for t in db.Tag.all(conn)}
    return _TAGNAME2ID

def _sname2id(conn):
    global _SPEAKER_NAME2ID
    if _SPEAKER_NAME2ID is None:
        _SPEAKER_NAME2ID = {s.name: s.id for s in db.Speaker.all(conn)}
    return _SPEAKER_NAME2ID

def _dedupe_preserve_order(values):
    seen = set()
    ordered = []
    for value in values:
        if value in seen or value is None:
            continue
        seen.add(value)
        ordered.append(value)
    return ordered


def _merge_query_values(args, plural_key: str, singular_key: str):
    values = []
    # Accept repeated singular keys (?level=A&level=B)
    if hasattr(args, "getlist"):
        values.extend(args.getlist(singular_key))
    else:
        v = args.get(singular_key)
        if v:
            values.append(v)

    # Accept comma-separated plural keys (?levels=A,B)
    plural_value = args.get(plural_key)
    if plural_value:
        values.extend(backend_utils.parse_comma_separated_string(plural_value))

    # Also allow singular keys with trailing [] that some clients send (?level[]=A)
    bracket_key = f"{singular_key}[]"
    if hasattr(args, "getlist") and bracket_key in args:
        values.extend(args.getlist(bracket_key))

    return _dedupe_preserve_order(v for v in values if v)


def parse_filters(conn, args):
    filters = {}

    level_values = _merge_query_values(args, "levels", "level")
    if level_values:
        filters["level"] = level_values

    topic_values = _merge_query_values(args, "topics", "topic")
    if topic_values:
        filters["tag"] = topic_values

    channel_values = _merge_query_values(args, "channels", "channel")
    if channel_values:
        filters["channel"] = channel_values

    speaker_values = _merge_query_values(args, "speakers", "speaker")
    if not speaker_values:
        # Legacy DRF endpoint sends speakers__name params
        speaker_values = _merge_query_values(args, "speakers__name", "speakers__name")
    if speaker_values:
        filters["speaker"] = speaker_values

    if (vs := filters.get("level")) is not None:
        filters["level"] = [v for v in vs]

    if (vs := filters.get("channel")) is not None:
        del filters["channel"]
        filters["channel_id"] = [
            str(_cname2id(conn).get(v))
            for v in vs
            if _cname2id(conn).get(v) is not None
        ]

    tag_ids = None
    if (vs := filters.pop("tag", None)) is not None:
        tag_ids = [
            str(_tagname2id(conn).get(v))
            for v in vs
            if _tagname2id(conn).get(v) is not None
        ]

    speaker_ids = None
    if (vs := filters.pop("speaker", None)) is not None:
        speaker_ids = [
            str(_sname2id(conn).get(v))
            for v in vs
            if _sname2id(conn).get(v) is not None
        ]

    durations = args.get("durations")
    min_duration = max_duration = None
    if durations:
        try:
            d1, d2 = durations.split(",")
            min_duration = float(d1) if d1 else None
            max_duration = float(d2) if d2 else None
        except Exception:
            min_duration = max_duration = None

    min_override = args.get("min_duration")
    max_override = args.get("max_duration")
    if min_override not in (None, ""):
        try:
            min_duration = float(min_override)
        except Exception:
            pass
    if max_override not in (None, ""):
        try:
            max_duration = float(max_override)
        except Exception:
            pass

    hide_watched = False
    for key in ("hide-watched", "hide_watched", "hideWatched"):
        value = args.get(key)
        if isinstance(value, str) and value.lower() in {"1", "true", "yes"}:
            hide_watched = True
            break

    sort_order = args.get("sort", "new").lower()
    sort_alias = {
        "recent": "new",
        "popular": "new",
        "duration": "long",
        "duration_asc": "short",
        "duration_desc": "long",
    }
    sort_order = sort_alias.get(sort_order, sort_order)

    text = args.get("text") or args.get("search") or ""
    return sort_order, (min_duration, max_duration), filters, speaker_ids, tag_ids, hide_watched, text
