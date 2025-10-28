from django.contrib.auth import authenticate
import json

import jwt
import requests


def jwt_get_username_from_payload_handler(payload):
    print(payload)
    username = payload.get('sub').replace('|', '.')
    authenticate(remote_user=username)
    return username

def jwt_decode_token(token):
    print(token)
    header = jwt.get_unverified_header(token)
    jwks = requests.get('https://{}/.well-known/jwks.json'.format('dev-t3crhfr5g3mrn5sk.eu.auth0.com')).json()
    public_key = None
    for jwk in jwks['keys']:
        if jwk['kid'] == header['kid']:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(jwk))

    if public_key is None:
        raise Exception('Public key not found.')

    issuer = 'https://{}/'.format('dev-t3crhfr5g3mrn5sk.eu.auth0.com')
    return jwt.decode(token, public_key, audience='https://cr/api/', issuer=issuer, algorithms=['RS256'])

def get_token_auth_header(request):
    """Obtains the Access Token from the Authorization Header
    """
    print(request)
    auth = request.META.get("HTTP_AUTHORIZATION", None)
    parts = auth.split()
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
