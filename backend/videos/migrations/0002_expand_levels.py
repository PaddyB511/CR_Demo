from django.db import migrations


LEVEL_MAP = {
    # Old value -> New value heuristic
    "Beginner": "Beginner 1",
    "Intermediate": "Intermediate 1",
    "Advanced": "Advanced",
}


def forwards(apps, schema_editor):
    Video = apps.get_model('videos', 'Video')
    for old, new in LEVEL_MAP.items():
        Video.objects.filter(level=old).update(level=new)


def backwards(apps, schema_editor):
    # Collapse granular levels back to coarse originals (best-effort)
    Video = apps.get_model('videos', 'Video')
    reverse_map = {
        "Beginner 0": "Beginner",
        "Beginner 1": "Beginner",
        "Beginner 2": "Beginner",
        "Intermediate 1": "Intermediate",
        "Intermediate 2": "Intermediate",
        "Advanced": "Advanced",
        "Native": "Advanced",  # fallback
    }
    for new, old in reverse_map.items():
        Video.objects.filter(level=new).update(level=old)


class Migration(migrations.Migration):
    dependencies = [
        ('videos', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
