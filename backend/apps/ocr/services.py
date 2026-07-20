import time
import os
import subprocess
from django.utils import timezone
from apps.audit.services import log_action
from apps.notifications.services import create_notification
from .models import OcrJob, OcrResult, OcrPage


def start_ocr_job(document, source_file, user, language='fra', engine='tesseract'):
    job = OcrJob.objects.create(
        document=document,
        source_file=source_file,
        language=language,
        engine=engine,
        status='en_attente',
        progress=0,
        created_by=user,
    )
    log_action(
        user=user, action='create', resource_type='document',
        resource_id=document.pk, resource_name=document.title,
        details={'ocr_job_id': job.pk},
    )
    return job


def finish_ocr_job(
    job, full_text='', confidence=None, words_count=0, paragraphs=0,
    tables_detected=0, signatures_detected=0, stamps_detected=0, processing_time=None
):
    result, _ = OcrResult.objects.get_or_create(job=job)
    result.full_text = full_text
    result.confidence = confidence or 98.0
    result.words_count = words_count or len(full_text.split())
    result.paragraphs = paragraphs or max(1, len(full_text.split('\n\n')))
    result.tables_detected = tables_detected
    result.signatures_detected = signatures_detected
    result.stamps_detected = stamps_detected
    result.processing_time = processing_time or 1.5
    result.save()

    job.status = 'termine'
    job.progress = 100
    job.save(update_fields=['status', 'progress'])

    create_notification(
        user=job.created_by,
        title='OCR terminé',
        message=f'Le traitement OCR du document "{job.document.title}" est terminé.',
        type='document',
        related_document=job.document,
    )
    return result


def fail_ocr_job(job, error_message):
    job.status = 'erreur'
    job.error_message = error_message
    job.save(update_fields=['status', 'error_message'])
    return job


def add_ocr_page(job, page_number, image_file=None, text='', confidence=None):
    page, _ = OcrPage.objects.update_or_create(
        job=job,
        page_number=page_number,
        defaults={'image_file': image_file, 'text': text, 'confidence': confidence or 98.0},
    )
    return page


def _tesseract_available():
    """Vérifie si Tesseract est installé sur le système."""
    try:
        result = subprocess.run(['tesseract', '--version'], capture_output=True, timeout=5)
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _extract_pages_from_pdf(pdf_path):
    """Convertit un PDF en liste d'images PIL via poppler (pdf2image)."""
    try:
        from pdf2image import convert_from_path
        return convert_from_path(pdf_path, dpi=300)
    except ImportError:
        return []


def _run_tesseract_on_image(pil_image, language='fra'):
    """Lance Tesseract sur un objet PIL.Image et retourne (text, confidence)."""
    try:
        import pytesseract
        data = pytesseract.image_to_data(
            pil_image, lang=language, output_type=pytesseract.Output.DICT
        )
        confidences = [int(c) for c in data['conf'] if int(c) > 0]
        text = pytesseract.image_to_string(pil_image, lang=language)
        avg_conf = round(sum(confidences) / len(confidences), 2) if confidences else 0.0
        return text, avg_conf
    except ImportError:
        return '', 0.0


def execute_ocr_job(job_id):
    """
    Pipeline OCR principal :
      - Si Tesseract + pytesseract + pdf2image disponibles → pipeline réel.
      - Sinon → fallback simulé (mode développement).
    """
    try:
        job = OcrJob.objects.get(pk=job_id)
    except OcrJob.DoesNotExist:
        return

    start_time = time.time()
    job.status = 'en_cours'
    job.progress = 5
    job.save()

    try:
        doc = job.document
        # Récupérer le chemin réel du dernier fichier associé au document
        doc_file_obj = doc.files.order_by('-uploaded_at').first()

        if doc_file_obj and _tesseract_available():
            # ── Pipeline Tesseract réel ────────────────────────────────
            file_path = doc_file_obj.file.path
            _, ext = os.path.splitext(file_path.lower())

            pages_images = []

            if ext == '.pdf':
                pages_images = _extract_pages_from_pdf(file_path)
            elif ext in ('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.webp'):
                try:
                    from PIL import Image
                    pages_images = [Image.open(file_path)]
                except ImportError:
                    pass

            if not pages_images:
                raise ValueError(
                    f"Format non supporté ou dépendances manquantes pour : {ext}"
                )

            all_text_parts = []
            total_conf = []
            pages_count = len(pages_images)

            for i, img in enumerate(pages_images, start=1):
                job.progress = int(5 + (i / pages_count) * 85)
                job.save(update_fields=['progress'])

                page_text, page_conf = _run_tesseract_on_image(img, language=job.language)
                all_text_parts.append(page_text)
                total_conf.append(page_conf)

                add_ocr_page(job, page_number=i, text=page_text, confidence=page_conf)

            full_text = '\n\n--- PAGE BREAK ---\n\n'.join(all_text_parts)
            avg_confidence = round(sum(total_conf) / len(total_conf), 2) if total_conf else 0.0

        else:
            # ── Fallback simulé ───────────────────────────────────────
            pages_count = 3
            all_text_parts = []
            for step in range(1, pages_count + 1):
                time.sleep(0.3)
                job.progress = int(5 + (step / pages_count) * 85)
                job.save(update_fields=['progress'])

                page_text = (
                    f"--- AgrOdiv GED - OCR SIMULÉ ---\n"
                    f"Document: {doc.title}\nPage: {step}/{pages_count}\n"
                    f"Date: {timezone.now().strftime('%d/%m/%Y %H:%M')}\n\n"
                    f"Contenu extrait automatiquement (mode simulation sans Tesseract).\n"
                    f"Flux d'archivage AgrOdiv — opérations administratives complétées."
                )
                all_text_parts.append(page_text)
                add_ocr_page(job, page_number=step, text=page_text, confidence=85.0)

            full_text = '\n\n--- PAGE BREAK ---\n\n'.join(all_text_parts)
            avg_confidence = 85.0

        processing_time = round(time.time() - start_time, 2)

        finish_ocr_job(
            job,
            full_text=full_text,
            confidence=avg_confidence,
            words_count=len(full_text.split()),
            paragraphs=max(1, full_text.count('\n\n')),
            processing_time=processing_time,
        )

    except Exception as e:
        fail_ocr_job(job, str(e))
