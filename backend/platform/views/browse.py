from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from ..services import db
from ..services import constants as backend_constants
from ..utils.filters import parse_filters
from ..utils.formatters import Formatter
import math
from collections import Counter

PAGE_SIZE = backend_constants.PAGE_SIZE

@api_view(["GET"])
@permission_classes([AllowAny])  # public
def browse_videos(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    try:
        page = max(0, int(request.GET.get("page", "1")) - 1)
    except Exception:
        page = 0
    with db.connect_context() as conn:
        sort_order, (min_d, max_d), filters, speaker_ids, tag_ids, hide_watched, text = parse_filters(conn, request.GET)
        vs = db.Video.all(conn, sort_order=sort_order, page=page, filters=filters,
                          speaker_ids=speaker_ids, tag_ids=tag_ids,
                          user_id=user["id"], hide_watched=hide_watched,
                          min_duration=min_d, max_duration=max_d, text=text)
        return Response({
            "videos": [Formatter.video_simple(conn, v) for v in vs],
            "hasMore": len(vs) == PAGE_SIZE,
        })

@api_view(["GET"])
@permission_classes([AllowAny])  # public
def browse_statistics(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    with db.connect_context() as conn:
        sort_order, (min_d, max_d), filters, speaker_ids, tag_ids, hide_watched, text = parse_filters(conn, request.GET)
        vs_all = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                              filters=filters, speaker_ids=speaker_ids, tag_ids=tag_ids,
                              hide_watched=hide_watched, min_duration=min_d, max_duration=max_d, text=text)
        vs_no_channel = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                                     filters={**filters, "channel_id": []}, speaker_ids=speaker_ids,
                                     tag_ids=tag_ids, hide_watched=hide_watched, min_duration=min_d, max_duration=max_d)
        vs_no_speaker = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                                     filters=filters, speaker_ids=None, tag_ids=tag_ids,
                                     hide_watched=hide_watched, min_duration=min_d, max_duration=max_d)
        vs_no_level = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                                   filters={**filters, "level": []}, speaker_ids=speaker_ids,
                                   tag_ids=tag_ids, hide_watched=hide_watched, min_duration=min_d, max_duration=max_d)
        vs_no_durations = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                                       filters={**filters, "level": []}, speaker_ids=speaker_ids,
                                       tag_ids=tag_ids, hide_watched=hide_watched, min_duration=None, max_duration=None)
        vs_no_tags = db.Video.all(conn, sort_order=sort_order, page=None, user_id=user["id"],
                                  filters=filters, speaker_ids=speaker_ids, hide_watched=hide_watched,
                                  min_duration=min_d, max_duration=max_d, text=text)
        d_min, d_max = 0, -1
        for v in vs_no_durations:
            d_max = max(d_max, v.duration + 20)
        step = 60
        n_steps = max(1, math.ceil((d_max - d_min) / step))
        duration_ns = [0 for _ in range(n_steps)]
        for v in vs_no_durations:
            i = (v.duration - d_min) // step
            duration_ns[min(n_steps - 1, max(0, int(i)))] += 1
        durations = [{"count": duration_ns[i], "start": d_min + i*step, "end": d_min + (i+1)*step} for i in range(n_steps)]
        level_count = dict(Counter(v.level for v in vs_no_level))
        channel_count = dict(Counter(v.channel_id for v in vs_no_channel))
        speaker_count = dict(Counter(s.name for v in vs_no_speaker for s in v.speakers(conn)))
        cid2name = {c.id: c.name for c in db.Channel.all(conn)}
        sid2name = {s.id: s.name for s in db.Speaker.all(conn)}
        tname2tid = {t.name: t.id for t in db.Tag.all(conn)}
        name_counts = {t: 0 for t in tname2tid.keys()}
        for name, count in db.Tag.stat(conn, [v.id for v in vs_no_tags]):
            name_counts[name] = count
        return Response({
            "total": len(vs_all),
            "statistics": {
                "levels": [{"name": k, "count": level_count.get(k, 0)} for k in db.Level.all()],
                "channels": [{"name": cname, "count": channel_count.get(cid, 0)} for cid, cname in cid2name.items()],
                "speakers": [{"name": sname, "count": speaker_count.get(sname, 0)} for sname in sid2name.values()],
                "topics": sorted([{"name": n, "count": c} for n, c in name_counts.items()], key=lambda x: x["name"]),
                "durations": durations,
            }
        })

@api_view(["GET"])
def mark_as_watched(request, video_id:str):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    with db.connect_context() as conn:
        video = db.Video.get(conn, video_id)
        video.mark_as_watched(conn, user["id"])
        return Response({})

urlpatterns = [
    path("browse/videos", browse_videos),
    path("browse/statistics", browse_statistics),
    path("video/<str:video_id>/mark-as-watched", mark_as_watched),
]
