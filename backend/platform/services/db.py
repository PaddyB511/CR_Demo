# backend/platform/services/db.py
"""
Thin service layer the views call. Uses Django ORM only.
"""

from contextlib import contextmanager
from django.contrib.auth import get_user_model
from django.utils import timezone

from backend.platform import models as m

UserModel = get_user_model()


# ------------------------
# connection context (no-op)
# ------------------------
@contextmanager
def connect_context():
    yield None


# ------------------------
# Simple pass-through facades
# ------------------------
class Channel:
    @staticmethod
    def all(_conn=None):
        return m.Channel.objects.all()


class Speaker:
    @staticmethod
    def all(_conn=None):
        return m.Speaker.objects.all()


class Tag:
    @staticmethod
    def all(_conn=None):
        return m.Tag.objects.all()

    @staticmethod
    def stat(_conn, video_ids):
        """
        Return list[(tag_name, count)] for given video ids.
        """
        from django.db.models import Count
        qs = (
            m.Tag.objects
            .filter(videos__id__in=video_ids)
            .values("name")
            .annotate(count=Count("name"))
            .order_by()
        )
        return [(row["name"], row["count"]) for row in qs]


class Level:
    @staticmethod
    def all():
        # Keep same names your frontend expects
        return ["Beginner", "Beginner 2", "Intermediate 1", "Intermediate 2", "Advanced", "Native Content"]


class Video:
    @staticmethod
    def get(_conn, video_id, user_id=None):
        """
        Accept numeric PK or YouTube on_platform_id string.
        """
        obj = None
        # numeric?
        try:
            obj = m.Video.objects.filter(pk=int(video_id)).first()
        except Exception:
            obj = None
        if not obj:
            obj = m.Video.objects.filter(on_platform_id=str(video_id)).first()
        return obj

    @staticmethod
    def all(
        _conn,
        *,
        sort_order="new",
        page=0,
        filters=None,
        speaker_ids=None,
        tag_ids=None,
        user_id=None,
        hide_watched=False,
        min_duration=None,
        max_duration=None,
        text="",
    ):
        from django.db.models import Q

        qs = m.Video.objects.all()

        # text search (title/description)
        if text:
            qs = qs.filter(Q(title__icontains=text) | Q(description__icontains=text))

        # levels
        if filters and filters.get("level"):
            qs = qs.filter(level__in=filters["level"])

        # channel filter expects channel_id list of strings
        if filters and filters.get("channel_id"):
            qs = qs.filter(channel_id__in=[int(c) for c in filters["channel_id"]])

        # speakers(tags) many-to-many
        if speaker_ids:
            qs = qs.filter(speakers__id__in=[int(s) for s in speaker_ids]).distinct()

        if tag_ids:
            qs = qs.filter(tags__id__in=[int(t) for t in tag_ids]).distinct()

        # duration
        if min_duration is not None:
            qs = qs.filter(duration__gte=int(min_duration) * 60 if min_duration > 1000 else int(min_duration))
        if max_duration is not None:
            qs = qs.filter(duration__lte=int(max_duration) * 60 if max_duration > 1000 else int(max_duration))

        # sort
        if sort_order == "new":
            qs = qs.order_by("-upload_date", "-id")
        elif sort_order == "old":
            qs = qs.order_by("upload_date", "id")
        elif sort_order == "short":
            qs = qs.order_by("duration")
        elif sort_order == "long":
            qs = qs.order_by("-duration")
        else:
            qs = qs.order_by("-id")

        # paging
        PAGE_SIZE = 50
        if page is not None:
            start = int(page) * PAGE_SIZE
            end = start + PAGE_SIZE
            return list(qs[start:end])
        return list(qs)


class User:
    @staticmethod
    def anonymous():
        # Mirror your old shape
        return type("Anon", (), {
            "to_dict": lambda: {
                "id": -1, "email": "", "name": "", "premium": False,
                "dailyGoalMinutes": 15, "finalGoalMinutes": None,
                "finalGoalDate": None, "premiumClaimedWithEmail": None
            }
        })()

    # --- writes used by the dashboard/views ---
    @staticmethod
    def insert_watch_data(_conn, user_id, vid, elapsed, now, t_start, t_end):
        try:
            user = UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return

        video = m.Video.objects.filter(pk=vid).first() or m.Video.objects.filter(on_platform_id=str(vid)).first()
        aware_now = now if timezone.is_aware(now) else timezone.make_aware(now)

        m.UserViewLog.objects.create(
            user=user,
            video=video,
            watch_date=aware_now,
            watch_time=int(elapsed),
            video_time_start=float(t_start),
            video_time_end=float(t_end),
        )

    @staticmethod
    def insert_off_platform_time(_conn, user_id, duration_seconds, start, end, comment):
        try:
            user = UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            return

        def mk(dt):
            return dt if timezone.is_aware(dt) else timezone.make_aware(dt)

        m.OffPlatformLog.objects.create(
            user=user,
            time_duration=int(duration_seconds),
            date_start=mk(start),
            date_end=mk(end),
            comment=comment or "",
        )
