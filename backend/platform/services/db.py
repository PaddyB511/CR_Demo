# Uses Django ORM models (no more Flask-style classes).
from contextlib import contextmanager
from django.db.models import Count, Q
from backend.platform import models

@contextmanager
def connect_context():
    # Kept for API compatibility with the old code; ORM doesn’t need it.
    yield None

# Adapter for “Level.all()” calls in views:
class Level:
    @classmethod
    def all(cls):
        return [label for (value, label) in models.Video.LEVEL_CHOICES]

# Simple adapters so existing views can call .all(conn)
class Channel:
    @classmethod
    def all(cls, conn=None):
        return list(models.Channel.objects.all())

class Speaker:
    @classmethod
    def all(cls, conn=None):
        return list(models.Speaker.objects.all())

class Tag:
    @classmethod
    def all(cls, conn=None):
        return list(models.Tag.objects.all())

    @classmethod
    def stat(cls, conn, video_ids):
        # return iterable of (tag.name, count) for videos in list
        qs = models.Tag.objects.filter(videos__id__in=video_ids).annotate(c=Count("videos"))
        return [(t.name, t.c) for t in qs]

class User:
    """
    Minimal session/dict adapter so views keep working.
    We’re *not* replacing your existing django.contrib.auth user.
    """
    @classmethod
    def anonymous(cls):
        return type("Anon", (), {
            "id": -1, "premium": False, "to_dict": lambda self={}: {"id": -1, "premium": False}
        })()

    @classmethod
    def from_email(cls, conn, email):
        # Your real users live in backend.users; the views only need a dict in session.
        # Keep returning None here; the login/registration flow is separate.
        return None

    @staticmethod
    def insert_watch_data(conn, user_id, vid, elapsed, now, t_start, t_end):
        # Implement later when you add a watch log model
        pass

    @staticmethod
    def insert_off_platform_time(conn, user_id, duration_seconds, start, end, comment):
        # Implement later when you add an off-platform log model
        pass


class Video:
    @classmethod
    def _apply_filters(cls, qs, *, filters, speaker_ids, tag_ids, min_duration, max_duration, text):
        if filters.get("level"):
            qs = qs.filter(level__in=filters["level"])
        if filters.get("channel_id"):
            qs = qs.filter(channel_id__in=[int(c) for c in filters["channel_id"] if c is not None])
        if speaker_ids:
            qs = qs.filter(speakers__id__in=[int(s) for s in speaker_ids if s is not None])
        if tag_ids:
            qs = qs.filter(tags__id__in=[int(t) for t in tag_ids if t is not None])
        if min_duration is not None:
            qs = qs.filter(duration__gte=min_duration * 60 if min_duration < 1000 else min_duration)
        if max_duration is not None:
            qs = qs.filter(duration__lte=max_duration * 60 if max_duration < 1000 else max_duration)
        if text:
            qs = qs.filter(Q(title__icontains=text) | Q(description__icontains=text))
        return qs.distinct()

    @classmethod
    def all(cls, conn=None, *, sort_order="new", page=0, filters=None,
            speaker_ids=None, tag_ids=None, user_id=None, hide_watched=False,
            min_duration=None, max_duration=None, text=""):
        filters = filters or {}
        qs = models.Video.objects.select_related("channel").prefetch_related("tags", "speakers")
        qs = cls._apply_filters(qs, filters=filters, speaker_ids=speaker_ids, tag_ids=tag_ids,
                                min_duration=min_duration, max_duration=max_duration, text=text)

        if sort_order == "old":
            qs = qs.order_by("upload_date")
        elif sort_order == "long":
            qs = qs.order_by("-duration")
        elif sort_order == "short":
            qs = qs.order_by("duration")
        else:  # "new" default
            qs = qs.order_by("-upload_date", "-id")

        from ..services import constants as backend_constants
        page_size = backend_constants.PAGE_SIZE
        if page is not None:
            start = page * page_size
            end = start + page_size
            qs = qs[start:end]
        return list(qs)

    @classmethod
    def get(cls, conn, video_id, user_id=None):
        # Accept either numeric PK or on_platform_id (YouTube id)
        obj = None
        try:
            obj = models.Video.objects.select_related("channel").prefetch_related("tags", "speakers").get(pk=int(video_id))
        except Exception:
            obj = models.Video.objects.select_related("channel").prefetch_related("tags", "speakers").filter(on_platform_id=str(video_id)).first()
        return obj

    
 
