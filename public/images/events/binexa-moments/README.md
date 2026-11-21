# Binexa Moments

Add approved real company photos or videos here and populate `binexaMoments` in `lib/events.ts`.
Image item: { id, kind: 'image', src: '/images/events/binexa-moments/photo.webp', caption, category, date? }.
Video item: { id, kind: 'video', video: { src: '/images/events/binexa-moments/clip.mp4', poster? }, caption, category, date? }.
YouTube recap: { youtubeId: 'verified 11-character ID' } instead of a local video src.
Dates use YYYY-MM-DD. Do not reuse pre-launch photos unnecessarily.
