from collections import defaultdict
from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions, decorators, response
from rest_framework.response import Response

from .models import OffPlatformLog, UserViewLog, UserWordFrequency
from .serializers import JournalNoteSerializer


class IsOwner(permissions.BasePermission):
	def has_object_permission(self, request, view, obj):
		return getattr(obj, 'user_id', None) == getattr(request.user, 'id', None)


class JournalViewSet(viewsets.ModelViewSet):
	serializer_class = JournalNoteSerializer
	permission_classes = [permissions.IsAuthenticated, IsOwner]

	def get_queryset(self):
		qs = OffPlatformLog.objects.filter(user=self.request.user).order_by('-date_start')
		q_from = self.request.query_params.get('from')
		q_to = self.request.query_params.get('to')
		if q_from:
			qs = qs.filter(date_start__date__gte=q_from)
		if q_to:
			qs = qs.filter(date_start__date__lte=q_to)
		return qs

	def perform_create(self, serializer):
		user = self.request.user
		existing_minutes = (OffPlatformLog.objects.filter(user=user).aggregate(total=Sum('time_duration'))['total'] or 0)//60
		minutes_now = int(self.request.data.get('minutes', 0))
		obj = serializer.save()
		obj.total_input_minutes_snapshot = existing_minutes + minutes_now
		obj.save()

	def perform_update(self, serializer):
		instance = self.get_object()
		user = self.request.user
		others_minutes = (OffPlatformLog.objects.filter(user=user).exclude(pk=instance.pk).aggregate(total=Sum('time_duration'))['total'] or 0)//60
		obj = serializer.save()
		obj.total_input_minutes_snapshot = others_minutes + (obj.time_duration // 60)
		obj.save()

	@decorators.action(detail=False, methods=['get'], url_path='options', permission_classes=[permissions.AllowAny])
	def options_action(self, request):
		return response.Response({
			'activities': [
				{'value': 'listening_watching', 'label': 'Listening/Watching'},
				{'value': 'reading', 'label': 'Reading'},
				{'value': 'speaking', 'label': 'Speaking'},
				{'value': 'writing', 'label': 'Writing'},
				{'value': 'other', 'label': 'Other'},
			],
			'attentionRates': [
				{'value': 'active', 'label': 'Active 80–100%'},
				{'value': 'passive', 'label': 'Passive 20–80%'},
				{'value': 'radio', 'label': 'Radio 0–20%'},
			],
			'realityRates': [
				{'value': 'real_life', 'label': '100% Real life communication'},
				{'value': 'online_video_chat', 'label': '90% Online video chat'},
				{'value': 'videos_movies', 'label': '70% Videos, movies'},
				{'value': 'podcasts', 'label': '30% Podcasts'},
				{'value': 'other', 'label': 'Other'},
			]
		})

	@decorators.action(detail=False, methods=['get'], url_path='overview')
	def overview(self, request):
		user = request.user
		today = timezone.now().date()
		qs = OffPlatformLog.objects.filter(user=user)
		total_minutes = (qs.aggregate(total=Sum('time_duration'))['total'] or 0)//60
		today_minutes = (qs.filter(date_start__date__lte=today, date_end__date__gte=today).aggregate(total=Sum('time_duration'))['total'] or 0)//60
		return response.Response({'todayMinutes': int(today_minutes), 'totalMinutes': int(total_minutes)})

	@decorators.action(detail=False, methods=['get'], url_path='consistency/calendar')
	def consistency_calendar(self, request):
		user = request.user
		date2on_off2seconds = defaultdict(lambda: {'on': 0, 'off': 0})
		for row in (UserViewLog.objects.filter(user=user).values('watch_date__date').annotate(total=Sum('watch_time'))):
			d = row['watch_date__date'].strftime('%Y-%m-%d')
			date2on_off2seconds[d]['on'] += row['total'] or 0
		for l in OffPlatformLog.objects.filter(user=user).only('date_start','date_end','time_duration'):
			d1 = l.date_start.date(); d2 = l.date_end.date(); days = (d2-d1).days + 1
			per_day = (l.time_duration or 0)/max(days,1)
			for i in range(days):
				d = (d1 + timedelta(days=i)).strftime('%Y-%m-%d')
				date2on_off2seconds[d]['off'] += per_day
		return Response(sorted(date2on_off2seconds.items()))

	@decorators.action(detail=False, methods=['get'], url_path='word-frequency')
	def word_frequency(self, request):
		rows = UserWordFrequency.objects.filter(user=request.user).order_by('-count','word').values_list('word','count')
		return Response(list(rows))

	@decorators.action(detail=False, methods=['post'], url_path='word-frequency/reset')
	def word_frequency_reset(self, request):
		UserWordFrequency.objects.filter(user=request.user).delete()
		return Response('ok')

	@decorators.action(detail=False, methods=['get'], url_path='overall')
	def overall(self, request):
		user = request.user
		seconds_on = UserViewLog.objects.filter(user=user).aggregate(s=Sum('watch_time'))['s'] or 0
		seconds_off = OffPlatformLog.objects.filter(user=user).aggregate(s=Sum('time_duration'))['s'] or 0
		words = UserWordFrequency.objects.filter(user=user).aggregate(s=Sum('count'))['s'] or 0
		return Response({'hours': (seconds_on + seconds_off)/3600.0, 'words': words})
