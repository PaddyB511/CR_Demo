from __future__ import annotations

import os
from pathlib import Path
from typing import Dict

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Inspect Auth0 configuration and outline the required setup steps."
    requires_system_checks: list[str] = []

    def handle(self, *args, **options):
        project_root = Path(settings.BASE_DIR).resolve()
        env_file = project_root / ".env"
        frontend_env_file = project_root / "frontend" / ".env.local"

        self.stdout.write(self.style.MIGRATE_HEADING("Auth0 configuration checklist"))
        self.stdout.write("")

        backend_env = self._read_env_file(env_file)
        frontend_env = self._read_env_file(frontend_env_file)

        self._print_backend_section(env_file, backend_env)
        self.stdout.write("")
        self._print_frontend_section(frontend_env_file, frontend_env)
        self.stdout.write("")
        self._print_runtime_values()
        self.stdout.write("")
        self._print_next_steps()

    def _print_backend_section(self, env_file: Path, env_values: Dict[str, str]) -> None:
        if env_file.exists():
            self.stdout.write(self.style.SUCCESS(f"1. Backend .env file found at {env_file}."))
        else:
            self.stdout.write(self.style.WARNING(
                f"1. Create a project-root .env file at {env_file} (copy .env.example)."
            ))
            self.stdout.write("   It should define AUTH0_DOMAIN and AUTH0_AUDIENCE.")
            self.stdout.write(
                "   (Even if you run commands from an activated virtualenv, manage.py still reads this project-root file.)"
            )
            return

        missing = [
            key for key in ("AUTH0_DOMAIN", "AUTH0_AUDIENCE") if key not in env_values or not env_values[key]
        ]
        if missing:
            self.stdout.write(self.style.WARNING(
                f"   Missing keys in {env_file.name}: " + ", ".join(missing)
            ))
        else:
            domain = env_values.get("AUTH0_DOMAIN", "")
            audience = env_values.get("AUTH0_AUDIENCE", "")
            self.stdout.write(f"   AUTH0_DOMAIN = {domain or '[blank]'}")
            self.stdout.write(f"   AUTH0_AUDIENCE = {audience or '[blank]'}")

    def _print_frontend_section(self, env_file: Path, env_values: Dict[str, str]) -> None:
        if env_file.exists():
            self.stdout.write(self.style.SUCCESS(f"2. Frontend .env.local located at {env_file}."))
        else:
            self.stdout.write(self.style.WARNING(
                f"2. Create frontend/.env.local at {env_file} with your Auth0 values."
            ))
            self.stdout.write("   Required keys: VITE_AUTH0_DOMAIN, VITE_AUTH0_CLIENT_ID, VITE_AUTH0_AUDIENCE.")
            return

        missing = [
            key
            for key in ("VITE_AUTH0_DOMAIN", "VITE_AUTH0_CLIENT_ID", "VITE_AUTH0_AUDIENCE")
            if key not in env_values or not env_values[key]
        ]
        if missing:
            self.stdout.write(self.style.WARNING(
                "   Missing keys in frontend/.env.local: " + ", ".join(missing)
            ))
        else:
            self.stdout.write("   Frontend Auth0 keys detected.")

    def _print_runtime_values(self) -> None:
        self.stdout.write(self.style.MIGRATE_LABEL("Runtime configuration"))
        domain_env = os.environ.get("AUTH0_DOMAIN")
        audience_env = os.environ.get("AUTH0_AUDIENCE")
        if domain_env:
            self.stdout.write(f"   ENV AUTH0_DOMAIN = {domain_env}")
        else:
            self.stdout.write("   ENV AUTH0_DOMAIN not set; Django will fall back to settings default.")

        if audience_env:
            self.stdout.write(f"   ENV AUTH0_AUDIENCE = {audience_env}")
        else:
            self.stdout.write(self.style.WARNING("   ENV AUTH0_AUDIENCE missing; Django will fail to start."))

        self.stdout.write(
            f"   settings.AUTH0_DOMAIN = {getattr(settings, 'AUTH0_DOMAIN', '[undefined]')}"
        )
        self.stdout.write(
            f"   settings.AUTH0_AUDIENCE = {getattr(settings, 'AUTH0_AUDIENCE', '[undefined]')}"
        )

    def _print_next_steps(self) -> None:
        self.stdout.write(self.style.MIGRATE_LABEL("Next steps"))
        self.stdout.write("   1. Ensure the Auth0 API Identifier is copied into both backend and frontend env files.")
        self.stdout.write("   2. Restart `python manage.py runserver` after editing .env.")
        self.stdout.write("   3. Restart `npm --prefix frontend run dev` after editing frontend/.env.local.")
        self.stdout.write("   4. Log in through the frontend; if tokens fail, re-run this command to re-check config.")

    def _read_env_file(self, path: Path) -> Dict[str, str]:
        if not path.exists():
            return {}

        result: Dict[str, str] = {}
        for raw_line in path.read_text().splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#"):
                continue
            if "=" not in line:
                continue
            key, value = line.split("=", 1)
            result[key.strip()] = value.strip().strip("\"'")
        return result
