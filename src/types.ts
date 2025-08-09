import type { Rule } from 'postcss';

export type OptionType = {
  //  /* px-to-viewport-ignore-next */  On another line, prevents conversion on the next line
  // /* px-to-viewport-ignore */  After the property on the right, prevents conversion on the same line

  /**
   * Unit to convert, default is "px"
   */
  unitToConvert?: string;
  /**
   * Design viewport width
   * Supports passing a function, the function parameter is the file path being processed
   */
  viewportWidth?: number | ((filePath: string) => number|undefined);
  /**
   * Design viewport height
   */
  viewportHeight?: number; // not now used; TODO: need for different units and math for different properties
  /**
   * Precision retained after unit conversion
   */
  unitPrecision?: number;
  /**
   * Viewport unit to use
   */
  viewportUnit?: string;
  /**
   * Viewport unit used for fonts
   */
  fontViewportUnit?: string; // vmin is more suitable.
  /**
   * CSS selectors to ignore, will not be converted to viewport units, using original px units
   * If the passed value is a string, as long as the selector contains the passed value, it will be matched: for example, if selectorBlackList is ['body'], then .body-class will be ignored
   * If the passed value is a regular expression, it will be based on whether the CSS selector matches the regex: for example, if selectorBlackList is [/^body$/], then body will be ignored, but .body will not
   */
  selectorBlackList?: string[];
  /**
   * List of properties that can be converted to vw
   * Pass specific CSS properties
   * You can pass wildcard "*" to match all properties, for example: ['*']
   * Add "*" before or after the property to match specific properties. (e.g. ['*position*'] will match background-position-y)
   * Add "!" before specific properties to not convert units of that property. For example: ['*', '!letter-spacing'], will not convert letter-spacing
   * "!" and "*" can be used together. For example: ['*', '!font*'], will not convert font-size and font-weight properties
   */
  propList?: string[];
  /**
   * Minimum conversion value. If set to 1, only values greater than 1 will be converted
   */
  minPixelValue?: number;
  /**
   * Whether units in media queries need to be converted
   */
  mediaQuery?: boolean;
  /**
   * Whether to directly replace property values instead of adding fallback properties
   */
  replace?: boolean;
  /**
   * Ignore files in certain folders or specific files, such as files under 'node_modules'
   * If the value is a regular expression, files matching this regex will be ignored
   * If an array is passed, the array values must be regular expressions
   */
  exclude?: RegExp | RegExp[];
  /**
   * If include is set, only matching files will be converted
   * If the value is a regular expression, matching files will be included, otherwise the file will be excluded
   * If an array is passed, the array values must be regular expressions
   */
  include?: RegExp | RegExp[];
  /**
   * Whether to add media query condition @media (orientation: landscape) based on landscapeWidth
   */
  landscape?: boolean;
  /**
   * Unit used in landscape mode
   */
  landscapeUnit?: string;
  /**
   * Viewport width used in landscape mode
   * Supports passing a function, the function parameter is the file path being processed
   */
  landscapeWidth?: number | ((filePath: string) => number|undefined);
  /**
   * Minimum viewport width threshold. Only convert to viewport units when viewport width is greater than this value
   * When this option is set, media queries will be generated. Original px values are used for widths smaller than this, viewport units for widths larger than this
   */
  minViewportWidth?: number;

};

export type ParentExtendType = { prop: string; value: string; params: string };

export type ParentType = {
  parent: Rule['parent'] & ParentExtendType;
};

export type RuleType = Omit<Rule, 'parent'> & ParentType;
