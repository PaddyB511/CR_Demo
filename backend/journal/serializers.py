from rest_framework import serializers
from .models import OffPlatformLog

class JournalNoteSerializer(serializers.ModelSerializer):
    date = serializers.DateField(write_only=True, required=False)
    startDate = serializers.DateField(write_only=True, required=False)
    endDate = serializers.DateField(write_only=True, required=False)
    minutes = serializers.IntegerField(write_only=True, min_value=1)

    attentionRate = serializers.CharField(source="attention_rate", required=False, allow_null=True, allow_blank=True)
    realityRates = serializers.ListField(source="reality_rates", child=serializers.CharField(), required=False, allow_null=True)
    inputComprehensibility = serializers.IntegerField(source="comprehensibility_percent", required=False, allow_null=True)
    totalInputMinutes = serializers.IntegerField(source="total_input_minutes_snapshot", read_only=True)

    class Meta:
        model = OffPlatformLog
        fields = [
            "id","date","startDate","endDate","minutes","activity","attentionRate","realityRates","inputComprehensibility","comment",
            "date_start","date_end","time_duration","totalInputMinutes",
        ]
        read_only_fields = ["date_start","date_end","time_duration","totalInputMinutes"]

    def validate(self, attrs):
        data = self.initial_data
        if not data.get("date") and not (data.get("startDate") and data.get("endDate")):
            raise serializers.ValidationError("Provide either 'date' OR both 'startDate' and 'endDate'.")
        return attrs

    def create(self, validated):
        from datetime import datetime
        user = self.context["request"].user
        minutes = int(self.initial_data.get("minutes"))
        comment = self.initial_data.get("comment", "")
        if self.initial_data.get("date"):
            d = self.initial_data["date"]
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
        for f in ["attention_rate","reality_rates","comprehensibility_percent","activity","comment"]:
            if f in validated:
                setattr(instance, f, validated[f])
        instance.save()
        return instance
