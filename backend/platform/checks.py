from __future__ import annotations

import os

from django.core.checks import Error, register


@register()
def auth0_audience_configured(app_configs=None, **kwargs):
    """Ensure AUTH0_AUDIENCE is supplied via environment configuration."""

    audience_env = os.environ.get("AUTH0_AUDIENCE")

    if audience_env:
        return []

    # If the environment variable is missing, settings will fall back to the
    # placeholder value defined in backend.settings. We flag that here so
    # `python manage.py check` and `runserver` surface a configuration error
    # without preventing other management commands (such as auth0_check) from
    # executing.
    return [
        Error(
            "AUTH0_AUDIENCE environment variable is not configured.",
            hint=(
                "Copy .env.example to .env at the project root and set "
                "AUTH0_AUDIENCE to your Auth0 API Identifier, then restart "
                "Django."
            ),
            id="auth0.E001",
        )
    ]
