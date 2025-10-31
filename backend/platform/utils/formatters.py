# backend/platform/utils/formatters.py
from __future__ import annotations

from typing import Any, Dict, Iterable, List

from ..services import db


def _materialise_collection(value: Any, conn) -> List[Any]:
    """Best-effort conversion of tag/speaker collections to a list."""

    if value is None:
        return []

    if callable(value):
        try:
            value = value(conn)
        except TypeError:
            value = value()
        except Exception:
            return []

    if hasattr(value, "all"):
        try:
            value = value.all()
        except Exception:
            return []

    if isinstance(value, Iterable) and not isinstance(value, (str, bytes, dict)):
        return [item for item in value if item is not None]

    return [value]


def _iter_tags(conn, video) -> List[Any]:
    return _materialise_collection(getattr(video, "tags", None), conn)


def _iter_speakers(conn, video) -> List[Any]:
    return _materialise_collection(getattr(video, "speakers", None), conn)


def _first_non_empty_text(*values: Any) -> str:
    for value in values:
        if value is None:
            continue
        text = str(value).strip() if isinstance(value, str) else str(value)
        if text.strip():
            return text.strip()
    return ""


class Formatter:
    """Helpers that turn database rows into lightweight browse payloads."""

    @staticmethod
    def _get(obj: Any, *names: str, default=None):
        for name in names:
            if obj is None:
                continue
            if hasattr(obj, name):
                value = getattr(obj, name)
                if callable(value):
                    try:
                        value = value()
                    except TypeError:
                        continue
                if value is not None:
                    return value
        return default

    @staticmethod
    def _channel_name_from_db(conn, channel_id) -> str:
        if channel_id in (None, ""):
            return ""
        try:
            return {c.id: c.name for c in db.Channel.all(conn)}.get(channel_id, "")
        except Exception:
            return ""

    @staticmethod
    def video_simple(conn, video) -> Dict[str, Any]:
        vid = Formatter._get(video, "id", "pk", "video_id")
        if vid is not None:
            vid = str(vid)

        title = _first_non_empty_text(
            Formatter._get(video, "title", default=None),
            Formatter._get(video, "name", default=None),
            Formatter._get(video, "video_title", "videoTitle", "title_text", default=None),
            Formatter._get(video, "video_name_on_youtube", "videoNameOnYoutube", default=None),
        )
        if not title:
            # Sometimes the title may live inside a nested metadata object
            title = _first_non_empty_text(
                Formatter._get(getattr(video, "metadata", None), "title", default=None),
                Formatter._get(getattr(video, "video", None), "title", default=None),
                Formatter._get(getattr(video, "metadata", None), "video_name_on_youtube", default=None),
            )

        channel_name = (
            Formatter._get(video, "channel_name", "channelName")
            or Formatter._get(getattr(video, "channel", None), "name", default="")
        )
        channel_id = Formatter._get(
            video,
            "channel_id",
            "channelId",
            default=Formatter._get(getattr(video, "channel", None), "id", default=None),
        )
        if not channel_name:
            channel_name = Formatter._channel_name_from_db(conn, channel_id)

        level = Formatter._get(video, "level", "levelLabel", default="")
        upload_date = Formatter._get(
            video,
            "upload_date",
            "published",
            "publish_date",
            "PublishDate",
            "date",
            default=None,
        )
        premium = bool(
            Formatter._get(
                video,
                "premium",
                "is_premium",
                "requires_subscription",
                "isPremium",
                default=False,
            )
        )

        on_platform_id = Formatter._get(
            video,
            "on_platform_id",
            "youtube_id",
            "external_id",
            "platform_id",
            "onPlatformId",
            default=None,
        )

        thumb = Formatter._get(video, "thumbnail_url", "thumbnailUrl", "thumbnail", default=None)
        if thumb is None and on_platform_id:
            thumb = f"https://img.youtube.com/vi/{on_platform_id}/hqdefault.jpg"
        if thumb is None and vid is not None:
            platform = Formatter._get(video, "platform", default="youtube") or "youtube"
            thumb = f"/assets/thumbnail/{platform}/{vid}.webp"

        duration = Formatter._get(video, "duration", "length", "video_length", default=0)
        try:
            duration_int = int(duration)
        except (TypeError, ValueError):
            duration_int = 0

        payload = {
            "id": vid,
            "title": title or "Untitled video",
            "channelName": channel_name,
            "channel_id": channel_id,
            "level": level,
            "upload_date": upload_date,
            "premium": premium,
            "thumbnail_url": thumb,
            "thumbnailUrl": thumb,
            "on_platform_id": on_platform_id,
            "duration": duration_int,
        }

        return payload

    @staticmethod
    def video_detail(conn, video, tags=None, related_videos=None) -> Dict[str, Any]:
        base = Formatter.video_simple(conn, video)

        duration = Formatter._get(video, "duration", "length", "video_length", default=0)
        description = Formatter._get(video, "description", "summary", "details", default="")
        if isinstance(description, str) and len(description) > 300:
            description = description[:300] + "..."

        platform = Formatter._get(video, "platform", default="youtube") or "youtube"
        url = f"/watch/{base['id']}" if base.get("id") else None

        tag_objects = tags if tags is not None else _iter_tags(conn, video)
        tag_names = [getattr(t, "name", str(t)) for t in tag_objects if t is not None]

        speaker_objects = _iter_speakers(conn, video)
        speaker_names = [getattr(s, "name", str(s)) for s in speaker_objects if s is not None]

        detail = {
            **base,
            "platform": platform,
            "duration": duration,
            "description": description,
            "url": url,
            "tags": tag_names,
        }
        if speaker_names:
            detail["speakers"] = speaker_names

        response = {"video": detail}

        if related_videos is not None:
            try:
                # keep current video first if present
                related_sorted = sorted(
                    related_videos,
                    key=lambda v: getattr(v, "id", None) == base.get("id"),
                    reverse=True,
                )
            except Exception:
                related_sorted = list(related_videos)
            response["relatedVideos"] = [Formatter.video_simple(conn, v) for v in related_sorted]

        return response
