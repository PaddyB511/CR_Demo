"""View logic for the public video catalogue endpoints.

This file wires the DRF router that lives in ``backend/urls.py`` to the data that
now lives under ``backend.platform``.  The previous revision of this module still
referenced the legacy ``backend.videos`` models which no longer contain data,
causing Django to blow up when ``ChannelViewSet``/``TagViewSet``/``SpeakerViewSet``
were imported.  We now point everything at the canonical platform models and
expose the missing viewsets again.
"""

from __future__ import annotations

from typing import Any, Dict, Iterable, List, Type

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from backend.platform.models import (
    Channel,
    Speaker,
    Tag,
    UserViewLog,
    Video,
)
from backend.videos.serializers import (
    ChannelSerializer,
    SpeakerSerializer,
    TagSerializer,
    VideoDetailSerializer,
    VideoSerializer,
)


class BaseReadOnlyViewSet(viewsets.ReadOnlyModelViewSet):
    """Small helper to ensure our read-only viewsets share permissions."""

    permission_classes = [AllowAny]


class ChannelViewSet(BaseReadOnlyViewSet):
    """List channels from the platform catalogue."""

    queryset = Channel.objects.all().order_by("name")
    serializer_class = ChannelSerializer


class TagViewSet(BaseReadOnlyViewSet):
    """Expose the available tag taxonomy."""

    queryset = Tag.objects.all().order_by("name")
    serializer_class = TagSerializer


class SpeakerViewSet(BaseReadOnlyViewSet):
    """Expose speakers linked to videos."""

    queryset = Speaker.objects.all().order_by("name")
    serializer_class = SpeakerSerializer


