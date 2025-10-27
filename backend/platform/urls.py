from django.urls import path, include
from rest_framework.routers import DefaultRouter
from backend.platform.views.videos import videos_list
from .views.journal import JournalViewSet
from .views import browse
from .views.misc import upsert_user
from .views.telemetry import mark_as_watched_nop, watchtime_nop

router = DefaultRouter()
router.register(r"journal", JournalViewSet, basename="journal")

urlpatterns = [
    path("", include(router.urls)),
    path("", include("backend.platform.views.user")),
    path("", include("backend.platform.views.browse")),
    path("", include("backend.platform.views.watch")),
    path("", include("backend.platform.views.progress")),
    path("", include("backend.platform.views.downloads")),
    path("api/", include((browse.urlpatterns, "browse"))),
    path("videos/", browse.browse_videos, name="platform-videos"),
    path("videos/statistics/", browse.browse_statistics, name="platform-videos-statistics"),
    path("user", upsert_user),  # /api/platform/user if included under /api/platform
        path("videos/<int:pk>/mark-as-watched/", mark_as_watched_nop),
    path("videos/watchtime/", watchtime_nop),
     path("api/", include("backend.platform.urls")),

    # keep your mark-as-watched
    path("video/<str:video_id>/mark-as-watched/", browse.mark_as_watched, name="platform-video-mark"),
]
