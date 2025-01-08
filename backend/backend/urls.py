from django.contrib import admin
from django.urls import path
from myapp import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/login/', views.login_user, name='login'),
    path('api/register/', views.register_user, name='create_new_user'),
    path('api/user-details/<int:user_id>/', views.get_user_details, name='create_new_user'),
    path('api/update-user/<int:user_id>/', views.update_user_details, name='update_user'),
    path('api/frd-list/<int:user_id>/', views.toggle_friendship, name='toggle_friendship'),
    path('api/all-users/', views.all_users, name='get_all_users'),
    path('api/my-frnds/', views.my_friends, name='get_my_friends'),
    path('api/posts/', views.upload_post, name='upload_post'),
    path('api/homepage/', views.homepage_posts, name='homepage_of_user'),
    path('api/toggle-like/', views.toggle_like, name='toggle_like'),
    path('api/post-detail/<int:post_id>/', views.post_detail_view, name='post_details'),

    path('api/add-comment/', views.add_comment, name='add_comment'),
    path('api/delete-comment/', views.delete_comment, name='delete_comment'),

    path('api/get-my-post/<int:user_id>', views.get_my_posts, name='delete_comment'),
    path('api/delete-my-post/<int:post_id>', views.delete_my_post, name='delete_comment'),
]
