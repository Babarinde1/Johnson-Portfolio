# Phase 15 — Text Alignment & Technology Input Fix

## Changes

- Paragraph copy across public pages and the admin workspace now uses justified alignment, with the final line aligned to the reading direction for a natural finish.
- Main and admin content containers explicitly use logical `start` alignment so text does not inherit an unintended right alignment.
- The project editor now keeps the Technologies field as a separate text value while typing. Spaces and commas can be entered normally; technologies are split on commas and trimmed only when the project is saved.
- Editing an existing project pre-fills the text field from its saved technology array.

## Example

Enter: `Python, React, PyTorch, LangChain, Next.js`

Saved as: `['Python', 'React', 'PyTorch', 'LangChain', 'Next.js']`

## No database migration required

The existing `technologies` database column remains an array. This is a frontend input-state correction only.

## Verify locally

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

Open the admin project editor and test a technology name containing spaces, such as `Computer Vision`, as well as comma-separated entries. Review paragraphs on the Home, About, Project detail, and Contact pages at desktop and mobile widths.
