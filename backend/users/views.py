from .models import User
from rest_framework import permissions, viewsets

from .serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optionally restricts the returned users to a given user,
        # by filtering against a `username` query parameter in the URL.
        queryset = super().get_queryset()
        user = self.request.user
        if user is not None:
            queryset = queryset.filter(username=user.username)
        return queryset