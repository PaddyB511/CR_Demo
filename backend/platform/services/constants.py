try:
    from backend import constants as backend_constants
    ASSET_ROOT = backend_constants.ASSET_ROOT
    PAGE_SIZE = getattr(backend_constants, "PAGE_SIZE", 50)
except Exception:
    from pathlib import Path
    BASE_DIR = Path(__file__).resolve().parents[3]  # project root
    ASSET_ROOT = BASE_DIR / "assets"
    PAGE_SIZE = 50
