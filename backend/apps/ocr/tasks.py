from celery import shared_task
from .services import execute_ocr_job

@shared_task
def run_ocr_task(job_id):
    """Exécute le traitement OCR de manière asynchrone."""
    execute_ocr_job(job_id)
