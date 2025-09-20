import pathlib
import yt_dlp

from django.conf import settings
from django.http import HttpResponse, FileResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser

from .serializers import VideoIdSerializer, SubtitleRequestSerializer

YT_PROXY_ROOT = getattr(settings, "YT_PROXY_ROOT", pathlib.Path(__file__).resolve().parent)
(YT_PROXY_ROOT / "audio").mkdir(parents=True, exist_ok=True)
(YT_PROXY_ROOT / "subtitle").mkdir(parents=True, exist_ok=True)

def _vid2url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"

class MetadataView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    def post(self, request):
        ser = VideoIdSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        video_id = ser.validated_data["videoId"]
        ydl_opts = {"quiet": True, "extract_flat": False, "dump_single_json": True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(_vid2url(video_id), download=False)
        return Response(info, status=200)

class AudioView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    def post(self, request):
        ser = VideoIdSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        video_id = ser.validated_data["videoId"]

        path = next((YT_PROXY_ROOT / "audio").glob(f"{video_id}*"), None)
        if path is None:
            outtmpl = f"{(YT_PROXY_ROOT).as_posix()}/audio/%(id)s.%(ext)s"
            ydl_opts = {"quiet": True, "format": "bestaudio/best", "outtmpl": outtmpl}
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([_vid2url(video_id)])
            path = next((YT_PROXY_ROOT / "audio").glob(f"{video_id}*"), None)

        if not path or not path.exists():
            return HttpResponse("Audio not found/failed", status=500)

        mimetype = path.suffix.lstrip(".") or "mpeg"
        resp = FileResponse(open(path, "rb"), content_type=f"audio/{mimetype}", status=200)
        resp["Content-Disposition"] = f'inline; filename="{path.name}"'
        resp["Cache-Control"] = "public, max-age=86400"
        return resp

class SubtitleView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [JSONParser]
    def post(self, request):
        ser = SubtitleRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        video_id = ser.validated_data["videoId"]
        lang = ser.validated_data["lang"]

        path = next((YT_PROXY_ROOT / "subtitle").glob(f"{video_id}*.vtt"), None)
        if path is None:
            outtmpl = f"{(YT_PROXY_ROOT).as_posix()}/subtitle/%(id)s.%(ext)s"
            ydl_opts = {
                "quiet": True,
                "writesubtitles": True,
                "subtitleslangs": [lang],
                "skip_download": True,
                "outtmpl": outtmpl,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([_vid2url(video_id)])
            path = next((YT_PROXY_ROOT / "subtitle").glob(f"{video_id}*.vtt"), None)

        if not path or not path.exists():
            return HttpResponse("Subtitle not found/failed", status=500)

        resp = FileResponse(open(path, "rb"), content_type="text/vtt", status=200)
        resp["Content-Disposition"] = f'inline; filename="{video_id}.{lang}.vtt"'
        resp["Cache-Control"] = "public, max-age=86400"
        return resp
