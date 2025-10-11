"""
URL configuration for comprehensiblerussian project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, include
from rest_framework import routers
from .users import views as user_views
from backend.videos.views import VideoViewSet, ChannelViewSet, TagViewSet, SpeakerViewSet
from backend.journal.views import JournalViewSet

router = routers.DefaultRouter()
router.register(r'users', user_views.UserViewSet)
router.register(r'videos', VideoViewSet, basename='video')
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'speakers', SpeakerViewSet, basename='speaker')
router.register(r'journal', JournalViewSet, basename='journal')


urlpatterns = [
    path('api/', include(router.urls)),
    # Removed legacy platform routes; platform app retained but URLs disabled.
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('admin/', admin.site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
