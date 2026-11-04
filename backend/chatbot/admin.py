from django.contrib import admin
from .models import ChatSession, ChatMessage


class ChatMessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['role', 'content', 'created_at']
    can_delete = False


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_key', 'user', 'created_at', 'updated_at']
    search_fields = ['session_key', 'user__username']
    readonly_fields = ['session_key', 'created_at', 'updated_at']
    inlines = [ChatMessageInline]
