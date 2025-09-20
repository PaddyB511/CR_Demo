from rest_framework import serializers

class EmailCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    verification_code = serializers.CharField(required=False, allow_blank=True)
    update = serializers.BooleanField(required=False)

class UserUpdateSerializer(serializers.Serializer):
    dailyGoalMinutes = serializers.IntegerField(required=False, min_value=0)
    finalGoalMinutes = serializers.IntegerField(required=False, min_value=0)
    finalGoalDate = serializers.DateField(required=False)

class OffPlatformTimeSerializer(serializers.Serializer):
    startDate = serializers.DateField()
    endDate = serializers.DateField()
    minutes = serializers.IntegerField(min_value=1)
    startTime = serializers.CharField(required=False, allow_blank=True)
    endTime = serializers.CharField(required=False, allow_blank=True)
    comment = serializers.CharField(required=False, allow_blank=True)
