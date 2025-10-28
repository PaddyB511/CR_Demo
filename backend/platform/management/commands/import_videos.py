import csv
from datetime import date
from urllib.parse import urlparse, parse_qs
from django.core.management.base import BaseCommand
from django.db import transaction

from backend.platform.models import Channel, Speaker, Tag, Video


def extract_youtube_id(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if "youtu.be/" in url:
        return url.rsplit("/", 1)[-1].split("?")[0]
    parsed = urlparse(url)
    if parsed.hostname and "youtube" in parsed.hostname and parsed.path == "/watch":
        return parse_qs(parsed.query).get("v", [None])[0]
    return url.rsplit("/", 1)[-1].split("?")[0]


def parse_int_duration(val) -> int:
    if val is None:
        return 0
    s = str(val).strip()
    if not s:
        return 0
    if s.isdigit():
        return int(s)
    parts = s.split(":")
    try:
        parts = [int(p) for p in parts]
    except ValueError:
        return 0
    if len(parts) == 3:
        h, m, sec = parts
        return h * 3600 + m * 60 + sec
    if len(parts) == 2:
        m, sec = parts
        return m * 60 + sec
    if len(parts) == 1:
        return parts[0]
    return 0


def first_of(*keys):
    lowered = [k.lower() for k in keys]
    def getter(d: dict):
        for k, v in d.items():
            if k.lower().strip() in lowered:
                return v
        return ""
    return getter


GET_YT   = first_of("Youtube Link", "YouTube Link", "youtube", "youtube_id", "url", "link")
GET_T    = first_of("Title", "Video Title", "Video Name on Youtube", "Name")
GET_D    = first_of("Description", "Desc")
GET_DATE = first_of("UploadDate", "Upload Date", "PublishDate", "Publish Date", "Date")
GET_DUR  = first_of("Duration", "Length")
GET_LVL  = first_of("Level")
GET_ACC  = first_of("Access", "Premium", "Free/Premium")
GET_TAGS = first_of("Tags", "Tag")
GET_SP   = first_of("Speaker", "Speakers")
GET_CH   = first_of("Channel")


class Command(BaseCommand):
    help = "Import/update videos from a CSV into the DB"

    def add_arguments(self, parser):
        parser.add_argument("csv_path", type=str, help="Path to CSV (e.g., backend/assets/content_planner.csv)")
        parser.add_argument("--channel", type=str, default="Main", help="Default channel if none in CSV")
        parser.add_argument("--language", type=str, default="ru", help="Video language code")

    @transaction.atomic
    def handle(self, *args, **opts):
        csv_path = opts["csv_path"]
        default_channel_name = opts["channel"]
        default_language = opts["language"]

        default_channel, _ = Channel.objects.get_or_create(name=default_channel_name)

        created = updated = skipped = 0

        with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                self.stdout.write(self.style.ERROR("CSV appears to have no header row."))
                return

            self.stdout.write(self.style.NOTICE(f"Headers detected: {reader.fieldnames}"))
            for i, row in enumerate(reader, start=1):
                raw_link = GET_YT(row)
                ytid = extract_youtube_id(raw_link)
                if not ytid:
                    skipped += 1
                    self.stdout.write(self.style.WARNING(f"[row {i}] No YouTube ID in: {raw_link!r}"))
                    continue

                title = (GET_T(row) or "").strip()
                description = (GET_D(row) or "").strip()
                upload_date = (GET_DATE(row) or "").strip() or date.today().isoformat()
                duration = parse_int_duration(GET_DUR(row))

                level = (GET_LVL(row) or "Beginner").strip().title()
                access = (GET_ACC(row) or "free").strip().lower()
                premium = True if access in ("premium", "paid", "yes", "1") else False

                channel_name = (GET_CH(row) or default_channel_name).strip()
                channel, _ = Channel.objects.get_or_create(name=channel_name)

                video, is_new = Video.objects.get_or_create(
                    on_platform_id=ytid,
                    defaults=dict(
                        platform="youtube",
                        language=default_language,
                        channel=channel,
                        duration=duration,
                        title=title,
                        description=description,
                        upload_date=upload_date,
                        rating=0.0,
                        level=level,
                        premium=premium,
                    ),
                )

                if is_new:
                    created += 1
                    self.stdout.write(self.style.SUCCESS(f"[row {i}] created: {ytid} - {title}"))
                else:
                    changed = False
                    for field, val in [
                        ("channel", channel),
                        ("duration", duration),
                        ("title", title),
                        ("description", description),
                        ("upload_date", upload_date),
                        ("level", level),
                        ("premium", premium),
                    ]:
                        if getattr(video, field) != val:
                            setattr(video, field, val)
                            changed = True
                    if changed:
                        video.save()
                        updated += 1
                        self.stdout.write(self.style.SUCCESS(f"[row {i}] updated: {ytid} - {title}"))
                    else:
                        skipped += 1

                tags_raw = (GET_TAGS(row) or "")
                tags = [t.strip() for t in tags_raw.replace(";", ",").split(",") if t.strip()]
                if tags:
                    video.tags.clear()
                    for t in tags:
                        tag, _ = Tag.objects.get_or_create(name=t)
                        video.tags.add(tag)

                sp_raw = (GET_SP(row) or "")
                speakers = [s.strip() for s in sp_raw.replace(";", ",").split(",") if s.strip()]
                if speakers:
                    video.speakers.clear()
                    for s in speakers:
                        sp, _ = Speaker.objects.get_or_create(name=s)
                        video.speakers.add(sp)

        self.stdout.write(self.style.SUCCESS(
            f"Done. created={created}, updated={updated}, unchanged/skipped={skipped}"
        ))
