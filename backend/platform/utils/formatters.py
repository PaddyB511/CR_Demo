# backend/platform/utils/formatters.py
from ..services import db

def _iter_tags(conn, video):
    tags_attr = getattr(video, "tags", None)
    if callable(tags_attr):
        try:
            return list(tags_attr(conn))
        except TypeError:
            return list(tags_attr())
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
        d.pop("onPlatformId", None)
        channel_id = getattr(video, "channel_id", None) or getattr(getattr(video, "channel", None), "id", None)
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
        desc = d.get("description")
        if desc and len(desc) > 300:
            d["description"] = desc[:300] + "..."
        tags = tags if tags is not None else _iter_tags(conn, video)
        ret = {
            "video": {
                **d,
                "url": f"/watch/{getattr(video, 'id', None)}",
                "thumbnailUrl": f"/assets/thumbnail/{getattr(video, 'platform', 'youtube')}/{getattr(video, 'id', None)}.webp",
                "tags": [getattr(t, "name", str(t)) for t in tags],
            }
        }
        if related_videos is not None:
            try:
                related_videos = sorted(
                    related_videos,
                    key=lambda v: getattr(v, "id", None) == getattr(video, "id", None),
                    reverse=True,
                )
            except Exception:
                pass
            ret["relatedVideos"] = [cls.video_simple(conn, v) for v in related_videos]
        return ret
