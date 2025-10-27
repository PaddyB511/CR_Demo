# backend/platform/utils/formatters.py
from __future__ import annotations

from typing import Any, Dict


class Formatter:
    """
    Minimal formatters used by platform browse endpoints.
    We keep this defensive so it works with either raw ORM models or
    any legacy objects that might still be passed in.
    """

    @staticmethod
    def _get(obj: Any, *names: str, default=None):
        for n in names:
            if hasattr(obj, n):
                val = getattr(obj, n)
                # resolve callables (legacy accessors)
                if callable(val):
                    try:
                        val = val()
                    except TypeError:
                        # some old methods expected args; just skip
                        pass
                if val is not None:
                    return val
        return default

    @staticmethod
    def video_simple(_unused_conn: Any, v: Any) -> Dict[str, Any]:
        """
        Shape expected by the frontend:
          id, title, channelName, level, upload_date, premium,
          thumbnail_url / thumbnailUrl, on_platform_id
        The UI will fall back to YouTube thumbnail when on_platform_id is present.
        """
        vid = Formatter._get(v, "id")
        title = Formatter._get(v, "title", default="")
        # Channel name can live in v.channel.name or a denormalized 'channel_name'
        channel_name = (
            Formatter._get(v, "channel_name")
            or (getattr(getattr(v, "channel", None), "name", None))
            or ""
        )
        level = Formatter._get(v, "level", default="")
        upload_date = Formatter._get(v, "upload_date", default=None)
        premium = bool(Formatter._get(v, "premium", default=False))

        # thumbnails / ids
        # try canonical thumbnail field(s)
        thumb = f"https://img.youtube.com/vi/{getattr(v, 'on_platform_id', '')}/hqdefault.jpg"
        ret["thumbnailUrl"] = thumb
        
        # try various possible field names for the YouTube/platform id
        on_platform_id = (
            Formatter._get(v, "on_platform_id")
            or Formatter._get(v, "youtube_id")
            or Formatter._get(v, "external_id")
            or Formatter._get(v, "platform_id")
            or None
        )

        # Return both snake_case and camelCase for thumbnail for maximum compatibility
        return {
            "id": vid,
            "title": title,
            "channelName": channel_name,
            "level": level,
            "upload_date": upload_date,
            "premium": premium,
            "thumbnail_url": thumb,
            "thumbnailUrl": thumb,
            "on_platform_id": on_platform_id,
        }
