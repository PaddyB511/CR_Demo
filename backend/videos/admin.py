from django.contrib import admin
from .models import Channel, Speaker, Tag, Video

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