from django.apps import AppConfig

class PlatformConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "backend.platform"
    verbose_name = "Platform"

    def ready(self) -> None:  # pragma: no cover - import side effects only
        # Import checks so Django registers them during startup.
        from . import checks  # noqa: F401
