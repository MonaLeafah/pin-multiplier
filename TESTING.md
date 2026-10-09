# Verification record

Tested October 9, 2026 with Node 24.13.1 and Ramona Chrome. This record separates observed behavior from future business validation.

## Automated checks

Fifteen Node tests pass. They cover calendar boundaries, seven source-based angles, unsafe links, incomplete briefs, SVG escaping and finite text sizing, CSV quoting/formula protection, disclosure markers, saved-plan validation and review reset, unfinished-plan restoration, graphic completeness, blank trial outcomes, ZIP CRC32 known-answer data, and archive entry restrictions.

JavaScript syntax checks pass. Sample generation produces seven SVGs plus CSV and JSON. The repository includes a three-OS GitHub Actions workflow with read-only permissions and pinned official actions. See the live Actions result for its execution state; local test success alone does not establish remote CI success.

## Browser observations

- Desktop layout visually inspected at a 1440 × 900 test window (1425 CSS pixels available after scrollbar); mobile at 390 × 844 (375 CSS pixels available). Page width matched the available viewport on both.
- Keyboard Tab moved from article title to article link. Enter on an angle button selected the correct pin. Controls have labels, visible focus styles, and reduced-motion support.
- Review count changed from 0 to 1; a headline edit returned it to 0.
- A changed source title paused graphic/CSV exports. Building applied the new title; undo recovered the prior brief and pins.
- An empty headline prevented PNG export with a specific error. An unfinished JSON plan reopened with its empty draft intact.
- A real complete-packet download passed independent Python ZIP CRC validation: 18 files, seven PNGs at 1000 × 1500, seven SVGs, matching seven-row CSV/JSON plans, a seven-row trial tracker with blank outcomes, and instructions.
- All seven downloaded PNGs were assembled into a contact sheet and visually inspected. No clipping was visible in the fictional sample.
- Saved JSON reopened through the paste control. Corrupt JSON is handled with a visible recovery message. File-picker automation remains limited by the browser extension's file-URL permission; the paste route was verified without changing that permission.

## Evidence limits

The original fictional content has no traffic, sales, conversions, or measured time savings. Calendar dates are plans. CSV is a spreadsheet format, not a direct platform-import promise. A results tracker supports a trial; it does not establish attribution or ROI.

Contrast, labeling, keyboard entry, touch target sizes, and responsive layout were checked as practical accessibility basics. A complete screen-reader audit, every browser/font combination, and formal WCAG conformance were not established. Extreme-text unit checks establish finite sizing; they do not replace visual checks with every language and font.
