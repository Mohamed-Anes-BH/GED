import hashlib
from pathlib import Path


def get_client_ip(request):
	forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
	if forwarded:
		return forwarded.split(',')[0].strip()
	return request.META.get('REMOTE_ADDR')


def file_checksum(file_obj):
	hasher = hashlib.sha256()
	for chunk in file_obj.chunks():
		hasher.update(chunk)
	return hasher.hexdigest()


def file_extension(filename):
	return Path(filename).suffix.lower().lstrip('.')
