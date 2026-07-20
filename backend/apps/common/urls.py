from django.urls import path
from . import views

urlpatterns = [
    path('search/', views.global_search),
    path('search/suggestions/', views.search_suggestions),
]
