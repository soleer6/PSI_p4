from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from song_models.models import Song, SongUser
from .serializers import SongSerializer, SongUserSerializer


class SongPagination(PageNumberPagination):
    page_size = 3


class SongViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Song.objects.all()
    serializer_class = SongSerializer
    permission_classes = [AllowAny]
    pagination_class = SongPagination

    @action(detail=False, methods=['get'])
    def random(self, request):
        song = Song.objects.order_by('?').first()
        if song is None:
            return Response(
                {'detail': 'No songs available'},
                status=404
            )
        serializer = self.get_serializer(song)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def top(self, request):
        n = request.query_params.get('n', 3)
        try:
            n = int(n)
        except (ValueError, TypeError):
            return Response(
                {'detail': 'Invalid value for n'},
                status=400
            )
        songs = Song.objects.order_by('-number_times_played')[:n]
        serializer = self.get_serializer(songs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        title = request.query_params.get('title', None)
        if title is None:
            return Response(
                {'detail': 'Missing title parameter'},
                status=400
            )
        songs = Song.objects.filter(title__icontains=title)
        if not songs.exists():
            return Response(
                {'detail': 'No songs found'},
                status=404
            )
        serializer = self.get_serializer(songs, many=True)
        return Response(serializer.data)


class SongUserViewSet(viewsets.ModelViewSet):
    serializer_class = SongUserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SongUser.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
