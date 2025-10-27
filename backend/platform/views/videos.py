from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from backend.platform.models import Video
from backend.platform.serializers import VideoListSerializer

@api_view(["GET"])
@permission_classes([AllowAny])  # <-- important since your DRF default is IsAuthenticated
def videos_list(request):
    qs = Video.objects.all().order_by("-upload_date")
    data = VideoListSerializer(qs[:200], many=True).data  # simple cap for now
    return Response({"results": data, "total": qs.count()})
