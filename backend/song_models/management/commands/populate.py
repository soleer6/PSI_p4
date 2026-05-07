# Script que:
# Elimina los datos previos almacenados en la base de datos
# Crea canciones y usuarios
# Puebla la tabla intermedia SongUser

from django.core.management.base import BaseCommand
from song_models.models import Song, SongUser
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Populate the database with sample data'

    def handle(self, *args, **kwargs):
        # 1. Eliminar registros previos
        self.stdout.write('Deleting old data...')
        SongUser.objects.all().delete()
        Song.objects.all().delete()
        User.objects.all().delete()

        # 2. Crear superusuario alumnodb
        self.stdout.write('Creating superuser alumnodb...')
        admin_user = User.objects.create_superuser(
            username='alumnodb',
            password='alumnodb',
            email='alumnodb@example.com'
        )

        # 3. Crear usuarios de prueba
        self.stdout.write('Creating test users...')
        user1 = User.objects.create_user(
            username='testuser1',
            password='testpass1',
            email='test1@example.com'
        )
        user2 = User.objects.create_user(
            username='testuser2',
            password='testpass2',
            email='test2@example.com'
        )

        # 4. Crear canciones (nombres de fichero exactos del repo)
        self.stdout.write('Creating songs...')

        song1 = Song.objects.create(
            title='Here in the real world',
            artist='Alan Jackson',
            language='EN',
            audio_file='media/Alan Jackson - Here In The Real World.mp3',
            lrc_file='media/Alan Jackson - Here In The Real World.lrc',
            background_image='media/Alan Jackson - Here In The Real World.jpg',
            category='COUNTRY',
        )

        song2 = Song.objects.create(
            title='Super Trouper',
            artist='ABBA',
            language='EN',
            audio_file='media/ABBA - Super Trouper.mp3',
            lrc_file='media/ABBA - Super Trouper.lrc',
            background_image='media/ABBA - Super Trouper.jpg',
            category='POP',
        )

        song3 = Song.objects.create(
            title="Don't Forget to Remember",
            artist='Beegees',
            language='EN',
            audio_file="media/Beegees - Don't Forget to Remember.mp3",
            lrc_file="media/Beegees - Don't Forget to Remember.lrc",
            background_image="media/Beegees - Dont Forget to Remember.jpg",
            category='POP',
        )

        # 5. Crear SongUser (dispara signal -> incrementa number_times_played)
        self.stdout.write('Creating SongUser relationships...')
        SongUser.objects.create(
            song=song1,
            user=user1,
            correct_guesses=8,
            wrong_guesses=2,
        )
        SongUser.objects.create(
            song=song2,
            user=user1,
            correct_guesses=5,
            wrong_guesses=5,
        )
        SongUser.objects.create(
            song=song1,
            user=user2,
            correct_guesses=10,
            wrong_guesses=0,
        )
        SongUser.objects.create(
            song=song3,
            user=admin_user,
            correct_guesses=3,
            wrong_guesses=7,
        )

        self.stdout.write(self.style.SUCCESS(
            'Database populated successfully!'
        ))
