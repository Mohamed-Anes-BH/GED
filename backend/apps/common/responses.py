from rest_framework import status
from rest_framework.response import Response


def success_response(data=None, message='OK', http_status=status.HTTP_200_OK):
	payload = {'message': message}
	if data is not None:
		payload['data'] = data
	return Response(payload, status=http_status)


def error_response(message='Une erreur est survenue.', errors=None, http_status=status.HTTP_400_BAD_REQUEST):
	payload = {'message': message}
	if errors is not None:
		payload['errors'] = errors
	return Response(payload, status=http_status)


def paginated_response(queryset, serializer_class, request, pagination_class=None):
	paginator = pagination_class() if pagination_class else None
	if paginator is None:
		serializer = serializer_class(queryset, many=True, context={'request': request})
		return Response(serializer.data)

	page = paginator.paginate_queryset(queryset, request)
	serializer = serializer_class(page, many=True, context={'request': request})
	return paginator.get_paginated_response(serializer.data)
