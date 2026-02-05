#!/bin/bash
# Upload images and videos to Supabase Storage
#
# Usage: ./scripts/upload-to-supabase.sh
#
# Make sure your .env file has the correct SUPABASE_SERVICE_ROLE_KEY
# Get it from: Supabase Dashboard > Settings > API > service_role key (secret)

set -e

# Load environment variables
if [ -f .env ]; then
  export $(grep -E '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY)=' .env | xargs)
fi

SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://vodntjdkxxwtftvvgtyy.supabase.co}"
SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"
BUCKET="assets"

if [ -z "$SERVICE_KEY" ] || [[ "$SERVICE_KEY" != eyJ* ]]; then
  echo "Error: Invalid SUPABASE_SERVICE_ROLE_KEY"
  echo "Please update .env with your service role key from Supabase Dashboard"
  echo "Location: Settings > API > service_role key (secret)"
  exit 1
fi

echo "=== Supabase Storage Upload ==="
echo "URL: $SUPABASE_URL"
echo "Bucket: $BUCKET"
echo ""

upload_file() {
  local file="$1"
  local dest_path="$2"
  local content_type="$3"
  local filename=$(basename "$file")

  echo -n "Uploading $filename... "

  response=$(curl -s -w "\n%{http_code}" -X POST "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${dest_path}/${filename}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: ${content_type}" \
    -H "x-upsert: true" \
    --data-binary @"$file")

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "OK"
  else
    echo "FAILED ($http_code)"
    echo "  $body"
  fi
}

# Upload main images (webp)
echo "--- Uploading main images ---"
for file in public/assets/images/*.webp; do
  [ -f "$file" ] && upload_file "$file" "images" "image/webp"
done

# Upload activity images (jpg)
echo ""
echo "--- Uploading activity images ---"
for file in public/assets/images/activities/*.jpg; do
  [ -f "$file" ] && upload_file "$file" "images/activities" "image/jpeg"
done

# Upload videos
echo ""
echo "--- Uploading videos ---"
for file in public/assets/videos/*.mp4; do
  [ -f "$file" ] && upload_file "$file" "videos" "video/mp4"
done

echo ""
echo "=== Upload Complete ==="
