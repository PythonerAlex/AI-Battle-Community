# friends/urls.py
from django.urls import path
from .views import (
    FriendListView,
    SendFriendRequestView,
    AcceptFriendRequestView,
    RejectFriendRequestView,
    PendingRequestsView,
    OnlineUsersView,
    SendInvitationView,
    RemoveFriendView,
    SendInvitationView,
)

urlpatterns = [
    path('list/', FriendListView.as_view(), name='friend-list'),
    path('send-request/', SendFriendRequestView.as_view(), name='send-friend-request'),
    path('accept-request/', AcceptFriendRequestView.as_view(), name='accept-friend-request'),
    path('reject-request/', RejectFriendRequestView.as_view(), name='reject-friend-request'),
    path('pending/', PendingRequestsView.as_view(), name='pending-requests'),
    path('online/', OnlineUsersView.as_view(), name='online-users'),
    path('invite/', SendInvitationView.as_view(), name='send-invitation'),
    path('remove-friend/', RemoveFriendView.as_view(), name='remove-friend'),
]
