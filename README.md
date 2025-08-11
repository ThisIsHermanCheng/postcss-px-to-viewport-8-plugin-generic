# postcss-px-to-viewport-8-plugin-generic

A [PostCSS](https://github.com/postcss/postcss) plugin that converts px units to viewport units (vw, vh, vmin, vmax).

## Problem

When using [postcss-px-to-viewport](https://github.com/evrone/postcss-px-to-viewport), the console shows the following warning:

```js
postcss-px-to-viewport: postcss.plugin was deprecated. Migration guide: https://evilmartians.com/chronicles/postcss-8-plugin-migration

```

## Solution

Replace `postcss-px-to-viewport` with `postcss-px-to-viewport-8-plugin-generic`

Note the corresponding library versions:

```js
  "postcss": "^8.3.8", // Version 8.0.0 will not convert units
  "postcss-loader": "^6.1.1",
```

## Introduction

If your styles need to adjust width based on viewport size, this script can convert px units in your CSS to vw units, where 1vw equals 1/100 of the viewport width.

## Input

```css
.class {
  margin: -10px 0.5vh;
  padding: 5vmin 9.5px 1px;
  border: 3px solid black;
  border-bottom-width: 1px;
  font-size: 14px;
  line-height: 20px;
}

.class2 {
  padding-top: 10px; /* px-to-viewport-ignore */
  /* px-to-viewport-ignore-next */
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 20px;
  line-height: 30px;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

## Output

```css
.class {
  margin: -3.125vw 0.5vh;
  padding: 5vmin 2.96875vw 1px;
  border: 0.9375vw solid black;
  border-bottom-width: 1px;
  font-size: 4.375vw;
  line-height: 6.25vw;
}

.class2 {
  padding-top: 10px;
  padding-bottom: 10px;
  /* Any other comment */
  border: 1px solid black;
  margin-bottom: 1px;
  font-size: 6.25vw;
  line-height: 9.375vw;
}

@media (min-width: 750px) {
  .class3 {
    font-size: 16px;
    line-height: 22px;
  }
}
```

## Installation

```js

npm install postcss-px-to-viewport-8-plugin-generic -D
or
yarn add postcss-px-to-viewport-8-plugin-generic -D
```

## Configuration parameters are consistent with [postcss-px-to-viewport](https://www.npmjs.com/package/postcss-px-to-viewport)

**Default options:**

```
{
  unitToConvert: 'px',
  viewportWidth: 1920,
  unitPrecision: 5,
  propList: ['*'],
  viewportUnit: 'vw',
  fontViewportUnit: 'vw',
  selectorBlackList: [],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true,
  exclude: [],
  except: [],
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568,
  minViewportWidth:1900
}
```

## API Description

| Parameter | Description | Type | Default |
| :-- | --- | --- | --- |
| `unitToConvert` | Unit to convert, default is px | `string` | px |
| `viewportWidth` | Design viewport width. If a function is passed, the function parameter is the file path being processed. Function returns `undefined` to skip conversion | `number \| Function` | 320 |
| `unitPrecision` | Precision retained after unit conversion | `number` | 5 |
| `propList` | List of properties that can be converted to vw | `string[]` | ['*'] |
| `viewportUnit` | Viewport unit to use | `string` | vw |
| `fontViewportUnit` | Viewport unit used for fonts | `string` | vw |
| `selectorBlackList` | CSS selectors to ignore, will not be converted to viewport units, using original px units | `string[]` | [] |
| `minPixelValue` | Minimum conversion value. If set to 1, only values greater than 1 will be converted | `number` | 1 |
| `mediaQuery` | Whether units in media queries need to be converted | `boolean` | false |
| `replace` | Whether to directly replace property values instead of adding fallback properties | `boolean` | true |
| `landscape` | Whether to add media query condition `@media (orientation: landscape)` based on `landscapeWidth` | `boolean` | false |
| `landscapeUnit` | Unit used in landscape mode | `string` | vw |
| `landscapeWidth` | Viewport width used in landscape mode. If a function is passed, the function parameter is the file path being processed. Function returns `undefined` to skip conversion | `number` | 568 |
| `exclude` | Ignore files in certain folders or specific files, such as files under node_modules. If the value is a regular expression, files matching this regex will be ignored. If an array is passed, the array values must be regular expressions | `Regexp` | undefined |
| `except` | Exception patterns for exclude. Files matching these patterns will be processed even if they match exclude patterns. Works in conjunction with exclude option to provide more granular control. If the value is a regular expression, files matching this regex will be processed despite matching exclude. If an array is passed, the array values must be regular expressions | `Regexp` | undefined |
| `include` | Files to convert, such as only converting files under 'src/mobile' (`include: /\/src\/mobile\//`). If the value is a regular expression, matching files will be included, otherwise the file will be excluded. If an array is passed, the array values must be regular expressions | `Regexp` | undefined |
| `minViewportWidth` | Minimum viewport width threshold. Only convert to viewport units when viewport width is greater than this value. When this option is set, media queries will be generated. Original px values are used for widths smaller than this, viewport units for widths larger than this | `number` | undefined |

## Additional Notes

- `propList` (Array) List of properties that can be converted to vw
  - Pass specific CSS properties;
  - You can pass wildcard "*" to match all properties, for example: ['*'];
  - Add "*" before or after the property to match specific properties. (e.g. ['*position*'] will match background-position-y)
  - Add "!" before specific properties to not convert units of that property. For example: ['*', '!letter-spacing'], will not convert letter-spacing
  - "!" and "*" can be used together. For example: ['*', '!font*'], will not convert font-size and font-weight properties
- `selectorBlackList` (Array) CSS selectors to ignore, will not be converted to viewport units, using original px units.

  - If the passed value is a string, as long as the selector contains the passed value, it will be matched
    - For example, if `selectorBlackList` is `['body']`, then `.body-class` will be ignored
  - If the passed value is a regular expression, it will be based on whether the CSS selector matches the regex
    - For example, if `selectorBlackList` is `[/^body$/]`, then `body` will be ignored, but `.body` will not

- You can use special comments to ignore conversion on single lines:

  - `/* px-to-viewport-ignore-next */` — on a separate line, prevents conversion on the next line.
  - `/* px-to-viewport-ignore */` — after the property on the right, prevents conversion on the same line.

Example:

```css
/* example input: */
.class {
  /* px-to-viewport-ignore-next */
  width: 10px;
  padding: 10px;
  height: 10px; /* px-to-viewport-ignore */
  border: solid 2px #000; /* px-to-viewport-ignore */
}

/* example output: */
.class {
  width: 10px;
  padding: 3.125vw;
  height: 10px;
  border: solid 2px #000;
}
```

There are several more reasons why your pixels may not convert, the following options may affect this: `propList`, `selectorBlackList`, `minPixelValue`, `mediaQuery`, `exclude`, `except`, `include`.

## Except API

The `except` option works in conjunction with the `exclude` option to provide more granular control over file processing. When both options are used together:

1. Files matching `exclude` patterns are normally excluded from processing
2. Files matching `except` patterns are processed even if they match `exclude` patterns
3. This allows you to exclude broad categories of files while making exceptions for specific files or folders

### Examples

**Exclude all node_modules except specific libraries:**
```js
{
  exclude: /\/node_modules\//,
  except: [/\/node_modules\/important-lib\//, /\/node_modules\/critical-lib\//]
}
```

**Exclude dist folder except specific subdirectories:**
```js
{
  exclude: /\/dist\//,
  except: /\/dist\/components\//
}
```

**Exclude test files except integration tests:**
```js
{
  exclude: [/\.test\./, /\.spec\./],
  except: /integration\.test\./
}
```

### Use Cases

- **Library Management**: Exclude all third-party libraries except those you want to customize
- **Build Optimization**: Exclude generated files except specific components that need processing
- **Development Workflow**: Exclude test files except specific test suites that need viewport conversion
- **Multi-environment Setup**: Exclude environment-specific files except the current target environment

## Usage with PostCSS Configuration File

**Add the following configuration to `postcss.config.js` file**

```js
module.exports = {
  plugins: {
    ...
    'postcss-px-to-viewport-8-plugin-generic': {
      viewportWidth: 1920,
      exclude: [/node_modules/],
      except: [/node_modules\/important-lib\//], // Process this library even though it's in node_modules
      unitToConvert: 'px',
      ...
    }
  }
}
```

## Vite Usage

**Add the following configuration to `vite.config.ts` file**

```ts
import { defineConfig } from 'vite';
import postcsspxtoviewport8plugin from 'postcss-px-to-viewport-8-plugin-generic';

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport8plugin({
          unitToConvert: 'px',
          viewportWidth: file => {
            let num = 1920;
            if (file.indexOf('m_') !== -1) {
              num = 375;
            }
            return num;
          },
          unitPrecision: 5, // Precision retained after unit conversion
          propList: ['*'], // List of properties that can be converted to vw
          viewportUnit: 'vw', // Viewport unit to use
          fontViewportUnit: 'vw', // Viewport unit used for fonts
          selectorBlackList: [], // CSS selectors to ignore, will not be converted to viewport units, using original px units.
          minPixelValue: 1, // Minimum conversion value. If set to 1, only values greater than 1 will be converted
          mediaQuery: true, // Whether units in media queries need to be converted
          replace: true, // Whether to directly replace property values instead of adding fallback properties
          exclude: [/node_modules\/ant-design-vue/], // Ignore files in certain folders or specific files, such as files under 'node_modules'
          except: [/node_modules\/important-ui-lib/], // Process these files even if they match exclude patterns
          include: [], // If include is set, only matching files will be converted
          landscape: false, // Whether to add media query condition @media (orientation: landscape) based on landscapeWidth
          landscapeUnit: 'vw', // Unit used in landscape mode
          landscapeWidth: 1024, // Viewport width used in landscape mode
          minViewportWidth: 768, // Minimum viewport width threshold. Only convert to viewport units when viewport width is greater than this value
        }),
      ],
    },
  },
});
```

## minViewportWidth Feature Example

When the `minViewportWidth` option is set, the plugin generates responsive CSS that only uses viewport units when the viewport width is greater than the specified threshold.

### Input

```css
.container {
  width: 750px;
  height: 400px;
  font-size: 16px;
}
```

### Configuration

```js
{
  viewportWidth: 750,
  minViewportWidth: 768
}
```

### Output

```css
.container {
  width: 750px;
  height: 400px;
  font-size: 16px;
}

@media (min-width: 768px) {
  .container {
    width: 100vw;
    height: 53.33333vw;
    font-size: 2.13333vw;
  }
}
```

This way, devices smaller than 768px will use the original px values, while devices larger than 768px will use responsive viewport units.

### Use Cases

`minViewportWidth` is particularly suitable for the following scenarios:

1. **Mobile-first design**: Maintain pixel precision on small screen devices, use responsive layout on large screen devices
2. **Progressive responsive**: Provide finer control for different screen sizes
3. **Performance optimization**: Avoid unnecessary viewport unit calculations on small screen devices

### Configuration Examples

```js
// Mobile-first configuration
{
  viewportWidth: 375,      // Based on mobile device design
  minViewportWidth: 768,   // Tablet and above devices use responsive
  unitPrecision: 3,
  viewportUnit: 'vw'
}

// Desktop-first configuration
{
  viewportWidth: 1920,     // Based on desktop design
  minViewportWidth: 1024,  // Desktop devices use responsive
  unitPrecision: 3,
  viewportUnit: 'vw'
}
```
