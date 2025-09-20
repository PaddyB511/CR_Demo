from rest_framework import serializers

class VideoIdSerializer(serializers.Serializer):
    videoId = serializers.CharField(min_length=3, max_length=64)

class SubtitleRequestSerializer(VideoIdSerializer):
    lang = serializers.CharField(min_length=2, max_length=8, required=False, default="ru")
