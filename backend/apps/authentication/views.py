from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from apps.users.serializers import UserSerializer
from .services import blacklist_refresh_token, change_user_password, log_logout

User = get_user_model()

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    """
    Déconnexion (blacklist le refresh token)
    """
    try:
        refresh_token = request.data.get("refresh")
        blacklist_refresh_token(refresh_token)
        log_logout(request.user, request=request)
        return Response({"detail": "Déconnexion réussie."}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({"detail": "Token invalide ou erreur de déconnexion."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Changer le mot de passe
    """
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not change_user_password(user, old_password, new_password):
        return Response({"detail": "L'ancien mot de passe est incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"detail": "Mot de passe mis à jour avec succès."}, status=status.HTTP_200_OK)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """
    Récupérer ou mettre à jour les informations de l'utilisateur connecté
    """
    if request.method == 'PATCH':
        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_request(request):
    """
    Demande de réinitialisation du mot de passe — envoie un email avec un lien de réinitialisation.
    Body: { "email": "user@example.com" }
    """
    email = request.data.get('email', '').strip()
    if not email:
        return Response({'detail': 'Email requis.'}, status=status.HTTP_400_BAD_REQUEST)

    form = PasswordResetForm({'email': email})
    if form.is_valid():
        form.save(
            request=request,
            use_https=request.is_secure(),
            email_template_name='registration/password_reset_email.html',
            subject_template_name='registration/password_reset_subject.txt',
            from_email=None,
        )
    # Always return success to avoid email enumeration
    return Response({'detail': 'Si un compte est associé à cet email, un lien de réinitialisation a été envoyé.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    """
    Confirmation de réinitialisation du mot de passe.
    Body: { "uid": "...", "token": "...", "new_password": "..." }
    """
    uid = request.data.get('uid', '')
    token = request.data.get('token', '')
    new_password = request.data.get('new_password', '')

    if not all([uid, token, new_password]):
        return Response({'detail': 'uid, token et new_password sont requis.'}, status=status.HTTP_400_BAD_REQUEST)

    User = get_user_model()
    try:
        user_pk = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_pk)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'detail': 'Lien invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'detail': 'Token invalide ou expiré.'}, status=status.HTTP_400_BAD_REQUEST)

    form = SetPasswordForm(user, {'new_password1': new_password, 'new_password2': new_password})
    if not form.is_valid():
        return Response({'detail': 'Mot de passe invalide.', 'errors': form.errors}, status=status.HTTP_400_BAD_REQUEST)

    form.save()
    return Response({'detail': 'Mot de passe réinitialisé avec succès.'})
