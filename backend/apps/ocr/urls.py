from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OcrJobViewSet, OcrResultViewSet, OcrPageViewSet

app_name = 'ocr'

router = DefaultRouter()
router.register(r'jobs', OcrJobViewSet, basename='ocrjob')
router.register(r'results', OcrResultViewSet, basename='ocrresult')
router.register(r'pages', OcrPageViewSet, basename='ocrpage')

urlpatterns = [
    path('ocr/', include(router.urls)),
]
