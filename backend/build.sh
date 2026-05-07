#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
mkdir -p media/media
cp media/*.mp3 media/*.lrc media/*.jpg media/*.png media/media/ 2>/dev/null || true
python manage.py populate
