from django.core.exceptions import ValidationError


def validate_file_size(file_obj, max_size_mb):
	max_size_bytes = max_size_mb * 1024 * 1024
	if file_obj.size > max_size_bytes:
		raise ValidationError(f'Le fichier dépasse la taille maximale autorisée de {max_size_mb} Mo.')


def validate_file_type(file_obj, allowed_types):
	content_type = getattr(file_obj, 'content_type', None)
	if content_type not in allowed_types:
		raise ValidationError('Le type de fichier n’est pas autorisé.')


def validate_reference_number(value):
	if not value or not value.strip():
		raise ValidationError('Le numéro de référence est requis.')
