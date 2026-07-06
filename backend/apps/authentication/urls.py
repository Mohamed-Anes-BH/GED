from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

app_name = 'authentication'

urlpatterns = [
    # JWT Auth
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Custom
    path('logout/', views.logout_user, name='logout'),
    path('password/change/', views.change_password, name='change_password'),
    path('me/', views.get_current_user, name='get_current_user'),
]
