from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(["POST"])
@permission_classes([AllowAny])
def mark_as_watched_nop(request, pk: int):
    return Response(status=204)

@api_view(["POST"])
@permission_classes([AllowAny])
def watchtime_nop(request):
    return Response(status=204)