class VideoViewSet(BaseReadOnlyViewSet):
    """List/retrieve videos from the platform catalogue."""

    queryset = (
        Video.objects.all()
        .select_related("channel")
        .prefetch_related("tags", "speakers")
        .order_by("-upload_date", "-id")
    )
    serializer_class = VideoSerializer
    search_fields = (
        "title",
        "description",
        "channel__name",
        "tags__name",
        "speakers__name",
    )
    ordering_fields = (
        "upload_date",
        "duration",
        "rating",
        "level",
        "created_at",
        "id",
    )
    ordering = ("-upload_date", "-id")

    def get_serializer_class(self) -> Type[VideoSerializer]:  # type: ignore[override]
        if self.action == "retrieve":
            return VideoDetailSerializer
        return super().get_serializer_class()

    # ----------------------- Query helpers ----------------------- #

    @staticmethod
    def _parse_multi(values: Iterable[str]) -> List[str]:
        """Expand comma-separated values and strip whitespace."""

        parsed: List[str] = []
        for raw in values:
            if raw is None:
                continue
            if isinstance(raw, str):
                pieces = [segment.strip() for segment in raw.split(",") if segment.strip()]
                if pieces:
                    parsed.extend(pieces)
                    continue
                stripped = raw.strip()
                if stripped:
                    parsed.append(stripped)
            else:  # pragma: no cover - defensive; QueryDict yields str
                parsed.append(str(raw))
        return parsed

    def filter_queryset(self, queryset):  # type: ignore[override]
        queryset = super().filter_queryset(queryset)
        params = getattr(self.request, "query_params", {})

        def values_for(*names: str) -> List[str]:
            if not params:
                return []
            collected: List[str] = []
            for name in names:
                if hasattr(params, "getlist"):
                    collected.extend(params.getlist(name))
                else:  # pragma: no cover - QueryDict always has getlist
                    value = params.get(name)
                    if value is not None:
                        collected.append(value)
            return self._parse_multi(collected)

        channel_values = values_for("channel", "channel_id", "channel_name")
        if channel_values:
            channel_ids = []
            channel_names = []
            for entry in channel_values:
                if entry.isdigit():
                    channel_ids.append(int(entry))
                else:
                    channel_names.append(entry)

            channel_q = Q()
            if channel_ids:
                channel_q |= Q(channel_id__in=channel_ids)
            for name in channel_names:
                channel_q |= Q(channel__name__iexact=name)
            if channel_q:
                queryset = queryset.filter(channel_q)

        tag_values = values_for("tag", "tags", "tag_id", "tag_name")
        if tag_values:
            tag_q = Q()
            for entry in tag_values:
                if entry.isdigit():
                    tag_q |= Q(tags__id=int(entry))
                else:
                    tag_q |= Q(tags__name__iexact=entry)
            if tag_q:
                queryset = queryset.filter(tag_q)

        speaker_values = values_for("speaker", "speakers", "speaker_id", "speaker_name")
        if speaker_values:
            speaker_q = Q()
            for entry in speaker_values:
                if entry.isdigit():
                    speaker_q |= Q(speakers__id=int(entry))
                else:
                    speaker_q |= Q(speakers__name__iexact=entry)
            if speaker_q:
                queryset = queryset.filter(speaker_q)

        level_values = values_for("level", "levels", "level_id")
        if level_values:
            queryset = queryset.filter(level__in=level_values)

        text_query = params.get("text") if params else None
        if text_query:
            text_q = (
                Q(title__icontains(text_query))
                | Q(description__icontains(text_query))
                | Q(channel__name__icontains(text_query))
                | Q(tags__name__icontains(text_query))
                | Q(speakers__name__icontains(text_query))
            )
            queryset = queryset.filter(text_q)

        hide_watched_flag = (params.get("hide_watched") if params else None) or ""
        hide_watched = hide_watched_flag.lower() in {"1", "true", "yes", "on"}
        user = getattr(self.request, "user", None)
        if hide_watched and user and getattr(user, "is_authenticated", False):
            queryset = queryset.exclude(view_logs_old__user=user)

        if tag_values or speaker_values or text_query or hide_watched:
            queryset = queryset.distinct()

        return queryset

    # ----------------------- Custom Actions ----------------------- #

    @action(
        detail=True,
        methods=["post"],
        url_path="mark-as-watched",
        permission_classes=[AllowAny],
    )
    def mark_as_watched(self, request, pk: str | None = None):
        """Log that the current user watched the given video."""

        video = self.get_object()

        user = (
            request.user
            if getattr(request, "user", None) and request.user.is_authenticated
            else None
        )

        created = False
        err: Dict[str, Any] | None = None
        if user is None:
            err = {"info": "Anonymous watch not logged"}
        else:
            try:
                duration = max(int(getattr(video, "duration", 0) or 0), 0)
                UserViewLog.objects.create(
                    video=video,
                    user=user,
                    watch_date=timezone.now(),
                    watch_time=duration,
                    video_time_start=0.0,
                    video_time_end=float(duration),
                )
                created = True
            except Exception as exc:  # pragma: no cover - defensive
                err = {"error": f"UserViewLog create failed: {exc!s}"}

        payload = {"ok": True, "video": video.pk}
        if err:
            payload.update(err)
        return Response(
            payload,
            status=status.HTTP_200_OK if created else status.HTTP_202_ACCEPTED,
        )

    @action(
        detail=False,
        methods=["post"],
        url_path="watchtime",
        permission_classes=[AllowAny],
    )
    def watchtime(self, request):
        """Record a watch-time ping for analytics."""

        video_id = request.data.get("video_id")
        if not video_id:
            return Response(
                {"detail": "video_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        video = get_object_or_404(Video, pk=video_id)
        try:
            seconds = int(request.data.get("seconds", 0))
        except Exception:
            seconds = 0
        seconds = max(seconds, 0)

        user = (
            request.user
            if getattr(request, "user", None) and request.user.is_authenticated
            else None
        )

        created = False
        err: Dict[str, Any] | None = None
        if user is None:
            err = {"info": "Anonymous watchtime not logged"}
        else:
            try:
                UserViewLog.objects.create(
                    video=video,
                    user=user,
                    watch_date=timezone.now(),
                    watch_time=seconds,
                    video_time_start=0.0,
                    video_time_end=float(seconds),
                )
                created = True
            except Exception as exc:  # pragma: no cover - defensive
                err = {"error": f"UserViewLog watchtime create failed: {exc!s}"}

        payload = {"ok": True, "video": video.pk, "seconds": seconds}
        if err:
            payload.update(err)
        return Response(
            payload,
            status=status.HTTP_200_OK if created else status.HTTP_202_ACCEPTED,
        )
