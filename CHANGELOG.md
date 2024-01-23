# Change log

## 0.3.2 (2024-01-21)

### Changed:

1. Handling text blocks with style 'display: block' as block element.
2. Handling style attribute 'background' along with 'background-color' of \<span\> tags.
3. Handling 'border', 'bgcolor' attributes of \<table\> tags.
4. Handling tables' width with units based on settings option 'handleWidthWithUnits'.

## 0.3.1 (2024-01-16)

### Changed:

Update dev dependencies

## 0.3.0 (2023-12-18)

### Bugfixes:

1. Fixing issues with empty \<a\> tags
2. Handling relative image urls within a table
3. Data loss during conversion
4. Preserving color of \<span\> tags
5. Image tags with embedded source

## 0.2.0 (2023-12-14)

### Changed:

1. Change to support esm modules.

## 0.1.0 (2023-10-04)

### Added:

1. Add intial code which converts HTML string to the json format of knowledge document variation content. It handles the HTML [tags](src/models/html/tag.ts), [style attributes](src/models/html/style-attribute.ts).
