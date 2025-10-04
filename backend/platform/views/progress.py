# backend/platform/views/progress.py
import datetime
from collections import defaultdict

from django.urls import path
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from backend.platform.services import db
from backend.platform.models import OffPlatformLog, UserViewLog, UserWordFrequency


# ---------- endpoints ----------

@api_view(["POST"])
@permission_classes([AllowAny])
def user_off_platform_time(request):
    """
    Add a manual study session (off-platform).
    Body: {startDate, endDate, minutes, comment?, startTime?, endTime?}
    """
    data = request.data or {}

    # defaults like the Flask version
    start_time = data.get("startTime") or "03:01"
    if not data.get("endTime"):
        data["endTime"] = "03:02" if data.get("startDate") == data.get("endDate") else "02:59"

    # validation
    for req in ("startDate", "endDate", "minutes"):
        if data.get(req) is None:
            return JsonResponse({"error": "No data provided"}, status=400)

    start = f"{data['startDate']} {start_time}"
    end = f"{data['endDate']} {data['endTime']}"
    try:
        start_dt = datetime.datetime.strptime(start, "%Y-%m-%d %H:%M")
        end_dt = datetime.datetime.strptime(end, "%Y-%m-%d %H:%M")
    except ValueError:
        return JsonResponse({"error": "Invalid data provided"}, status=400)

    if (end_dt - start_dt).total_seconds() <= 0 or data["startDate"] > data["endDate"]:
        return JsonResponse({"error": "Invalid data provided"}, status=400)

    duration_seconds = int(data["minutes"] * 60)
    user = request.session.get("user") or db.User.anonymous().to_dict()

    with db.connect_context() as conn:
        db.User.insert_off_platform_time(
            conn,
            user["id"],
            duration_seconds,
            start_dt,
            end_dt,
            data.get("comment", ""),
        )
        return Response({})


@api_view(["GET"])
@permission_classes([AllowAny])
def user_off_platform_logs(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    logs = []
    for log in OffPlatformLog.objects.filter(user_id=user["id"]).order_by("-date_start"):
        start = log.date_start
        logs.append(
            {
                "minutes": log.time_duration / 60,
                "startDate": start.strftime("%Y-%m-%d"),
                "startTime": start.strftime("%H:%M:%S"),
                "comment": log.comment,
            }
        )
    return Response({"logs": logs})


@api_view(["POST"])
@permission_classes([AllowAny])
def user_off_platform_log_delete(request):
    data = request.data or {}
    for k in ("startDate", "startTime", "minutes"):
        if data.get(k) is None:
            return JsonResponse({"error": "No data provided"}, status=400)
    user = request.session.get("user") or db.User.anonymous().to_dict()

    start_dt = datetime.datetime.strptime(f"{data['startDate']} {data['startTime']}", "%Y-%m-%d %H:%M:%S")
    start_dt = timezone.make_aware(start_dt)
    secs = int(data["minutes"] * 60)
    OffPlatformLog.objects.filter(user_id=user["id"], date_start=start_dt, time_duration=secs).delete()
    return Response("ok")


@api_view(["GET"])
@permission_classes([AllowAny])
def user_progress_consistency_calendar(request):
    """
    Heatmap source: per-day totals of on/off-platform seconds.
    Returns list of [date_str, {"on": secs, "off": secs}]
    """
    user = request.session.get("user") or db.User.anonymous().to_dict()
    if user.get("id", -1) == -1:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    date2on_off2seconds = defaultdict(lambda: {"on": 0, "off": 0})

    for row in (
        UserViewLog.objects.filter(user_id=user["id"]).values("watch_date__date").annotate(total=Sum("watch_time"))
    ):
        d = row["watch_date__date"].strftime("%Y-%m-%d")
        date2on_off2seconds[d]["on"] += row["total"] or 0

    for l in OffPlatformLog.objects.filter(user_id=user["id"]).only("date_start", "date_end", "time_duration"):
        d1 = l.date_start.date()
        d2 = l.date_end.date()
        days = (d2 - d1).days + 1
        per_day = (l.time_duration or 0) / max(days, 1)
        for i in range(days):
            d = (d1 + datetime.timedelta(days=i)).strftime("%Y-%m-%d")
            date2on_off2seconds[d]["off"] += per_day

    return Response(sorted(date2on_off2seconds.items()))


@api_view(["GET"])
@permission_classes([AllowAny])
def word_frequency_get(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    rows = (
        UserWordFrequency.objects.filter(user_id=user["id"])
        .order_by("-count", "word")
        .values_list("word", "count")
    )
    return Response(list(rows))


@api_view(["GET"])
@permission_classes([AllowAny])
def word_frequency_reset(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    UserWordFrequency.objects.filter(user_id=user["id"]).delete()
    return Response("ok")


@api_view(["GET"])
@permission_classes([AllowAny])
def user_overall(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    seconds_on = UserViewLog.objects.filter(user_id=user["id"]).aggregate(s=Sum("watch_time"))["s"] or 0
    seconds_off = OffPlatformLog.objects.filter(user_id=user["id"]).aggregate(s=Sum("time_duration"))["s"] or 0
    words = UserWordFrequency.objects.filter(user_id=user["id"]).aggregate(s=Sum("count"))["s"] or 0
    return Response({"hours": (seconds_on + seconds_off) / 3600.0, "words": words})


# ---------- urls ----------

urlpatterns = [
    path("user/off-platform-time", user_off_platform_time),              # POST
    path("user/off-platform-logs", user_off_platform_logs),              # GET
    path("user/off-platform-log/delete", user_off_platform_log_delete),  # POST
    path("user/progress/consistency/calendar", user_progress_consistency_calendar),  # GET
    path("user/word-frequency", word_frequency_get),                     # GET
    path("user/word-frequency/reset", word_frequency_reset),             # GET
    path("user/overall", user_overall),                                  # GET
]
