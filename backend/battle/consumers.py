import json
from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime

from urllib.parse import parse_qs
from channels.layers import get_channel_layer
from evaluation.task_registry import task_registry


# 全局房间状态字典
rooms = {}

async def notify_lobby_room_list():
    channel_layer = get_channel_layer()
    await channel_layer.group_send("lobby", {"type": "send_room_list"})

class RoomConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"room_{self.room_id}"

        qs = parse_qs(self.scope["query_string"].decode())
        self.username = qs.get("username", [None])[0]

        if not self.username:
            await self.close(code=4001)
            return

        room = rooms.setdefault(self.room_id, {})
        room.setdefault("id", self.room_id)
        #room.setdefault("host", self.username)
        if "host" not in room:
            room["host"] = self.username
        room.setdefault("type", "ConnectX")
        room.setdefault("status", "waiting")
        room.setdefault("users", [])
        room.setdefault("maxPlayers", 10)
        room.setdefault("rounds", 3)
        room.setdefault("mode", "model-vs-model")
        room.setdefault("firstPlayer", self.username)
        room.setdefault("locked", False)
        room.setdefault("password", "")
        room.setdefault("messages", [])  # ✅ 初始化聊天记录

        if room.get("locked") and self.username != room["host"]:
            await self.close(code=4002)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        room["users"] = [u for u in room["users"] if u["username"] != self.username]
        room["users"].append({
            "username": self.username,
            "status": "Not Uploaded",
            "isReady": False,
            "isHost": self.username == room["host"],
        })

        # ✅ 加入系统消息
        '''room["messages"].append({
            "sender": "System",
            "text": f"{self.username} joined the room.",
            "timestamp": datetime.now().isoformat(),
            "isSystem": True
        })
        room["messages"] = room["messages"][-50:]  # 限制最多 50 条'''
        # ✅ 避免重复添加相同的“joined”系统消息
        joined_text = f"{self.username} joined the room."
        if not any(m.get("text") == joined_text for m in room["messages"][-5:]):  # 最多查5条防止性能问题
            room["messages"].append({
                "sender": "System",
                "text": joined_text,
                "timestamp": datetime.now().isoformat(),
                "isSystem": True
            })
            room["messages"] = room["messages"][-50:]

        await self.broadcast_room()

    '''async def disconnect(self, close_code):
        room = rooms.get(self.room_id)
        if room:
            room["users"] = [u for u in room["users"] if u["username"] != self.username]

            # ✅ 离开房间系统消息
            room["messages"].append({
                "sender": "System",
                "text": f"{self.username} left the room.",
                "timestamp": datetime.now().isoformat(),
                "isSystem": True
            })
            room["messages"] = room["messages"][-50:]

            await self.broadcast_room()

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    '''
    async def disconnect(self, close_code):
        room = rooms.get(self.room_id)
        if not room:
            return

        # ✅ 用户已不在房间，不重复处理
        if not any(u["username"] == self.username for u in room["users"]):
            return

        room["users"] = [u for u in room["users"] if u["username"] != self.username]

        # ✅ 离开房间系统消息
        room["messages"].append({
            "sender": "System",
            "text": f"{self.username} left the room.",
            "timestamp": datetime.now().isoformat(),
            "isSystem": True
        })
        room["messages"] = room["messages"][-50:]

        await self.broadcast_room()
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        if msg_type == "toggle_ready":
            for u in rooms[self.room_id]["users"]:
                if u["username"] == self.username:
                    u["isReady"] = not u["isReady"]
            await self.broadcast_room()

        elif msg_type == "init_room":
            room = rooms[self.room_id]
            if self.username == room["host"]:
                room.update(data.get("room", {}))
                room.setdefault("users", [])
                room.setdefault("host", self.username)
                await self.broadcast_room()
                await notify_lobby_room_list()

        elif msg_type == "upload_model":
            for u in rooms[self.room_id]["users"]:
                if u["username"] == self.username:
                    u["status"] = "Uploaded"
                    u["isReady"] = True

            filename = data.get("filename")
            if filename:
                room = rooms[self.room_id]
                if "modelFiles" not in room:
                    room["modelFiles"] = {}
                room["modelFiles"][self.username] = filename

            await self.broadcast_room()

        elif msg_type == "kick_user":
            target = data.get("target")
            room = rooms.get(self.room_id)
            if room and self.username == room["host"]:
                room["users"] = [u for u in room["users"] if u["username"] != target]

                room["messages"].append({
                    "sender": "System",
                    "text": f"{target} was kicked by host.",
                    "timestamp": datetime.now().isoformat(),
                    "isSystem": True
                })
                room["messages"] = room["messages"][-50:]

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "kick_user_message",
                        "target": target,
                    }
                )
                await self.broadcast_room()

        elif msg_type == "start_battle":
            room = rooms[self.room_id]
            mode = room["mode"]
            first = room["firstPlayer"]

            def needs_model(user):
                if mode == "model-vs-model":
                    return True
                if mode == "human-vs-model":
                    return user["username"] != first
                return False

            not_ready = [u["username"] for u in room["users"] if
                         (needs_model(u) and u["status"] != "Uploaded") or not u["isReady"]]

            if not_ready:
                await self.send(text_data=json.dumps({
                    "type": "error",
                    "message": f"Not ready: {', '.join(not_ready)}"
                }))
            else:
                room["messages"].append({
                    "sender": "System",
                    "text": "Battle started by host.",
                    "timestamp": datetime.now().isoformat(),
                    "isSystem": True
                })
                room["messages"] = room["messages"][-50:]

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "start_game",
                        "message": "Battle started!",
                    }
                )

        elif data["type"] == "chat":
            message = data.get("message")
            if message and self.username:
                chat_obj = {
                    "sender": self.username,
                    "text": message,
                    "timestamp": datetime.now().isoformat(),
                    "isSystem": False
                }

                room = rooms[self.room_id]
                room["messages"].append(chat_obj)
                room["messages"] = room["messages"][-50:]

                # ✅ 广播单独的 chat 消息
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        "type": "chat_message",
                        "message": chat_obj["text"],
                        "sender": chat_obj["sender"],
                        "timestamp": chat_obj["timestamp"],
                        "isSystem": chat_obj["isSystem"],
                    }
                )


        elif msg_type == "evaluate":
            task_type = data.get("task_type", "Unknown").lower()
            evaluator = task_registry.get(task_type)
            payload = {
                "roomId": data.get("roomId"),
                "testFileName": data.get("testFileName"),
                "participants": data.get("participants", []),
                "rounds": data.get("rounds", 1),
                "firstPlayer": data.get("firstPlayer"),
                "battleMode": data.get("battleMode"),
                "modelFiles": data.get("modelFiles", {})
            }

            try:
                results = evaluator(payload)
            except Exception as e:
                results = [{"username": "system", "score": 0, "error": str(e)}]

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "broadcast_evaluate_result",
                    "results": results
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "chat",
            "username": event["sender"],  # ✅ sender 字段 -> username
            "message": event["message"],
            "timestamp": event["timestamp"],
            "isSystem": event["isSystem"],
        }))


    async def start_game(self, event):
        await self.send(text_data=json.dumps({
            "type": "start",
            "start": True
        }))

    async def broadcast_room(self):
        room = rooms[self.room_id]
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "room_state",
                "room": room
            }
        )

    async def room_state(self, event):
        await self.send(text_data=json.dumps({
            "type": "room_update",
            "room": event["room"]
        }))

    async def kick_user_message(self, event):
        if self.username == event["target"]:
            await self.send(text_data=json.dumps({
                "type": "kick"
            }))
            await self.close()

    async def broadcast_evaluate_result(self, event):
        await self.send(text_data=json.dumps({
            "type": "evaluate_result",
            "results": event["results"]
        }))


