from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SongUser


@receiver(post_save, sender=SongUser)
def increment_song_play_count(sender, instance, created, **kwargs):
    """Increment number_times_played when a new SongUser is created."""
    if created:
        song = instance.song
        song.number_times_played += 1
        song.save()
