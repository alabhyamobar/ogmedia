import os

files_to_remove = [
    'public/editorial_portrait.webp',
    'public/icons.svg',
    'public/oghero2.mp4',
    'public/ogstatic1.mp4',
    'public/service_influencer.webp',
    'public/assets/card_skysolar.webp',
    'public/assets/card_syncboard.webp',
    'public/assets/cover_seoul.webp',
    'public/assets/cover_tunnel.webp',
    'public/assets/og_color_palette.webp',
    'public/assets/og_logo_backup.webp',
    'public/assets/og_logo_transparent_backup.webp',
    'public/assets/story_hunter.webp',
    'public/assets/story_warrior.webp',
    'public/assets/titan_zero.webp',
    '../dump.rdb'
]

total_freed = 0
deleted_count = 0
for f in files_to_remove:
    if os.path.exists(f):
        sz = os.path.getsize(f)
        try:
            os.remove(f)
            total_freed += sz
            deleted_count += 1
            print(f'Deleted: {f} ({sz/1024:.1f} KB)')
        except Exception as e:
            print(f'Failed to delete {f}: {e}')
    else:
        print(f'Already removed or not found: {f}')

print(f'\nTotal files removed: {deleted_count}')
print(f'Total storage freed: {total_freed / (1024 * 1024):.2f} MB')
