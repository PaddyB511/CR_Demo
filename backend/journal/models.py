from django.db import models
from django.conf import settings
from django.contrib.postgres.fields import ArrayField

# Create your models here.

class UserViewLog(models.Model):
    """Watch time entries per user/video.

    NOTE: Originally pointed at platform.Video; now targets videos.Video.
    Data migration not preserved (user confirmed it's fine to lose old rows).
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="view_logs")
    video = models.ForeignKey("videos.Video", null=True, blank=True, on_delete=models.SET_NULL, related_name="view_logs")
    watch_date = models.DateTimeField(db_index=True)
    watch_time = models.IntegerField(default=0)        # seconds
    video_time_start = models.FloatField(default=0.0)
    video_time_end = models.FloatField(default=0.0)

    class Meta:
        indexes = [models.Index(fields=["user", "watch_date"])]


class OffPlatformLog(models.Model):
    """
    Manual logs added in 'My journal' and used for totals.
    Now extended with journal-specific fields.
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="off_platform_logs")

    # base fields used by totals
    time_duration = models.IntegerField()              # seconds
    date_start = models.DateTimeField()
    date_end = models.DateTimeField()
    comment = models.TextField(blank=True, default="")

    # JOURNAL FIELDS (all optional -> won’t break old data)
    class Activity(models.TextChoices):
        LISTENING_WATCHING = "listening_watching", "Listening/Watching"
        READING = "reading", "Reading"
        SPEAKING = "speaking", "Speaking"
        WRITING = "writing", "Writing"
        OTHER = "other", "Other"

    activity = models.CharField(
        max_length=32,
        choices=Activity.choices,
        default=Activity.LISTENING_WATCHING
    )

    class AttentionRate(models.TextChoices):
        ACTIVE = "active", "Active 80–100%"
        PASSIVE = "passive", "Passive 20–80%"
        RADIO = "radio", "Radio 0–20%"

    attention_rate = models.CharField(max_length=16, choices=AttentionRate.choices, null=True, blank=True)

    # e.g. ['videos_movies','podcasts'] — Postgres ArrayField
    reality_rates = ArrayField(
        base_field=models.CharField(max_length=32),
        null=True,
        blank=True
    )

    # 0–100
    comprehensibility_percent = models.PositiveSmallIntegerField(null=True, blank=True)

    # Snapshot of total input minutes at save time (for your “Total Input” table column)
    total_input_minutes_snapshot = models.PositiveIntegerField(default=0)

    class Meta:
        indexes = [models.Index(fields=["user", "date_start"])]
        ordering = ["-date_start"]

    def __str__(self):
        return f"{self.user_id} - {self.date_start.date()} ({self.time_duration//60} min)"


class UserWordFrequency(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="word_freqs")
    word = models.CharField(max_length=128, db_index=True)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "word")
        ordering = ["-count", "word"]
