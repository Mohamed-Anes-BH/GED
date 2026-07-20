from django.apps import AppConfig


class OcrConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ocr'

    def ready(self):
        from . import signals  # noqa: F401
