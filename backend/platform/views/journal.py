from django.db.models import Sum
from django.utils.timezone import now
from rest_framework import viewsets, permissions, decorators, response

from ..models import OffPlatformLog
from ..serializers import JournalNoteSerializer


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user_id == request.user.id


class JournalViewSet(viewsets.ModelViewSet):
    """
    /api/journal/            GET(list), POST(create)
    /api/journal/{id}/       GET, PATCH(update), DELETE
    /api/journal/options/    GET static choices (no auth needed)
    /api/journal/overview/   GET today & total minutes (auth)
    """
    serializer_class = JournalNoteSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        qs = OffPlatformLog.objects.filter(user=self.request.user).order_by("-date_start")
        q_from = self.request.query_params.get("from")
        q_to = self.request.query_params.get("to")
        if q_from:
            qs = qs.filter(date_start__date__gte=q_from)
        if q_to:
            qs = qs.filter(date_start__date__lte=q_to)
        return qs

    def perform_create(self, serializer):
        # Set snapshot for “Total Input” column
        user = self.request.user
        existing_minutes = (
            OffPlatformLog.objects.filter(user=user).aggregate(total=Sum("time_duration"))["total"] or 0
        ) // 60
        minutes_now = int(self.request.data.get("minutes", 0))
        obj = serializer.save()
        obj.total_input_minutes_snapshot = existing_minutes + minutes_now
        obj.save()

    def perform_update(self, serializer):
        # Recompute snapshot (optional)
        instance = self.get_object()
        user = self.request.user
        others_minutes = (
            OffPlatformLog.objects.filter(user=user).exclude(pk=instance.pk).aggregate(total=Sum("time_duration"))["total"] or 0
        ) // 60
        obj = serializer.save()
        obj.total_input_minutes_snapshot = others_minutes + (obj.time_duration // 60)
        obj.save()

    @decorators.action(detail=False, methods=["get"], url_path="options", permission_classes=[permissions.AllowAny])
    def options(self, request):
        return response.Response({
            "activities": [
                {"value": "listening_watching", "label": "Listening/Watching"},
                {"value": "reading", "label": "Reading"},
                {"value": "speaking", "label": "Speaking"},
                {"value": "writing", "label": "Writing"},
                {"value": "other", "label": "Other"},
            ],
            "attentionRates": [
                {"value": "active", "label": "Active 80–100%"},
                {"value": "passive", "label": "Passive 20–80%"},
                {"value": "radio", "label": "Radio 0–20%"},
            ],
            "realityRates": [
                {"value": "real_life", "label": "100% Real life communication"},
                {"value": "online_video_chat", "label": "90% Online video chat"},
                {"value": "videos_movies", "label": "70% Videos, movies"},
                {"value": "podcasts", "label": "30% Podcasts"},
                {"value": "other", "label": "Other"},
            ]
        })

    @decorators.action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        user = request.user
        today = now().date()
        qs = OffPlatformLog.objects.filter(user=user)
        total_minutes = (qs.aggregate(total=Sum("time_duration"))["total"] or 0) // 60

        today_minutes = (
            qs.filter(date_start__date__lte=today, date_end__date__gte=today)
              .aggregate(total=Sum("time_duration"))["total"] or 0
        ) // 60

        return response.Response({
            "todayMinutes": int(today_minutes),
            "totalMinutes": int(total_minutes),
        })
