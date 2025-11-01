from django.contrib.auth import authenticate
from django.conf import settings
import json

import jwt
import requests
from jwt import InvalidTokenError
from jwt.exceptions import InvalidAudienceError, InvalidIssuerError
from rest_framework.exceptions import AuthenticationFailed


def jwt_get_username_from_payload_handler(payload):
    username = payload.get('sub').replace('|', '.')
    authenticate(remote_user=username)
    return username

def jwt_decode_token(token):
    try:
        header = jwt.get_unverified_header(token)
    except InvalidTokenError as exc:
        raise AuthenticationFailed("Invalid JWT header. Ensure the token is well-formed.") from exc

    jwks_url = f"https://{settings.AUTH0_DOMAIN}/.well-known/jwks.json"
    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
    except requests.RequestException as exc:
        raise AuthenticationFailed(
            "Unable to retrieve signing keys from Auth0. Check AUTH0_DOMAIN and network connectivity."
        ) from exc

    jwks = response.json()
    public_key = None
    for jwk in jwks['keys']:
        if jwk['kid'] == header['kid']:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

    if public_key is None:
        raise AuthenticationFailed('Public key not found in JWKS. Verify the token kid matches Auth0 keys.')

    issuer = f"https://{settings.AUTH0_DOMAIN}/"
    try:
        return jwt.decode(
            token,
            public_key,
            audience=settings.AUTH0_AUDIENCE,
            issuer=issuer,
            algorithms=['RS256']
        )
    except InvalidAudienceError as exc:
        raise AuthenticationFailed(
            "JWT audience does not match settings.AUTH0_AUDIENCE. Update AUTH0_AUDIENCE to your Auth0 API Identifier."
        ) from exc
    except InvalidIssuerError as exc:
        raise AuthenticationFailed(
            "JWT issuer mismatch. Ensure AUTH0_DOMAIN matches your Auth0 tenant domain."
        ) from exc
    except InvalidTokenError as exc:
        raise AuthenticationFailed("Failed to verify JWT. Confirm the access token is valid and unexpired.") from exc

def get_token_auth_header(request):
    """Obtains the Access Token from the Authorization Header
    """
    auth = request.META.get("HTTP_AUTHORIZATION", None)
    if not auth:
        raise AuthenticationFailed("Authorization header is expected.")

    parts = auth.split()

    if parts[0].lower() != "bearer":
        raise AuthenticationFailed("Authorization header must start with Bearer.")
    if len(parts) == 1:
        raise AuthenticationFailed("Token not found.")
    if len(parts) > 2:
        raise AuthenticationFailed("Authorization header must be Bearer token.")

    token = parts[1]

    return token

# backend/utils.py
import re

def camel_to_snake(name: str) -> str:
    """Convert camelCase / PascalCase to snake_case."""
    s1 = re.sub(r'(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def parse_comma_separated_string(value: str | None) -> list[str]:
    """Split a comma-separated query parameter into individual values."""

    if not value:
        return []

    parts = [segment.strip() for segment in value.split(",")]
    return [segment for segment in parts if segment]
