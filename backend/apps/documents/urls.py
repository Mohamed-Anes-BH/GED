from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, FavoriteViewSet

app_name = 'documents'

router = DefaultRouter()
router.register(r'documents', DocumentViewSet, basename='document')
router.register(r'favoris', FavoriteViewSet, basename='favorite')
router.register(r'favorites', FavoriteViewSet, basename='favorite_en')

urlpatterns = [
    path('', include(router.urls)),
]
