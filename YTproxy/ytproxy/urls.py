from django.urls import path
from .views import MetadataView, AudioView, SubtitleView

urlpatterns = [
    path("api/yt-proxy/metadata", MetadataView.as_view(), name="yt_proxy_metadata"),
    path("api/yt-proxy/audio",    AudioView.as_view(),    name="yt_proxy_audio"),
    path("api/yt-proxy/subtitle", SubtitleView.as_view(), name="yt_proxy_subtitle"),
]
