from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
	# Extend the default fieldsets to include 'premium'
	fieldsets = BaseUserAdmin.fieldsets + (
		("Subscription", {"fields": ("premium",)}),
	)
	add_fieldsets = BaseUserAdmin.add_fieldsets + (
		("Subscription", {"classes": ("wide",), "fields": ("premium",)}),
	)
	list_display = BaseUserAdmin.list_display + ("premium",)
	list_filter = BaseUserAdmin.list_filter + ("premium",)
	search_fields = BaseUserAdmin.search_fields
	ordering = BaseUserAdmin.ordering