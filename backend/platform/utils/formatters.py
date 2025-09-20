# backend/platform/utils/formatters.py
from ..services import db

def _iter_tags(conn, video):
    """
    Works with:
      - old Flask-style: callable video.tags(conn)
      - Django ORM: video.tags.all()
      - stub: empty list
    """
    tags_attr = getattr(video, "tags", None)
    # method-style (Flask-era)
    if callable(tags_attr):
        try:
            return list(tags_attr(conn))
        except TypeError:
            # callable but no conn expected
            return list(tags_attr())
    # Django ORM manager-style
    if hasattr(tags_attr, "all"):
        return list(tags_attr.all())
    return []

def _iter_speakers(conn, video):
    speakers_attr = getattr(video, "speakers", None)
    if callable(speakers_attr):
        try:
            return list(speakers_attr(conn))
        except TypeError:
            return list(speakers_attr())
    if hasattr(speakers_attr, "all"):
        return list(speakers_attr.all())
    return []

class Formatter:
    @classmethod
    def video_simple(cls, conn, video):
        d = video.to_dict() if hasattr(video, "to_dict") else {
            "id": getattr(video, "id", None),
            "platform": getattr(video, "platform", "youtube"),
            "onPlatformId": getattr(video, "on_platform_id", None),
            "channel_id": getattr(video, "channel_id", getattr(getattr(video, "channel", None), "id", None)),
            "duration": getattr(video, "duration", 0),
            "title": getattr(video, "title", ""),
            "description": getattr(video, "description", ""),
            "upload_date": getattr(video, "upload_date", ""),
            "level": getattr(video, "level", "Beginner"),
            "premium": getattr(video, "premium", False),
        }
        d.pop("onPlatformId", None)  # hide in simple view

        # channel name (works with FK or raw id)
        channel_id = getattr(video, "channel_id", None)
        if channel_id is None and getattr(video, "channel", None):
            channel_id = video.channel.id
        cid2cname = {c.id: c.name for c in db.Channel.all(conn)}
        return {
            **d,
            "channelName": cid2cname.get(channel_id),
            "url": f"/watch/{getattr(video, 'id', None)}",
            "thumbnailUrl": f"/assets/thumbnail/{getattr(video, 'platform', 'youtube')}/{getattr(video, 'id', None)}.webp",
        }

    @classmethod
    def video_detail(cls, conn, video, tags=None, related_videos=None):
        d = video.to_dict() if hasattr(video, "to_dict") else {
            "id": getattr(video, "id", None),
            "platform": getattr(video, "platform", "youtube"),
            "onPlatformId": getattr(video, "on_platform_id", None),
            "channel_id": getattr(video, "channel_id", getattr(getattr(video, "channel", None), "id", None)),
            "duration": getattr(video, "duration", 0),
            "title": getattr(video, "title", ""),
            "description": getattr(video, "description", ""),
            "upload_date": getattr(video, "upload_date", ""),
            "level": getattr(video, "level", "Beginner"),
            "premium": getattr(video, "premium", False),
        }

        # trim description
        desc = d.get("description")
        if desc and len(desc) > 300:
            d["description"] = desc[:300] + "..."

        # fallback to pulling tags if not provided
        if tags is None:
            tags = _iter_tags(conn, video)

        ret = {
            "video": {
                **d,
                "url": f"/watch/{getattr(video, 'id', None)}",
                "thumbnailUrl": f"/assets/thumbnail/{getattr(video, 'platform', 'youtube')}/{getattr(video, 'id', None)}.webp",
                "tags": [getattr(t, "name", str(t)) for t in tags],
            }
        }

        if related_videos is not None:
            # Put the current one first if present
            try:
                related_videos = sorted(related_videos, key=lambda v: getattr(v, "id", None) == getattr(video, "id", None), reverse=True)
            except Exception:
                pass
            ret["relatedVideos"] = [cls.video_simple(conn, v) for v in related_videos]

        return ret
