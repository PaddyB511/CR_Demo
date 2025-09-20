try:
    import backend.mail as mail
    import backend.mail.verification as verification
    send_login_email = mail.send_login_email
    send_feedback_to_admin = mail.send_feedback_to_admin
    send_status_update_email = mail.send_status_update_email
    send_premium_claim_email = mail.send_premium_claim_email
    register_if_not_exist = verification.register_if_not_exist
    update_or_register = verification.update_or_register
    verify_and_remove = verification.verify_and_remove
except Exception:
    def send_login_email(email, code): print(f"[mail] login code {code} -> {email}")
    def send_feedback_to_admin(user_email, payload): print(f"[mail] feedback from {user_email}: {payload}")
    def send_status_update_email(email, status): print(f"[mail] status {status} -> {email}")
    def send_premium_claim_email(user_email, patreon_email): print(f"[mail] claim {user_email} <- {patreon_email}")

    _CODES = {}
    def register_if_not_exist(email):
        is_new = email not in _CODES
        _CODES[email] = "123456"
        return is_new, _CODES[email]
    def update_or_register(email):
        _CODES[email] = "654321"
        return _CODES[email]
    def verify_and_remove(email, code):
        ok = _CODES.get(email) == code
        if ok: del _CODES[email]
        return ok, ("ok" if ok else "invalid code")
