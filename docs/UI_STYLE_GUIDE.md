# WorldCup Atlas UI Style Guide

## Direction

WorldCup Atlas should feel like a premium digital football museum and historical sports archive.

It should not look like:

- a betting site
- a generic admin dashboard
- an official FIFA product

## Colors

- Background: #06111F
- Surface: #0E1A2A
- Surface Alt: #142338
- Border: #253449
- Gold: #F4C95D
- Gold Muted: #C9A13F
- Text Primary: #F8FAFC
- Text Secondary: #CBD5E1
- Green Accent: #1F7A4D
- Red Card: #EF4444
- Yellow Card: #FACC15

## UI Rules

- Use MUI only.
- Do not add Tailwind CSS.
- Use the project theme from `src/theme/theme.ts`.
- Prefer reusable components.
- Detail pages should use tabs and sections.
- Browsing pages may use side filters.
- All cards should be clearly clickable when they navigate.
- Do not hardcode real historical stats once the database exists.
