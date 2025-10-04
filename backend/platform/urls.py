from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.journal import JournalViewSet

router = DefaultRouter()
router.register(r"journal", JournalViewSet, basename="journal")

urlpatterns = [
    path("", include(router.urls)),
    path("", include("backend.platform.views.user")),
    path("", include("backend.platform.views.browse")),
    path("", include("backend.platform.views.watch")),
    path("", include("backend.platform.views.progress")),
    path("", include("backend.platform.views.downloads")),
]
