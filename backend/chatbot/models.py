from django.db import models


class ChatSession(models.Model):
    """Phiên chat của người dùng"""
    user = models.ForeignKey(
        'accounts.User', on_delete=models.CASCADE,
        null=True, blank=True, related_name='chat_sessions'
    )
    session_key = models.CharField(max_length=100, unique=True, help_text='Key định danh phiên (cho cả khách)')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-created_at']

    def __str__(self):
        return f"Phiên chat {self.session_key}"


class ChatMessage(models.Model):
    """Từng tin nhắn trong phiên chat"""
    ROLE_CHOICES = [
        ('user', 'Người dùng'),
        ('assistant', 'Chatbot'),
    ]

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.role}] {self.content[:50]}"
