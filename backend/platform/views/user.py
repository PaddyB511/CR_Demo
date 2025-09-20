from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from datetime import datetime, timedelta
from dateutil import tz
from ..serializers import EmailCodeSerializer, UserUpdateSerializer
from ..services import db, mail

@api_view(["POST"])
@permission_classes([AllowAny])  # public bootstrap
def user_get(request):
    data = request.data or {}
    sess_user = request.session.get("user")
    with db.connect_context() as conn:
        if not sess_user:
            user = db.User.anonymous()
        else:
            user = db.User.from_email(conn, sess_user.get("email")) if sess_user.get("email") else db.User.anonymous()
        user_dict = user.to_dict()
        user_dict['roles'] = []
        request.session["user"] = user_dict

        tzname = data.get('timezone', 'UTC')
        tzfile = tz.gettz(tzname) or tz.gettz('UTC')
        now = datetime.now().astimezone(tzfile)
        last_morning = now.replace(hour=3, minute=0, second=0, microsecond=0)
        if now.hour < 3:
            last_morning -= timedelta(days=1)

        # stub totals
        total = 0
        today = 0
        if user_dict.get('dailyGoalMinutes') in (None, 0):
            user_dict['dailyGoalMinutes'] = 15
        out = {
            **user_dict,
            "roles": user_dict.get("roles", []),
            "watchTimeSeconds": int(total),
            "watchTimeTodaySeconds": int(today),
            "isAnonymous": user.id == -1,
        }
        return Response(out)

@api_view(["POST"])
@permission_classes([AllowAny])  # public
def user_send_code(request):
    s = EmailCodeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    email = s.validated_data["email"]
    update = s.validated_data.get("update")
    if update:
        code = mail.update_or_register(email)
        mail.send_login_email(email, code)
    else:
        is_new, code = mail.register_if_not_exist(email)
        if is_new:
            mail.send_login_email(email, code)
    return Response({"status": "ok"})

@api_view(["POST"])
@permission_classes([AllowAny])  # public
def user_login(request):
    s = EmailCodeSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    email = s.validated_data.get("email")
    code = s.validated_data.get("verification_code")
    if not email or not code:
        return JsonResponse({"error": "Missing email or code"}, status=400)
    ok, msg = mail.verify_and_remove(email, code)
    if not ok:
        return JsonResponse({"error": msg}, status=400)
    with db.connect_context() as conn:
        user = db.User.from_email(conn, email)
        if not user:
            return JsonResponse({"error": "User not found"}, status=404)
        user_dict = user.to_dict()
        user_dict['roles'] = []
        request.session["user"] = user_dict
        return Response(user.to_dict())

@api_view(["GET"])
def user_logout(request):
    request.session.pop("user", None)
    return Response("ok")

@api_view(["POST"])
def user_update(request):
    if "user" not in request.session:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    s = UserUpdateSerializer(data=request.data, partial=True)
    s.is_valid(raise_exception=True)
    updates = s.validated_data
    with db.connect_context() as conn:
        u = db.User.from_email(conn, request.session["user"].get("email")) or db.User.anonymous()
        # stubs: set attrs if present
        for k, v in updates.items():
            setattr(u, k, v)
        u.update(conn, should_commit=True)
        request.session["user"] = u.to_dict()
        return Response(u.to_dict())

@api_view(["POST"])
@permission_classes([AllowAny])  # public
def user_register(request):
    name = request.data.get("name")
    email = request.data.get("email")
    if not name or not email:
        return JsonResponse({"error": "Missing name or email"}, status=400)
    update = bool(request.data.get("update"))
    if update:
        code = mail.update_or_register(email)
        mail.send_login_email(email, code)
    else:
        is_new, code = mail.register_if_not_exist(email)
        if is_new:
            mail.send_login_email(email, code)
    with db.connect_context() as conn:
        db.User.register(conn, name, email)
    return Response("ok")

@api_view(["POST"])
def user_goal(request):
    if "user" not in request.session:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    data = request.data
    with db.connect_context() as conn:
        u = db.User.from_email(conn, request.session["user"].get("email")) or db.User.anonymous()
        if "dailyGoalMinutes" in data:
            mins = data["dailyGoalMinutes"]
            if mins is None or mins < 0:
                return JsonResponse({"error": "Invalid minutes"}, status=400)
            u.daily_goal_minutes = mins
        if "finalGoalMinutes" in data:
            mins = data["finalGoalMinutes"]
            if mins is None or mins < 0:
                return JsonResponse({"error": "Invalid minutes"}, status=400)
            u.final_goal_minutes = mins
        if "finalGoalDate" in data:
            date = data["finalGoalDate"]
            if not date:
                return JsonResponse({"error": "Invalid date"}, status=400)
            u.final_goal_date = date
        u.update(conn)
        request.session["user"] = u.to_dict()
        return Response(u.to_dict())

@api_view(["POST"])
def user_patreon_claim(request):
    user_sess = request.session.get("user")
    if not user_sess:
        return JsonResponse({"error": "Unauthorized"}, status=401)
    email = request.data.get("email")
    if not email:
        return JsonResponse({"error": "Email not provided"}, status=400)
    with db.connect_context() as conn:
        u = db.User.from_email(conn, user_sess.get("email")) or db.User.anonymous()
        if u.premium:
            return Response({"message": "already-premium"})
        if getattr(u, "premium_claimed_with_email", None) == email:
            return Response({"message": "duplicate-claim"})
        u.premium_claimed_with_email = email
        mail.send_premium_claim_email(user_email=u.email, patreon_email=email)
        u.update(conn)
        request.session["user"] = u.to_dict()
        return Response({"message": "success"})

@api_view(["POST"])
@permission_classes([AllowAny])  # public if you like
def feedback(request):
    user = request.session.get("user") or db.User.anonymous().to_dict()
    mail.send_feedback_to_admin(user.get("email"), request.data)
    return Response("ok")

urlpatterns = [
    path("user", user_get),
    path("user/send-code", user_send_code),
    path("user/login", user_login),
    path("user/logout", user_logout),
    path("user/update", user_update),
    path("user/register", user_register),
    path("user/goal", user_goal),
    path("patreon/claim", user_patreon_claim),
    path("feedback", feedback),
]
