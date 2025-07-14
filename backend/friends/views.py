from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from .models import Friendship, FriendRequest, Invitation
from django.db import IntegrityError
from .serializers import (
    UserSerializer,
    FriendshipSerializer,
    FriendRequestSerializer,
    InvitationSerializer,
)

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


User = get_user_model()

# ✅ 获取当前用户的好友列表
class FriendListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friendships = Friendship.objects.filter(user1=user) | Friendship.objects.filter(user2=user)
        serializer = FriendshipSerializer(friendships, many=True)
        return Response(serializer.data)

class SendFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_username = request.data.get("to")
        try:
            to_user = User.objects.get(username=to_username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if request.user == to_user:
            return Response({"error": "Cannot add yourself"}, status=400)

        # ✅ 已是好友禁止请求
        if Friendship.objects.filter(user1=request.user, user2=to_user).exists() or \
           Friendship.objects.filter(user1=to_user, user2=request.user).exists():
            return Response({"error": "Already friends"}, status=400)

        # ✅ 删除所有历史请求记录（避免阻塞）
        FriendRequest.objects.filter(from_user=request.user, to_user=to_user).delete()

        # ✅ 是否已存在 from_user → to_user 请求（无论状态）
        #if FriendRequest.objects.filter(from_user=request.user, to_user=to_user).exists():
        #    return Response({"error": "Friend request already exists"}, status=400)
        # ✅ 只禁止重复 pending 状态的请求
        if FriendRequest.objects.filter(from_user=request.user, to_user=to_user, status="pending").exists():
            return Response({"error": "Friend request already sent"}, status=400)
        
        try:
            FriendRequest.objects.create(from_user=request.user, to_user=to_user)
        except IntegrityError:
            return Response({"error": "Friend request already exists (db constraint)"}, status=400)

        # ✅ 新增：通知对方刷新请求
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{to_user.username}",
            {
                "type": "friend.request",  # → 对应 consumer 的 friend_request handler
                "from_user": request.user.username,
                "request_id": FriendRequest.objects.get(from_user=request.user, to_user=to_user).id,
            }
        )

        return Response({"message": "Friend request sent"})


    
# ✅ 接受好友请求
class AcceptFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req_id = request.data.get("request_id")
        try:
            req = FriendRequest.objects.get(id=req_id, to_user=request.user)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        req.status = "accepted"
        req.save()

        exists = Friendship.objects.filter(
            user1=req.from_user, user2=req.to_user
        ).exists() or Friendship.objects.filter(
            user1=req.to_user, user2=req.from_user
        ).exists()

        if not exists:
            Friendship.objects.create(user1=req.from_user, user2=req.to_user)

        # ✅ 通知发起人：好友请求被接受
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{req.from_user.username}",
            {
                "type": "friend.accepted",
                "by": request.user.username,
                "request_id": req.id,
            }
        )

        # ✅ ✅ ✅ 新增：通知接收人自己刷新好友列表
        async_to_sync(channel_layer.group_send)(
            f"user_{request.user.username}",
            {
                "type": "friend.accepted",
                "by": req.from_user.username,
                "request_id": req.id,
            }
        )

        return Response({"message": "Friend request accepted"})

# ✅ 拒绝好友请求
class RejectFriendRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        req_id = request.data.get("request_id")
        try:
            req = FriendRequest.objects.get(id=req_id, to_user=request.user)
        except FriendRequest.DoesNotExist:
            return Response({"error": "Request not found"}, status=404)

        req.status = "rejected"
        req.save()
        return Response({"message": "Friend request rejected"})


# ✅ 获取所有发送给当前用户的好友请求（pending）
class PendingRequestsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = FriendRequest.objects.filter(to_user=request.user, status="pending")
        serializer = FriendRequestSerializer(requests, many=True)
        return Response(serializer.data)


# ✅ 获取在线用户（mock 实现，后续替换为 Redis 或数据库维护）
class OnlineUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: 替换为真实在线状态查询逻辑
        online_users = User.objects.exclude(id=request.user.id)[:5]  # 示例：前 5 个其他用户
        serializer = UserSerializer(online_users, many=True)
        return Response(serializer.data)


# ✅ 发送房间邀请
class SendInvitationView(APIView):
    permission_classes = [IsAuthenticated]
   
    def post(self, request):
        print("✅ [SendInvitationView] Called")
        to_username = request.data.get("to")
        room_id = request.data.get("room_id")

        try:
            to_user = User.objects.get(username=to_username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        Invitation.objects.create(from_user=request.user, to_user=to_user, room_id=room_id)
        channel_layer = get_channel_layer()

        async_to_sync(channel_layer.group_send)(
            f"user_{to_user.username}",  # 每个用户的WS group
            {
                "type": "send_room_invitation",#房间邀请，不是好友邀请！！
                "from_user": request.user.username,
                "room_id": room_id,
            }
        )
        print("✅ [SendInvitationView] to FriendConsumer")
        return Response({"message": "Invitation sent"})

# ✅ 删除好友关系
class RemoveFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        to_username = request.data.get("to")
        try:
            to_user = User.objects.get(username=to_username)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # 查找并删除好友关系（双向）
        deleted, _ = Friendship.objects.filter(
            user1=request.user, user2=to_user
        ).delete()

        deleted2, _ = Friendship.objects.filter(
            user1=to_user, user2=request.user
        ).delete()

        if deleted == 0 and deleted2 == 0:
            return Response({"error": "Not friends"}, status=400)
        
                # ✅ WebSocket 通知对方刷新好友列表
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"user_{to_user.username}",
            {
                "type": "friend.removed",  # → 前端会处理 friend.removed
                "by": request.user.username,
            }
        )

        return Response({"message": "Friend removed"})
