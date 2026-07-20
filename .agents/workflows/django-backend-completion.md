---
description: Complete all remaining Django backend features for AgrOdiv GED production readiness
---

# Django Backend Completion Workflow — AgrOdiv GED

## Context
Backend: Django 5 + DRF + PostgreSQL + Celery/Redis + Docker.
Root: `/home/anes/Documents/ged/backend`
Apps: `authentication`, `users`, `organization`, `documents`, `dossiers`, `courriers`, `workflow`, `ocr`, `notifications`, `audit`, `dashboard`, `settings_app`, `messagerie`, `common`.

## Priority Order

### P0 — Security & Infrastructure
1. Ensure `SECRET_KEY` / `DEBUG` / `ALLOWED_HOSTS` are env-driven (settings.py already patched — verify).
2. Verify `DEFAULT_PAGINATION_CLASS` is set and `PAGE_SIZE=20` is configured.
3. Verify `requirements.txt` has no duplicates and includes `pytesseract`, `pdf2image`.

### P1 — Functional Gaps (implement in services.py then expose in views.py)
4. **Backup service** (`settings_app/services.py`): implement `trigger_backup()` to actually `pg_dump` or zip the `media/` folder using `subprocess`, write the file, store path in `BackupRecord`.
5. **Restore backup** (`settings_app/services.py`): implement `restore_backup(backup_record)` to unzip / reload the backup file to its target path.
6. **Audit export PDF** (`audit/views.py`): add `export_pdf` action using `reportlab` or `weasyprint`, returning a `HttpResponse(content_type='application/pdf')`.
7. **Dashboard export PDF** (`dashboard/views.py`): implement the `export_stats` action to produce a PDF report.
8. **Password Reset** (`authentication/`): add `POST /api/auth/password/reset/` endpoint (email-based token using django's `PasswordResetForm`).
9. **Messagerie WebSocket** (`messagerie/consumers.py`): create a Django Channels consumer for real-time chat; register routing in `config/asgi.py` and `config/routing.py`.
10. **Notification `unread_count` polling endpoint** — verify it exists and is accessible.
11. **Search filter completeness** (`common/views.py`): ensure `global_search` passes `type`, `category`, `departement` query params as filters.

### P2 — Data Quality & Polish
12. **User list access control** (`users/views.py`): non-admin users should only see their own profile via `get_queryset`.
13. **Courrier history serializer** (`courriers/serializers.py`): ensure `CourrierHistoriqueSerializer` handles `content_type` + `object_id` GenericForeignKey gracefully.
14. **OcrJob `source_file` field**: accept a proper `document_id` FK reference instead of a raw string in the process endpoint.
15. **Add `created_by` filter** to `DocumentFilterSet` in `documents/views.py`.
16. **Dashboard `dossiers_supprimes` KPI** — add to `get_global_kpis()`.

## Implementation Rules
- Add business logic to `services.py`; call the service from the ViewSet action.
- Every new action must be protected by `permission_classes = [IsAuthenticated]` (or `IsAdminUser` for admin ops).
- Log all write operations via `AuditLog.objects.create(...)`.
- After changes, run: `docker compose exec backend python manage.py check` — must return 0 issues.
- If adding new packages, update `requirements.txt` and `Dockerfile`.

## Validation
// turbo
Run `docker compose exec backend python manage.py test --verbosity=2` — all tests must pass.
