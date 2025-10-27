# backend/platform/views/browse.py
from __future__ import annotations

import math
from collections import Counter

from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from ..services import db
from ..services import constants as backend_constants
from ..utils.filters import parse_filters
from ..utils.formatters import Formatter

PAGE_SIZE = backend_constants.PAGE_SIZE


@api_view(["GET"])
@permission_classes([AllowAny])  # public listing endpoint
def browse_videos(request):
    # --- FIX: avoid calling db.User.anonymous() ---
    sess_user = request.session.get("user")
    user_id = sess_user.get("id") if isinstance(sess_user, dict) else None

    # 1-based page in query string; convert to 0-based for db.Video.all(...)
    try:
        page = max(0, int(request.GET.get("page", "1")) - 1)
    except Exception:
        page = 0

    with db.connect_context() as conn:
        sort_order, (min_d, max_d), filters, speaker_ids, tag_ids, hide_watched, text = parse_filters(
            conn, request.GET
        )

        vs = db.Video.all(
            conn,
            sort_order=sort_order,
            page=page,
            filters=filters,
            speaker_ids=speaker_ids,
            tag_ids=tag_ids,
            user_id=user_id,              # <-- pass None if anonymous
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
            text=text,
        )

        return Response(
            {
                "videos": [Formatter.video_simple(conn, v) for v in vs],
                "hasMore": len(vs) == PAGE_SIZE,
            }
        )


@api_view(["GET"])
@permission_classes([AllowAny])  # public statistics endpoint
def browse_statistics(request):
    # --- FIX: avoid calling db.User.anonymous() ---
    sess_user = request.session.get("user")
    user_id = sess_user.get("id") if isinstance(sess_user, dict) else None

    with db.connect_context() as conn:
        sort_order, (min_d, max_d), filters, speaker_ids, tag_ids, hide_watched, text = parse_filters(
            conn, request.GET
        )

        vs_all = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters=filters,
            speaker_ids=speaker_ids,
            tag_ids=tag_ids,
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
            text=text,
        )

        vs_no_channel = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters={**filters, "channel_id": []},
            speaker_ids=speaker_ids,
            tag_ids=tag_ids,
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
        )
        vs_no_speaker = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters=filters,
            speaker_ids=None,
            tag_ids=tag_ids,
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
        )
        vs_no_level = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters={**filters, "level": []},
            speaker_ids=speaker_ids,
            tag_ids=tag_ids,
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
        )
        vs_no_durations = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters={**filters, "level": []},
            speaker_ids=speaker_ids,
            tag_ids=tag_ids,
            hide_watched=hide_watched,
            min_duration=None,
            max_duration=None,
        )
        vs_no_tags = db.Video.all(
            conn,
            sort_order=sort_order,
            page=None,
            user_id=user_id,
            filters=filters,
            speaker_ids=speaker_ids,
            hide_watched=hide_watched,
            min_duration=min_d,
            max_duration=max_d,
            text=text,
        )

        # Duration histogram buckets
        d_min, d_max = 0, -1
        for v in vs_no_durations:
            d_max = max(d_max, v.duration + 20)
        step = 60
        n_steps = max(1, int(math.ceil((d_max - d_min) / step)))
        duration_ns = [0 for _ in range(n_steps)]
        for v in vs_no_durations:
            i = (v.duration - d_min) // step
            duration_ns[min(n_steps - 1, max(0, int(i)))] += 1
        durations = [
            {"count": duration_ns[i], "start": d_min + i * step, "end": d_min + (i + 1) * step}
            for i in range(n_steps)
        ]

        # Aggregations
        level_count = dict(Counter(v.level for v in vs_no_level))
        channel_count = dict(Counter(v.channel_id for v in vs_no_channel))
        speaker_count = dict(Counter(
            s.name
            for v in vs_no_speaker
            for s in (getattr(v, "speakers").all() if hasattr(getattr(v, "speakers", None), "all") else [])
))




        cid2name = {c.id: c.name for c in db.Channel.all(conn)}
        sid2name = {s.id: s.name for s in db.Speaker.all(conn)}
        tname2tid = {t.name: t.id for t in db.Tag.all(conn)}

        name_counts = {t: 0 for t in tname2tid.keys()}
        for name, count in db.Tag.stat(conn, [v.id for v in vs_no_tags]):
            name_counts[name] = count

        return Response(
            {
                "total": len(vs_all),
                "statistics": {
                    "levels": [{"name": k, "count": level_count.get(k, 0)} for k in db.Level.all()],
                    "channels": [{"name": cname, "count": channel_count.get(cid, 0)} for cid, cname in cid2name.items()],
                    "speakers": [{"name": sname, "count": speaker_count.get(sname, 0)} for sname in sid2name.values()],
                    "topics": sorted([{"name": n, "count": c} for n, c in name_counts.items()], key=lambda x: x["name"]),
                    "durations": durations,
                },
            }
        )


@api_view(["GET"])
@permission_classes([AllowAny])  # keep public for demo
def mark_as_watched(request, video_id: str):
    # --- FIX: avoid calling db.User.anonymous() ---
    sess_user = request.session.get("user")
    user_id = sess_user.get("id") if isinstance(sess_user, dict) else None

    with db.connect_context() as conn:
        video = db.Video.get(conn, video_id)
        video.mark_as_watched(conn, user_id)
        return Response({})


# URL patterns (unchanged)
urlpatterns = [
    path("browse/videos", browse_videos),
    path("browse/videos/", browse_videos),
    path("browse/statistics", browse_statistics),
    path("browse/statistics/", browse_statistics),
    path("videos", browse_videos),
    path("videos/", browse_videos),
    path("videos/statistics", browse_statistics),
    path("videos/statistics/", browse_statistics),
    path("video/<str:video_id>/mark-as-watched", mark_as_watched),
    path("video/<str:video_id>/mark-as-watched/", mark_as_watched),
]
