#!/usr/bin/env bash
set -euo pipefail

in="$1"
name="$2"
long="${3:-480}"
fps="${4:-15}"
colors="${5:-128}"
out="$(dirname "$0")/../assets/media/$name.gif"

ffmpeg -v error -y -i "$in" -vf "fps=$fps,scale='if(gt(iw,ih),$long,-2)':'if(gt(iw,ih),-2,$long)':flags=lanczos,split[a][b];[a]palettegen=max_colors=$colors:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 "$out"
ls -la "$out"
