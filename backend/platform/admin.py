from django.contrib import admin
from .models import (
    Channel, Speaker, Tag, Video,
    UserViewLog, OffPlatformLog, UserWordFrequency,
)

@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "platform")
    search_fields = ("name",)
    list_filter = ("platform",)

@admin.register(Speaker)
class SpeakerAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name")
    search_fields = ("name",)

class TagInline(admin.TabularInline):
    model = Video.tags.through
    extra = 0

class SpeakerInline(admin.TabularInline):
    model = Video.speakers.through
    extra = 0

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = (
        "id", "title", "on_platform_id", "channel", "level",
        "premium", "duration", "upload_date",
    )
    search_fields = ("title", "on_platform_id", "description")
    list_filter = ("platform", "level", "premium", "channel")
    inlines = [TagInline, SpeakerInline]
    autocomplete_fields = ("channel",)
    filter_horizontal = ("tags", "speakers")

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
