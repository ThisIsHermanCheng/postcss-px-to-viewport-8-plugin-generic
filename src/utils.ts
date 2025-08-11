import type { OptionType, ParentExtendType } from './types';

export const getUnit = (prop: string | string[], opts: OptionType) => {
  return prop.indexOf('font') === -1 ? opts.viewportUnit : opts.fontViewportUnit;
};

export const createPxReplace = (
  opts: OptionType,
  viewportUnit: string | number,
  viewportSize: number,
) => {
  return function (m: any, $1: string) {
    if (!$1) return m;
    const pixels = parseFloat($1);
    if (pixels <= opts.minPixelValue!) return m;
    const parsedVal = toFixed((pixels / viewportSize) * 100, opts.unitPrecision!);
    return parsedVal === 0 ? '0' : `${parsedVal}${viewportUnit}`;
  };
};

export const toFixed = (number: number, precision: number) => {
  const multiplier = Math.pow(10, precision + 1);
  const wholeNumber = Math.floor(number * multiplier);
  return (Math.round(wholeNumber / 10) * 10) / multiplier;
};

export const blacklistedSelector = (blacklist: string[], selector: string) => {
  if (typeof selector !== 'string') return;
  return blacklist.some((regex) => {
    if (typeof regex === 'string') return selector.indexOf(regex) !== -1;
    return selector.match(regex);
  });
};

export const isExclude = (reg: RegExp, file: string) => {
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
    throw new Error('options.exclude should be RegExp.');
  }
  return file.match(reg) !== null;
};

export const isExcept = (reg: RegExp, file: string) => {
  if (Object.prototype.toString.call(reg) !== '[object RegExp]') {
    throw new Error('options.except should be RegExp.');
  }
  return file.match(reg) !== null;
};

export const shouldExcludeFile = (
  excludeOptions: RegExp | RegExp[] | undefined,
  exceptOptions: RegExp | RegExp[] | undefined,
  file: string
): boolean => {
  // If no exclude options, don't exclude
  if (!excludeOptions) return false;

  // Check if file matches exclude patterns
  let isExcluded = false;
  if (Object.prototype.toString.call(excludeOptions) === '[object RegExp]') {
    isExcluded = isExclude(excludeOptions as RegExp, file);
  } else if (excludeOptions instanceof Array) {
    for (let i = 0; i < excludeOptions.length; i++) {
      if (isExclude(excludeOptions[i], file)) {
        isExcluded = true;
        break;
      }
    }
  } else {
    throw new Error('options.exclude should be RegExp or Array.');
  }

  // If not excluded by exclude patterns, don't exclude
  if (!isExcluded) return false;

  // If excluded but no except options, exclude the file
  if (!exceptOptions) return true;

  // Check if file matches except patterns (which would override exclude)
  if (Object.prototype.toString.call(exceptOptions) === '[object RegExp]') {
    return !isExcept(exceptOptions as RegExp, file);
  } else if (exceptOptions instanceof Array) {
    for (let i = 0; i < exceptOptions.length; i++) {
      if (isExcept(exceptOptions[i], file)) {
        return false; // Don't exclude because it matches an except pattern
      }
    }
    return true; // Exclude because it doesn't match any except pattern
  } else {
    throw new Error('options.except should be RegExp or Array.');
  }
};

export const declarationExists = (decls: ParentExtendType[], prop: string, value: string) => {
  return decls?.some((decl: ParentExtendType) => {
    return decl.prop === prop && decl.value === value;
  });
};

export const validateParams = (params: string, mediaQuery: boolean) => {
  return !params || (params && mediaQuery);
};
