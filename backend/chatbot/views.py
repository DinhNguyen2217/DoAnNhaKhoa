import uuid
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from accounts.permissions import IsAdmin
from .models import ChatSession, ChatMessage
from .services import chat_with_gemini


class ChatView(APIView):
    """
    Endpoint chat với chatbot AI.
    Hỗ trợ cả khách (chưa đăng nhập) và người dùng đã đăng nhập.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        session_key = request.data.get('session_key') or str(uuid.uuid4())

        if not user_message:
            return Response({'detail': 'Vui lòng nhập tin nhắn.'}, status=status.HTTP_400_BAD_REQUEST)

        if len(user_message) > 1000:
            return Response({'detail': 'Tin nhắn quá dài (tối đa 1000 ký tự).'}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy hoặc tạo session
        session, _ = ChatSession.objects.get_or_create(
            session_key=session_key,
            defaults={'user': request.user if request.user.is_authenticated else None}
        )

        # Lấy lịch sử chat (tối đa 10 tin gần nhất để tránh token quá lớn)
        recent_messages = session.messages.order_by('-created_at')[:10]
        history = []
        for msg in reversed(recent_messages):
            role = 'user' if msg.role == 'user' else 'model'
            history.append({'role': role, 'parts': [msg.content]})

        # Gọi Gemini
        bot_response = chat_with_gemini(user_message, history)

        # Lưu tin nhắn
        ChatMessage.objects.create(session=session, role='user', content=user_message)
        ChatMessage.objects.create(session=session, role='assistant', content=bot_response)

        return Response({
            'session_key': session_key,
            'message': bot_response,
        })


class ChatHistoryView(APIView):
    """Xem lịch sử chat của session"""
    permission_classes = [AllowAny]

    def get(self, request, session_key):
        try:
            session = ChatSession.objects.get(session_key=session_key)
            messages = session.messages.order_by('created_at')
            data = [
                {
                    'role': msg.role,
                    'content': msg.content,
                    'created_at': msg.created_at,
                }
                for msg in messages
            ]
            return Response({'session_key': session_key, 'messages': data})
        except ChatSession.DoesNotExist:
            return Response({'messages': []})
