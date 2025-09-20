from rest_framework.permissions import BasePermission

class RequiresPremium(BasePermission):
    """
    Extra gate on top of IsAuthenticated.
    Looks at session-backed 'user' dict the same way your Flask code did.
    If later you switch to a real Django User, replace this check.
    """
    def has_permission(self, request, view):
        user = request.session.get("user")
        return bool(user and user.get("premium"))
