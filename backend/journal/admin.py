from django.contrib import admin
from .models import UserViewLog, OffPlatformLog, UserWordFrequency

@admin.register(UserViewLog)
class UserViewLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "video", "watch_date", "watch_time",
                    "video_time_start", "video_time_end")
    list_filter = ("watch_date",)
    search_fields = ("user__email", "video__title", "video__on_platform_id")

@admin.register(OffPlatformLog)
class OffPlatformLogAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "date_start", "date_end", "time_duration", "comment")
    list_filter = ("date_start",)
    search_fields = ("user__email", "comment")

@admin.register(UserWordFrequency)
class UserWordFrequencyAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "word", "count")
    search_fields = ("user__email", "word")