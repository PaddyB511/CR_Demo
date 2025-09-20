from django.db import models

class Channel(models.Model):
    YOUTUBE = "youtube"
    PLATFORM_CHOICES = [(YOUTUBE, "YouTube")]

    name = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=32, choices=PLATFORM_CHOICES, default=YOUTUBE)

    def __str__(self):
        return self.name


class Speaker(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Video(models.Model):
    LEVEL_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    platform = models.CharField(max_length=32, default="youtube")
    # on-platform id (e.g., YouTube video id like 6ET0DMVxyNU). Keep it searchable.
    on_platform_id = models.CharField(max_length=32, db_index=True)

    language = models.CharField(max_length=8, default="ru")
    channel = models.ForeignKey(Channel, on_delete=models.PROTECT)
    duration = models.IntegerField(help_text="seconds")

    title = models.CharField(max_length=512)
    description = models.TextField(blank=True)
    upload_date = models.CharField(max_length=16, blank=True)  # keep string compatibility

    rating = models.FloatField(default=0.0)
    level = models.CharField(max_length=32, choices=LEVEL_CHOICES, default="Beginner")
    premium = models.BooleanField(default=False)

    # optional thumbnails/assets can stay on disk as before

    tags = models.ManyToManyField(Tag, related_name="videos", blank=True)
    speakers = models.ManyToManyField(Speaker, related_name="videos", blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["upload_date"]),
            models.Index(fields=["premium"]),
            models.Index(fields=["level"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.on_platform_id})"
