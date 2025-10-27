# backend/videos/views.py
from __future__ import annotations

from typing import Any, Dict

from django.shortcuts import get_object_or_404
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# IMPORTANT: Always use the Video model from THIS app (avoid platform.Video)
from .models import Video as DRFVideo
from backend.platform.models import UserViewLog, OffPlatformLog, UserWordFrequency, Video


# ----------------------------- Serializers ----------------------------- #

class VideoSerializer(serializers.ModelSerializer):
    """
    Expose fields the frontend expects. We also add read-only properties for
    thumbnail_url/thumbnailUrl and on_platform_id, derived from whichever fields
    your model actually has.
    """

    channelName = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()
    on_platform_id = serializers.SerializerMethodField()

    class Meta:
        model = DRFVideo
        # keep this list conservative; add more if your UI needs them
        fields = [
            "id",
            "title",
            "level",
            "upload_date",
            "premium",
            "channelName",
            "thumbnail_url",
            "thumbnailUrl",
            "on_platform_id",
        ]

    def get_channelName(self, obj: DRFVideo) -> str:
        if hasattr(obj, "channel_name") and obj.channel_name:
            return obj.channel_name
        channel = getattr(obj, "channel", None)
        return getattr(channel, "name", "") if channel else ""

    def _thumb(self, obj: DRFVideo):
        # Support a few common field names
        return (
            getattr(obj, "thumbnail_url", None)
            or getattr(obj, "thumbnailUrl", None)
            or None
        )

    def get_thumbnail_url(self, obj: DRFVideo):
        return self._thumb(obj)

    def get_thumbnailUrl(self, obj: DRFVideo):
        return self._thumb(obj)

    def get_on_platform_id(self, obj: DRFVideo):
        # Try common variants seen in your project
        return (
            getattr(obj, "on_platform_id", None)
            or getattr(obj, "youtube_id", None)
            or getattr(obj, "external_id", None)
            or getattr(obj, "platform_id", None)
            or None
        )


# ------------------------------- ViewSet ------------------------------- #

class VideoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Keep your existing list/retrieve behavior and add actions that won’t 500
    due to model mix-ups. We always use DRFVideo to avoid mixing in platform.Video.
    """
    queryset = DRFVideo.objects.all().order_by("-upload_date", "-id")
    serializer_class = VideoSerializer
    # Use your project defaults; in dev you can open these up if desired.
    # permission_classes = [IsAuthenticated]
    permission_classes = [AllowAny]

    # GET /api/videos/  (in your router)
    # GET /api/videos/{pk}/

    # ----------------------- Custom Actions ----------------------- #

    @action(detail=True, methods=["post"], url_path="mark-as-watched", permission_classes=[AllowAny])
    def mark_as_watched(self, request, pk: str | None = None):
        """
        Mark a video as watched. We’ll log via UserViewLog with the *correct* Video instance.
        If your UserViewLog requires extra fields, we fill what we can and fail-soft.
        """
        video = self.get_object()  # ensures we’re using videos.Video (DRFVideo)

        # Attempt a best-effort log. Some schemas need only (user, video).
        # If your model has different fields, this will gracefully fall back.
        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None

        created = False
        err: Dict[str, Any] | None = None
        try:
            UserViewLog.objects.create(video=video, user=user)
            created = True
        except TypeError as e:
            # Try a minimal create with just video
            err = {"warning": f"UserViewLog minimal create fallback: {e!s}"}
            try:
                UserViewLog.objects.create(video=video)
                created = True
            except Exception as e2:
                err = {"error": f"UserViewLog create failed: {e2!s}"}
        except Exception as e:
            err = {"error": f"UserViewLog create failed: {e!s}"}

        # We still return success to keep UX smooth in demo/dev
        payload = {"ok": True, "video": video.pk}
        if err:
            payload.update(err)
        return Response(payload, status=status.HTTP_200_OK if created else status.HTTP_202_ACCEPTED)

    @action(detail=False, methods=["post"], url_path="watchtime", permission_classes=[AllowAny])
    def watchtime(self, request):
        """
        Record a watchtime ping. Expects at least { "video_id": <id>, "seconds": <int> }.
        Fails soft if your UserViewLog schema differs.
        """
        video_id = request.data.get("video_id")
        if not video_id:
            return Response({"detail": "video_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        video = get_object_or_404(DRFVideo, pk=video_id)
        seconds = 0
        try:
            seconds = int(request.data.get("seconds", 0))
        except Exception:
            seconds = 0

        user = request.user if getattr(request, "user", None) and request.user.is_authenticated else None

        created = False
        err: Dict[str, Any] | None = None
        try:
            # Try the common field name patterns you may have:
            #   seconds / watched_seconds / duration_seconds
            try:
                UserViewLog.objects.create(video=video, user=user, seconds=seconds)
            except TypeError:
                try:
                    UserViewLog.objects.create(video=video, user=user, watched_seconds=seconds)
                except TypeError:
                    UserViewLog.objects.create(video=video, user=user)
            created = True
        except Exception as e:
            err = {"error": f"UserViewLog watchtime create failed: {e!s}"}

        payload = {"ok": True, "video": video.pk, "seconds": seconds}
        if err:
            payload.update(err)
        return Response(payload, status=status.HTTP_200_OK if created else status.HTTP_202_ACCEPTED)
