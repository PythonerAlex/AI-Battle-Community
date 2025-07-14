# battle_platform/asgi.py
import os
import django

# ① 设置 Django 配置并初始化
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "battle_platform.settings")
django.setup()

# ② 导入所需模块
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# ✅ 导入多个 WebSocket 路由
from battle.routing import websocket_urlpatterns as battle_ws
from friends.routing import websocket_urlpatterns as friends_ws

# ✅ 合并所有 WebSocket 路由
combined_ws_patterns = battle_ws + friends_ws

# ③ 构建 ASGI 应用
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(combined_ws_patterns)
    ),
})


"""
ASGI config for battle_platform project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""
'''# battle_platform/asgi.py
import os
import django

# ① 先告诉 Django 去哪里找 settings，然后立即 setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "battle_platform.settings")
django.setup()

# ② 再做其余导入 —— 此时 settings/ORM 已准备好
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from battle.routing import websocket_urlpatterns   # ← 现在可以安全导入

# ③ ASGI 入口
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(              # 方案 A 保持默认栈
        URLRouter(websocket_urlpatterns)
    ),
})
'''