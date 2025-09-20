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

def parse_filters(conn, args):
    filters = {}
    for k_bef, k_aft in [("levels", "level"), ("topics", "tag"), ("channels", "channel"), ("speakers", "speaker")]:
        s = args.get(k_bef)
        if s:
            vs = backend_utils.parse_comma_separated_string(s)
            filters[k_aft] = vs

    if (vs := filters.get("level")) is not None:
        filters["level"] = [v for v in vs]

    if (vs := filters.get("channel")) is not None:
        del filters["channel"]
        filters["channel_id"] = [str(_cname2id(conn).get(v)) for v in vs if _cname2id(conn).get(v) is not None]

    tag_ids = None
    if (vs := filters.pop("tag", None)) is not None:
        tag_ids = [str(_tagname2id(conn).get(v)) for v in vs if _tagname2id(conn).get(v) is not None]

    speaker_ids = None
    if (vs := filters.pop("speaker", None)) is not None:
        speaker_ids = [str(_sname2id(conn).get(v)) for v in vs if _sname2id(conn).get(v) is not None]

    durations = args.get("durations")
    min_duration = max_duration = None
    if durations:
        try:
            d1, d2 = durations.split(",")
            min_duration = float(d1) if d1 else None
            max_duration = float(d2) if d2 else None
        except Exception:
            pass

    hide_watched = args.get('hide-watched', 'false') == 'true'
    sort_order = args.get("sort", "new").lower()
    text = args.get("text", "")
    return sort_order, (min_duration, max_duration), filters, speaker_ids, tag_ids, hide_watched, text
