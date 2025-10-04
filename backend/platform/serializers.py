from rest_framework import serializers
from .models import OffPlatformLog


# ===== existing serializers you already had =====
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


# ===== NEW: Journal note serializer =====
class JournalNoteSerializer(serializers.ModelSerializer):
    # Inputs from Step 1/2 UI
    date = serializers.DateField(write_only=True, required=False)  # if “for a day”
    startDate = serializers.DateField(write_only=True, required=False)
    endDate = serializers.DateField(write_only=True, required=False)
    minutes = serializers.IntegerField(write_only=True, min_value=1)

    attentionRate = serializers.CharField(
        source="attention_rate", required=False, allow_null=True, allow_blank=True
    )
    realityRates = serializers.ListField(
        source="reality_rates", child=serializers.CharField(), required=False, allow_null=True
    )
    inputComprehensibility = serializers.IntegerField(
        source="comprehensibility_percent", required=False, allow_null=True
    )

    # Read fields for the table
    totalInputMinutes = serializers.IntegerField(source="total_input_minutes_snapshot", read_only=True)

    class Meta:
        model = OffPlatformLog
        fields = [
            "id",
            # write inputs
            "date", "startDate", "endDate", "minutes",
            "activity", "attentionRate", "realityRates", "inputComprehensibility",
            "comment",
            # read outputs
            "date_start", "date_end", "time_duration",
            "totalInputMinutes",
        ]
        extra_kwargs = {
            "date_start": {"read_only": True},
            "date_end": {"read_only": True},
            "time_duration": {"read_only": True},
            "activity": {"required": False},
        }

    def validate(self, attrs):
        # accept either `date` OR (`startDate` and `endDate`)
        data = self.initial_data
        if not data.get("date") and not (data.get("startDate") and data.get("endDate")):
            raise serializers.ValidationError("Provide either 'date' OR both 'startDate' and 'endDate'.")
        return attrs

    def create(self, validated):
        """
        Build OffPlatformLog:
        - minutes -> time_duration (seconds)
        - date or startDate/endDate -> date_start/date_end
          We follow your existing convention (03:01 / 02:59) to separate days.
        """
        from datetime import datetime

        user = self.context["request"].user
        minutes = int(self.initial_data.get("minutes"))
        comment = self.initial_data.get("comment", "")

        if self.initial_data.get("date"):
            d = self.initial_data["date"]  # 'YYYY-MM-DD'
            date_start = datetime.fromisoformat(d + "T03:01:00")
            date_end = datetime.fromisoformat(d + "T03:02:00")
        else:
            s = self.initial_data["startDate"]
            e = self.initial_data["endDate"]
            date_start = datetime.fromisoformat(s + "T03:01:00")
            date_end = datetime.fromisoformat(e + "T02:59:00")

        obj = OffPlatformLog.objects.create(
            user=user,
            time_duration=minutes * 60,
            date_start=date_start,
            date_end=date_end,
            comment=comment,
            activity=validated.get("activity", OffPlatformLog.Activity.LISTENING_WATCHING),
            attention_rate=validated.get("attention_rate"),
            reality_rates=validated.get("reality_rates"),
            comprehensibility_percent=validated.get("comprehensibility_percent"),
        )
        return obj

    def update(self, instance, validated):
        # allow editing comment and attributes
        for field in ["attention_rate", "reality_rates", "comprehensibility_percent", "activity", "comment"]:
            if field in validated:
                setattr(instance, field, validated[field])
        instance.save()
        return instance
