from django.urls import path, include

urlpatterns = [
    path("", include("backend.platform.views.user")),
    path("", include("backend.platform.views.browse")),
    path("", include("backend.platform.views.watch")),
    path("", include("backend.platform.views.progress")),
    path("", include("backend.platform.views.downloads")),
]
