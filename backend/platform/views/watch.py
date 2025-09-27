# backend/platform/views/watch.py
from datetime import datetime
from django.urls import path
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from dateutil import tz

from ..services import db
from ..utils.formatters import Formatter, _iter_tags


@api_view(["GET"])
@permission_classes([AllowAny])
def get_video(request, video_id: str):
    include_related = (request.GET.get("related", "true").lower() == "true")
    user = request.session.get("user") or db.User.anonymous().to_dict()

    with db.connect_context() as conn:
        video = db.Video.get(conn, video_id, user_id=user["id"])
        if not video:
            return JsonResponse({"error": "Video not found"}, status=404)

        if getattr(video, "premium", False) and not user.get("premium"):
            return JsonResponse({"error": "Unauthorized"}, status=401)

        tags = _iter_tags(conn, video)
        related = []
        if include_related and tags:
            id2related = {}
            for t in tags:
                all_videos = getattr(t, "all_videos", None)
                if callable(all_videos):
                    try:
                        for v in all_videos(conn, uid=user["id"]):
                            id2related[getattr(v, "id", None)] = v
                    except TypeError:
                        for v in all_videos(conn):
                            id2related[getattr(v, "id", None)] = v
                else:
                    vids_mgr = getattr(t, "videos", None)
                    if hasattr(vids_mgr, "all"):
                        for v in vids_mgr.all():
                            id2related[getattr(v, "id", None)] = v
            related = list(id2related.values())

        ret = Formatter.video_detail(conn, video, tags, related_videos=related)

        channel_name = None
        if getattr(video, "channel", None) and getattr(video.channel, "name", None):
            channel_name = video.channel.name
        else:
            cid = getattr(video, "channel_id", None)
            cid2name = {c.id: c.name for c in db.Channel.all(conn)}
            channel_name = cid2name.get(cid)

        ret["video"]["channelName"] = channel_name
        return Response(ret)


@api_view(["POST"])
@permission_classes([AllowAny])
def watchtime_update(request):
    data = request.data or {}
    user = request.session.get("user") or db.User.anonymous().to_dict()

    vid = data.get("videoId")
    if vid is None:
        return JsonResponse({"error": "Missing videoId"}, status=400)

    try:
        t_end = float(data.get("lastVideoTime", 0))
        elapsed = float(data.get("elapsedTime", 0))
    except (TypeError, ValueError):
        return JsonResponse({"error": "Invalid time payload"}, status=400)

    t_start = t_end - elapsed

    tzstring = data.get("timezone", "UTC")
    tzfile = tz.gettz(tzstring) or tz.gettz("UTC")
    now = datetime.now().astimezone(tzfile)

    if user.get("id", -1) == -1:
        return Response({})

    with db.connect_context() as conn:
        db.User.insert_watch_data(conn, user["id"], vid, elapsed, now, t_start, t_end)
        return Response({})


urlpatterns = [
    path("video/<str:video_id>", get_video),
    path("watchtime/update", watchtime_update),
]
