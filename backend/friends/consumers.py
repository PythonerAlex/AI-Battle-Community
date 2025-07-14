import json
from channels.generic.websocket import AsyncWebsocketConsumer
from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from asgiref.sync import sync_to_async

# ✅ 全局变量用于追踪在线用户（username -> channel_name）
connected_users = {}

User = get_user_model()

class FriendConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # ✅ 获取用户名
        qs = parse_qs(self.scope["query_string"].decode())
        self.username = qs.get("username", [None])[0]

        if self.username:
            try:
                self.user = await sync_to_async(User.objects.get)(username=self.username)
            except User.DoesNotExist:
                self.user = AnonymousUser()
        else:
            self.user = AnonymousUser()

        self.scope["user"] = self.user

        if self.user.is_anonymous:
            await self.close()
            return

        # ✅ 接受连接
        await self.accept()

         # ✅ 将用户加入以用户名命名的组
        await self.channel_layer.group_add(
            f"user_{self.username}",
            self.channel_name
        )   
        print(f"✅ [FriendConsumer] {self.username} added to group user_{self.username}")
        # ✅ 广播上线消息给所有其他在线用户
        for other_username, other_channel in connected_users.items():
            if other_username != self.username:
                await self.channel_layer.send(
                    other_channel,
                    {
                        "type": "user.online",
                        "username": self.username,
                    }
                )

        connected_users[self.username] = self.channel_name
        print(f"[FriendsWS] {self.username} connected.")
        await self.send(text_data=json.dumps({
            "type": "online_users",
            "users": list(connected_users.keys())
        }))

    async def disconnect(self, close_code):
        username = getattr(self, "username", None)
        if username and username in connected_users:
            del connected_users[username]
            print(f"[FriendsWS] {username} disconnected.")

                    # ✅ 广播 user_offline 给所有还在线的用户
            for user, channel in connected_users.items():
                await self.channel_layer.send(channel, {
                    "type": "user.offline",
                    "username": username
                })

    '''async def receive(self, text_data):
        print(f"[FriendConsumer] Raw message received: {text_data}")
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "room_invitation":
            to_user = data.get("to")
            room_id = data.get("room_id")

            print(f"[Invite] {self.username} invited {to_user} to room {room_id}")

            if to_user in connected_users:
                await self.channel_layer.send(
                    connected_users[to_user],
                    {
                        "type": "send_room_invitation",  # ✅ CORRECT
                        "from_user": self.username,
                        "room_id": room_id,
                    }
                )
            else:
                print(f"[Invite] {to_user} is not online.")

            await self.send(text_data=json.dumps({
                "type": "confirmation",
                "message": f"Invitation sent to {to_user} for room {room_id}"
            }))
'''


    # ✅ 事件1：收到好友请求时通知用户
    async def friend_request(self, event):
        await self.send(text_data=json.dumps({
            "type": "friend_request",
            "from_user": event["from_user"],
            "request_id": event["request_id"],
        }))

    # ✅ 事件2：好友请求被接受时通知发起人
    async def friend_accepted(self, event):
        await self.send(text_data=json.dumps({
            "type": "friend_accepted",
            "by": event["by"],
            "request_id": event["request_id"],
        }) )   # ✅ 事件1：收到好友请求时通知用户
        

        
    # ✅ handler：处理 user_online 消息（发送给前端）
    async def user_online(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_online",
            "username": event["username"],
        }))

    async def user_offline(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_offline",
            "username": event["username"]
        }))

    async def friend_removed(self, event):
        await self.send(text_data=json.dumps({
            "type": "friend_removed",
            "by": event["by"],
        }))

    async def send_room_invitation(self, event):
        print(f"🔥 [FriendConsumer] send_room_invitation triggered for {self.username}")
        await self.send(text_data=json.dumps({
            "type": "room_invitation",
            "from": event["from_user"],
            "room_id": event["room_id"],
        }))
