# backend/platform/views/user.py
from datetime import datetime, timedelta

from dateutil import tz
from django.urls import path
from django.http import JsonResponse
from django.utils import timezone
from django.db.models import Sum, Case, When, IntegerField

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from backend.utils import camel_to_snake
from backend.platform.models import UserViewLog, OffPlatformLog
from backend.platform.services import db
from backend.platform.services import mail as mail_svc


# ---------- helpers ----------

def _get_session_user(request):
    """Return the session user dict (or an anonymous one) and ensure it is saved."""
    user = request.session.get("user")
    if not user:
        user = db.User.anonymous().to_dict()
        user["roles"] = []
        request.session["user"] = user
    return user


# ---------- endpoints ----------

@api_view(["POST"])
@permission_classes([AllowAny])
def user_get(request):
    """
    Bootstrap session & return user + progress aggregates used by the dashboard header:
    - watchTimeSeconds (total on/off-platform)
    - watchTimeTodaySeconds (today since 03:00 local)
    - roles (if any)
    - dailyGoalMinutes fallback to 15 if missing
    """
    data = request.data or {}
    user = _get_session_user(request)

    # timezone handling
    tzname = data.get("timezone", "UTC")
    tzfile = tz.gettz(tzname) or tz.gettz("UTC")
    now = datetime.now().astimezone(tzfile)

    # "day" boundary at 03:00
    last_morning = now.replace(hour=3, minute=0, second=0, microsecond=0)
    if now.hour < 3:
        last_morning -= timedelta(days=1)

    uid = user["id"]

    # ---- ORM aggregates for totals/today ----
    agg_on = UserViewLog.objects.filter(user_id=uid).aggregate(
        total=Sum("watch_time"),
        today=Sum(
            Case(
                When(watch_date__gt=last_morning, then="watch_time"),
                default=0,
                output_field=IntegerField(),
            )
        ),
    )
    watch_time = agg_on["total"] or 0
    watch_time_today = agg_on["today"] or 0

    agg_off = OffPlatformLog.objects.filter(user_id=uid).aggregate(
        total=Sum("time_duration"),
        today=Sum(
            Case(
                When(date_start__gte=last_morning, then="time_duration"),
                default=0,
                output_field=IntegerField(),
            )
        ),
    )
    off_platform_time = agg_off["total"] or 0
    off_platform_time_today = agg_off["today"] or 0

    time_total = int(watch_time + off_platform_time)
    time_today = int(watch_time_today + off_platform_time_today)

    # goal defaults
    if user.get("dailyGoalMinutes") in (None, 0):
        user["dailyGoalMinutes"] = 15

    payload = {
        "roles": user.get("roles", []),
        "watchTimeSeconds": time_total,
        "watchTimeTodaySeconds": time_today,
        "isAnonymous": user.get("id", -1) == -1,
        **user,
    }
    # keep session in sync
    request.session["user"] = payload
    return Response(payload)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_send_code(request):
    """Send or re-send a login/verify code to the email address."""
    email = (request.data or {}).get("email")
    if not email:
        return JsonResponse({"error": "Email not provided"}, status=400)

    is_update = (request.data or {}).get("update", False)
    try:
        code = mail_svc.update_or_register(email) if is_update else mail_svc.register_if_not_exist(email)[1]
        mail_svc.send_login_email(email, code)
        return Response({"status": "ok"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_login(request):
    data = request.data or {}
    email = data.get("email")
    code = data.get("verification_code")
    if not email or not code:
        return JsonResponse({"error": "Missing email or code"}, status=400)

    ok, msg = mail_svc.verify_and_remove(email, code)
    if not ok:
        return JsonResponse({"error": msg}, status=400)

    # In your real system you'd fetch the User model and map to session dict.
    # Here we keep the session "user" shape consistent with the rest of the app.
    user = request.session.get("user") or db.User.anonymous().to_dict()
    user["email"] = email
    request.session["user"] = user
    return Response(user)


@api_view(["GET"])
@permission_classes([AllowAny])
def user_logout(request):
    request.session.pop("user", None)
    return Response("ok")


@api_view(["POST"])
@permission_classes([AllowAny])
def user_update(request):
    """
    Update user fields that are stored in session (and optionally your own User model).
    """
    user = request.session.get("user")
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = request.data or {}
    for k, v in data.items():
        user[camel_to_snake(k)] = v
    request.session["user"] = user
    return Response(user)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_register(request):
    """
    Mimic registration flow from Flask: send code and create a user record (if you want).
    For now we just send the code using the mail service wrapper.
    """
    data = request.data or {}
    name = data.get("name")
    email = data.get("email")
    if not name or not email:
        return JsonResponse({"error": "Missing name or email"}, status=400)

    is_update = data.get("update", False)
    code = mail_svc.update_or_register(email) if is_update else mail_svc.register_if_not_exist(email)[1]
    mail_svc.send_login_email(email, code)
    return Response("ok")


# ----- goal helpers -----
def _apply_daily_goal(data, session_user):
    minutes = data.get("dailyGoalMinutes")
    if minutes is None or minutes < 0:
        return JsonResponse({"error": "Invalid minutes"}, status=400)
    session_user["dailyGoalMinutes"] = minutes
    return None


def _apply_final_goal_minutes(data, session_user):
    minutes = data.get("finalGoalMinutes")
    if minutes is None or minutes < 0:
        return JsonResponse({"error": "Invalid minutes"}, status=400)
    session_user["finalGoalMinutes"] = minutes
    return None


def _apply_final_goal_date(data, session_user):
    date = data.get("finalGoalDate")
    if date is None:
        return JsonResponse({"error": "Invalid date"}, status=400)
    session_user["finalGoalDate"] = date
    return None


@api_view(["POST"])
@permission_classes([AllowAny])
def user_goal(request):
    """Set any/all of: dailyGoalMinutes, finalGoalMinutes, finalGoalDate."""
    session_user = request.session.get("user")
    if not session_user:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    data = request.data or {}
    for applier in (_apply_daily_goal, _apply_final_goal_minutes, _apply_final_goal_date):
        err = applier(data, session_user)
        if err:
            return err
    request.session["user"] = session_user
    return Response(session_user)


@api_view(["POST"])
@permission_classes([AllowAny])
def user_patreon_claim(request):
    user = request.session.get("user")
    if not user:
        return JsonResponse({"error": "Unauthorized"}, status=401)

    email = (request.data or {}).get("email")
    if not email:
        return JsonResponse({"error": "Email not provided"}, status=400)

    # Deduplicate & notify admin via mail service
    if user.get("premium"):
        return Response({"message": "already-premium"})
    if user.get("premiumClaimedWithEmail") == email:
        return Response({"message": "duplicate-claim"})

    user["premiumClaimedWithEmail"] = email
    request.session["user"] = user
    try:
        mail_svc.send_premium_claim_email(user_email=user.get("email", ""), patreon_email=email)
    except Exception:
        pass
    return Response({"message": "success"})


@api_view(["POST"])
@permission_classes([AllowAny])
def user_feedback(request):
    """
    Submit feedback — just forward to the mail service (or log).
    """
    user = request.session.get("user") or db.User.anonymous().to_dict()
    args = request.data or {}
    try:
        mail_svc.send_feedback_to_admin(user.get("email", ""), args)
    except Exception:
        pass
    return Response("ok")


# ---------- urls ----------

urlpatterns = [
    path("user", user_get),                        # POST
    path("user/send-code", user_send_code),       # POST
    path("user/login", user_login),               # POST
    path("user/logout", user_logout),             # GET
    path("user/update", user_update),             # POST
    path("user/register", user_register),         # POST
    path("user/goal", user_goal),                 # POST
    path("patreon/claim", user_patreon_claim),    # POST
    path("feedback", user_feedback),              # POST
]
