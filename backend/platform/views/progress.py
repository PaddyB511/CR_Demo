from django.urls import path
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from datetime import datetime, timedelta
from ..serializers import OffPlatformTimeSerializer
from ..services import db

@api_view(["POST"])
def off_platform_time(request):
    s = OffPlatformTimeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    data = s.validated_data
    start_time = data.get("startTime") or "03:01"
    if not data.get("endTime"):
        end_time = "03:02" if data['startDate'] == data['endDate'] else "02:59"
    else:
        end_time = data['endTime']
    start = f"{data['startDate']} {start_time}"
    end = f"{data['endDate']} {end_time}"
    try:
        dt1 = datetime.strptime(start, "%Y-%m-%d %H:%M")
        dt2 = datetime.strptime(end, "%Y-%m-%d %H:%M")
    except ValueError:
        return JsonResponse({"error": "Invalid data provided"}, status=400)
    if (dt2 - dt1).total_seconds() <= 0 or data['startDate'] > data['endDate']:
        return JsonResponse({"error": "Invalid data provided"}, status=400)
    user = request.session.get("user") or db.User.anonymous().to_dict()
    with db.connect_context() as conn:
        db.User.insert_off_platform_time(conn, user["id"], data['minutes'] * 60, dt1, dt2, data.get("comment", ""))
        return Response({})

@api_view(["GET"])
def off_platform_logs(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    with db.connect_context() as conn:
        # stubs: empty logs
        return Response({"logs": []})

@api_view(["POST"])
def off_platform_log_delete(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    start_date = request.data.get("startDate")
    start_time = request.data.get("startTime")
    minutes = request.data.get("minutes")
    if not (start_date and start_time and minutes is not None):
        return JsonResponse({"error": "No data provided"}, status=400)
    # stub: nothing to delete
    return Response("ok")

@api_view(["GET"])
def consistency_calendar(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    if user["id"] == -1:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    # stub: empty calendar
    return Response([])

@api_view(["GET"])
def word_frequency_get(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    # stub: empty
    return Response([])

@api_view(["GET"])
def word_frequency_reset(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    # stub: ok
    return Response('ok')

@api_view(["GET"])
def user_overall(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    # stub: 0 hours, None words
    return Response({"hours": 0, "words": None})

urlpatterns = [
    path("user/off-platform-time", off_platform_time),
    path("user/off-platform-logs", off_platform_logs),
    path("user/off-platform-log/delete", off_platform_log_delete),
    path("user/progress/consistency/calendar", consistency_calendar),
    path("user/word-frequency", word_frequency_get),
    path("user/word-frequency/reset", word_frequency_reset),
    path("user/overall", user_overall),
]
