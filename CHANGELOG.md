# Change log

## 0.9.0 (2025-06-05)

### Changed:

Updated to node (v18) and dependencies.
Dropping support for node16.


## 0.8.0 (2025-03-17)

### Added:

1. Added new converter option: hyperlinkBaseUrl.
2. Added support for relative hyperlink paths. These will be extended to absolute with hyperlinkBaseUrl.

## 0.7.3 (2025-01-31)

### Bugfixes:

1. Fixed issue where cellBlockText's textColor property was being copied to cell properties.

## 0.7.2 (2024-10-25)

### Bugfixes:

1. Fixed issue with unknown color expression defaulting to black instead of nothing.

## 0.7.0 (2024-08-06)

### Added:

1. Added width and height properties to video blocks, containing value and unit properties.
2. Added altText property to image blocks. Maximum length is 200 characters.
3. Added support for generating width property from width attribute to image and video blocks.
4. Added support for generating height property from height attribute to video blocks.

## 0.6.0 (2024-07-23)

### Added:

1. Adding helper function for document traversal: traverseBlocks

## 0.5.0 (2024-07-09)

### Added:

1. Adding internal document linking related fields to the models of text and image blocks

## 0.4.0 (2024-07-02)

### Changed:

1. Changing widthUnit to widthWithUnit property, containing value and unit. Width property remained unchanged, returning value converted to em.
2. Refactor handling tables width with units based on settings option 'handleWidthWithUnits'.
3. Added handling images width with units based on settings option 'handleWidthWithUnits'.

## 0.3.4 (2024-06-11)

### Bugfixes:

1. Fixing table border="1" issue
   https://github.com/MyPureCloud/knowledge-html-converter/issues/5

## 0.3.3 (2024-04-05)

### Bugfixes:

1. Fixing issue with new lines(\n) in text blocks.

## 0.3.2 (2024-01-23)

### Changed:

1. Handling text blocks with style 'display: block' as block element.
2. Handling style attribute 'background' along with 'background-color' of \<span\> tags.
3. Handling 'border', 'bgcolor' attributes of \<table\> tags.
4. Handling tables' width with units based on settings option 'handleWidthWithUnits'.
5. Added support for <strike> tag

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
