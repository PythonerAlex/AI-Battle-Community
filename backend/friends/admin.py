from django.contrib import admin
from .models import Friendship, FriendRequest, Invitation

# 注册模型到admin站点
admin.site.register(Friendship)
admin.site.register(FriendRequest)
admin.site.register(Invitation)