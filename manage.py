#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
from pathlib import Path


def load_env() -> None:
    """Load environment variables from a local .env file if python-dotenv is installed."""

    env_path = Path(__file__).resolve().parent / ".env"

    try:
        from dotenv import load_dotenv  # type: ignore import-not-found
    except ImportError:
        if not env_path.exists():
            return
        for raw_line in env_path.read_text().splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            os.environ[key.strip()] = value.strip().strip('"\'')
        return

    # load_dotenv silently ignores missing files, which keeps behaviour consistent
    load_dotenv(dotenv_path=env_path, override=True)


def main():
    """Run administrative tasks."""
    load_env()
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