class LobbyConsumer(AsyncWebsocketConsumer):
    '''async def connect(self):
        await self.accept()
        # 初始时发送所有房间
        await self.send(text_data=json.dumps({
            "type": "room_list",
            "rooms": list(rooms.values())
        }))'''
    async def connect(self):
        await self.channel_layer.group_add("lobby", self.channel_name)  # ✅ 加入 lobby 群组
        await self.accept()
        await self.send(text_data=json.dumps({
                "type": "room_list",
                "rooms": list(rooms.values())
        }))

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("lobby", self.channel_name)


    async def receive(self, text_data):
        data = json.loads(text_data)
        msg_type = data.get("type")

        '''if msg_type == "create_room":
            room_id = f"room_{int(self.channel_name[-6:], 36)}"  # ✅ 随机生成
            new_room = {
                "id": room_id,
                "type": data["room"]["type"],
                "host": data["username"],
                "status": "waiting",
                "password": data["room"].get("password", ""),
                "users": [data["username"]],
                "playerCount": 1,
                "maxPlayers": 2,
            }
            rooms[room_id] = new_room

            await self.send(text_data=json.dumps({
                "type": "room_created",
                "room": new_room
            }))'''
        
        if data["type"] == "create_room":
            room_data = data["room"]
            host = room_data["host"]  # ✅ 正确读取

            # 自动添加房间字段
            room_data.update({
                #"type": room_data.get("type", "Unknown"),
                "status": "waiting",
                "maxPlayers": 10,
                "createdAt": datetime.now().isoformat(),
                "users": [],
                "rounds": room_data.get("rounds", 3),
                "mode": room_data.get("mode", "model-vs-model"),
                "firstPlayer": room_data.get("firstPlayer", host),
                "locked": room_data.get("locked", False),
                "password": room_data.get("password", ""),
            })


            rooms[room_data["id"]] = room_data  
            await self.broadcast_room_list()


        elif msg_type == "delete_room":
            room_id = data["roomId"]
            if room_id in rooms and rooms[room_id]["host"] == data["username"]:
                del rooms[room_id]
                '''await self.send(text_data=json.dumps({
                    "type": "room_deleted",
                    "roomId": room_id
                }))'''
                await self.broadcast_room_list()  # ✅ 广播更新给所有人 

        elif msg_type == "update_room_status":
            room_id = data["roomId"]
            if room_id in rooms and rooms[room_id]["host"] == data["username"]:
                rooms[room_id]["status"] = data["status"]
                await self.send(text_data=json.dumps({
                    "type": "room_updated",
                    "room": rooms[room_id]
                }))
                
        elif msg_type == "request_my_rooms":
            username = data.get("username")
            my_rooms = [r for r in rooms.values() if r.get("host") == username]
            await self.send(text_data=json.dumps({
                "type": "my_rooms",
                "rooms": my_rooms
            }))

    '''async def broadcast_room_list(self):
        await self.send(text_data=json.dumps({
            "type": "room_list",
            "rooms": list(rooms.values())   
        }))'''
    async def broadcast_room_list(self):
        await self.channel_layer.group_send(
            "lobby",
            {
                "type": "send_room_list"
            }
        )

    async def send_room_list(self, event):
        await self.send(text_data=json.dumps({
            "type": "room_list",
            "rooms": list(rooms.values())
    }))


