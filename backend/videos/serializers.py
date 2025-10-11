from rest_framework import serializers
from pathlib import Path
from .models import Video, Channel, Tag, Speaker

class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ["id", "name", "platform"]

class SpeakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Speaker
        fields = ["id", "name"]

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]

class VideoSerializer(serializers.ModelSerializer):
    channelName = serializers.CharField(source="channel.name", read_only=True)
    tagNames = serializers.SerializerMethodField()
    speakerNames = serializers.SerializerMethodField()
    thumbnailUrl = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = [
            "id","platform","on_platform_id","language","channel","channelName","duration",
            "title","description","upload_date","rating","level","premium",
            "tagNames","speakerNames","thumbnailUrl",
        ]
        read_only_fields = ["id","channelName","tagNames","speakerNames","thumbnailUrl"]

    def get_tagNames(self, obj):
        return list(obj.tags.values_list("name", flat=True))

    def get_speakerNames(self, obj):
        return list(obj.speakers.values_list("name", flat=True))

    def get_thumbnailUrl(self, obj):
        # Prefer local asset if it exists, else fall back to platform (YouTube) hosted thumbnail.
        local = Path('assets') / 'thumbnail' / obj.platform / f"{obj.id}.webp"
        if local.exists():
            return f"/assets/thumbnail/{obj.platform}/{obj.id}.webp"
        if obj.platform == 'youtube' and obj.on_platform_id:
            return f"https://img.youtube.com/vi/{obj.on_platform_id}/hqdefault.jpg"
        return ""

class VideoDetailSerializer(VideoSerializer):
    related = serializers.SerializerMethodField()

    class Meta(VideoSerializer.Meta):
        fields = VideoSerializer.Meta.fields + ["related"]

    def get_related(self, obj):
        # naive related: share at least one tag (excluding self)
        tag_ids = obj.tags.values_list("id", flat=True)
        if not tag_ids:
            return []
        qs = Video.objects.filter(tags__in=tag_ids).exclude(pk=obj.pk).distinct()[:10]
        return VideoSerializer(qs, many=True, context=self.context).data
