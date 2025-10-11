from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Whether the user has premium access (replaces legacy session-based premium flag)
    premium = models.BooleanField(default=False)
