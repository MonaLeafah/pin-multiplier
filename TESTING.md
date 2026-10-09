# Verification record

Tested October 9, 2026 with Node 24.13.1 and the authenticated Ramona Chrome session.

## Automated checks

Seven Node tests pass. They cover the seven unique angles and dates, leap-year and DST date boundaries, invalid dates, rejected unsafe URLs, incomplete inputs, escaped SVG text, exported dimensions, CSV quoting and formula protection, disclosure markers, and JSON restoration with corrupt-input rejection and review reset.

JavaScript syntax checks pass. The sample export command writes seven SVG files, one CSV, and one JSON plan without external dependencies.

## Browser observations

- Desktop interface inspected visually at the browser’s normal size.
- Mobile interface inspected at 390 × 844. DOM measurements reported page width 390 and viewport width 390.
- Checking a pin’s review control changed the count from 0 to 1. Editing its headline changed the count back to 0.
- The PNG button downloaded an actual PNG; independent file inspection confirmed 1000 × 1500 dimensions.
- CSV and JSON buttons downloaded actual files with seven entries. The edited headline was present in both and matched.
- Saved JSON was reopened through the paste-to-reopen control. The edited headline survived and all pins returned to Draft.
- Browser file-chooser automation was prevented by the extension’s file-URL permission. The paste route was verified instead; no extension permission was changed.

## Scope and limits

This is a functional demonstration using fictional content. It has no customer validation, observed campaign result, revenue history, attribution study, or measured time savings. Planned dates are not published schedules. CSV is a general spreadsheet format, not a claim of compatibility with a platform’s direct importer.

No AI call, remote image processing, account registration, automatic publishing, or analytics is part of the app.
