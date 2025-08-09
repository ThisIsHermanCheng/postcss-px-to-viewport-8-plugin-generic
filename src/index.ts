import { getUnitRegexp } from './pixel-unit-regexp';
import { createPropListMatcher } from './prop-list-matcher';
import { OptionType, ParentExtendType, RuleType } from './types';
import {
  blacklistedSelector,
  createPxReplace,
  declarationExists,
  getUnit,
  isExclude,
  validateParams,
} from './utils';
import objectAssign from 'object-assign';

import { AtRule, Root, Rule } from 'postcss';
import postcss from 'postcss';

const defaults: Required<Omit<OptionType, 'exclude' | 'include' | 'minViewportWidth'>> = {
  unitToConvert: 'px',
  viewportWidth: 320,
  viewportHeight: 568, // not now used; TODO: need for different units and math for different properties
  unitPrecision: 5,
  viewportUnit: 'vw',
  fontViewportUnit: 'vw', // vmin is more suitable.
  selectorBlackList: [],
  propList: ['*'],
  minPixelValue: 1,
  mediaQuery: false,
  replace: true,
  landscape: false,
  landscapeUnit: 'vw',
  landscapeWidth: 568,
};

const ignoreNextComment = 'px-to-viewport-ignore-next';
const ignorePrevComment = 'px-to-viewport-ignore';

const postcssPxToViewport = (options: OptionType) => {
  const opts = objectAssign({}, defaults, options);

  // Validate conflicting options
  if (opts.minViewportWidth && opts.landscape) {
    console.warn('Warning: minViewportWidth and landscape options are both enabled. minViewportWidth will take precedence and landscape rules will be ignored.');
  }

  const pxRegex = getUnitRegexp(opts.unitToConvert);
  const satisfyPropList = createPropListMatcher(opts.propList);
  const landscapeRules: AtRule[] = [];
  const minViewportRules: AtRule[] = [];

  return {
    postcssPlugin: 'postcss-px-to-viewport',
    Once(css: Root, { result }: { result: any }) {
      // @ts-ignore Add type definitions
      css.walkRules((rule: RuleType) => {
        // Add exclude option to ignore some files like 'node_modules'
        const file = rule.source?.input.file || '';
        if (opts.exclude && file) {
          if (Object.prototype.toString.call(opts.exclude) === '[object RegExp]') {
            if (isExclude(opts.exclude as RegExp, file)) return;
          } else if (
            // Object.prototype.toString.call(opts.exclude) === '[object Array]' &&
            opts.exclude instanceof Array
          ) {
            for (let i = 0; i < opts.exclude.length; i++) {
              if (isExclude(opts.exclude[i], file)) return;
            }
          } else {
            throw new Error('options.exclude should be RegExp or Array.');
          }
        }

        if (blacklistedSelector(opts.selectorBlackList, rule.selector)) return;

        if (opts.landscape && !opts.minViewportWidth && !rule.parent?.params) {
          const landscapeRule = rule.clone().removeAll();
          rule.walkDecls((decl) => {
            if (decl.value.indexOf(opts.unitToConvert) === -1) return;
            if (!satisfyPropList(decl.prop)) return;
            let landscapeWidth;
            if (typeof opts.landscapeWidth === 'function') {
              const num = opts.landscapeWidth(file);
              if (!num) return;
              landscapeWidth = num;
            } else {
              landscapeWidth = opts.landscapeWidth;
            }

            landscapeRule.append(
              decl.clone({
                value: decl.value.replace(
                  pxRegex,
                  createPxReplace(opts, opts.landscapeUnit, landscapeWidth),
                ),
              }),
            );
          });

          if (landscapeRule.nodes.length > 0) {
            landscapeRules.push((landscapeRule as unknown) as AtRule);
          }
        }

        if (!validateParams(rule.parent?.params, opts.mediaQuery)) return;

        // Handle minViewportWidth feature - collect rules for media query
        if (opts.minViewportWidth && !rule.parent?.params) {
          const minViewportRule = rule.clone().removeAll();
          rule.walkDecls((decl) => {
            if (decl.value.indexOf(opts.unitToConvert) === -1) return;
            if (!satisfyPropList(decl.prop)) return;

            let unit = getUnit(decl.prop, opts);
            let size;
            if (typeof opts.viewportWidth === 'function') {
              const num = opts.viewportWidth(file);
              if (!num) return;
              size = num;
            } else {
              size = opts.viewportWidth;
            }

            minViewportRule.append(
              decl.clone({
                value: decl.value.replace(
                  pxRegex,
                  createPxReplace(opts, unit!, size),
                ),
              }),
            );
          });

          if (minViewportRule.nodes.length > 0) {
            minViewportRules.push((minViewportRule as unknown) as AtRule);
          }
          // When minViewportWidth is set, keep original px values in the base rule
          // Skip the normal conversion logic for this rule
          return;
        }

        rule.walkDecls((decl, i) => {
          if (decl.value.indexOf(opts.unitToConvert) === -1) return;
          if (!satisfyPropList(decl.prop)) return;

          const prev = decl.prev();
          // prev declaration is ignore conversion comment at same line
          if (prev && prev.type === 'comment' && prev.text === ignoreNextComment) {
            // remove comment
            prev.remove();
            return;
          }
          const next = decl.next();
          // next declaration is ignore conversion comment at same line
          if (next && next.type === 'comment' && next.text === ignorePrevComment) {
            if (/\n/.test(next.raws.before!)) {
              result.warn(
                `Unexpected comment /* ${ignorePrevComment} */ must be after declaration at same line.`,
                { node: next },
              );
            } else {
              // remove comment
              next.remove();
              return;
            }
          }

          let unit;
          let size;
          const { params } = rule.parent;

          if (opts.landscape && params && params.indexOf('landscape') !== -1) {
            unit = opts.landscapeUnit;

            if (typeof opts.landscapeWidth === 'function') {
              const num = opts.landscapeWidth(file);
              if (!num) return;
              size = num;
            } else {
              size = opts.landscapeWidth;
            }
          } else {
            unit = getUnit(decl.prop, opts);
            if (typeof opts.viewportWidth === 'function') {
              const num = opts.viewportWidth(file);
              if (!num) return;
              size = num;
            } else {
              size = opts.viewportWidth;
            }
          }

          const value = decl.value.replace(pxRegex, createPxReplace(opts, unit!, size));

          if (declarationExists((decl.parent as unknown) as ParentExtendType[], decl.prop, value))
            return;

          if (opts.replace) {
            decl.value = value;
          } else {
            decl.parent?.insertAfter(i, decl.clone({ value }));
          }
        });
      });

      // if (landscapeRules.length > 0) {
      //   const landscapeRoot = new AtRule({
      //     params: '(orientation: landscape)',
      //     name: 'media',
      //   });

      //   landscapeRules.forEach((rule) => {
      //     landscapeRoot.append(rule);
      //   });
      //   css.append(landscapeRoot);
      // }
    },
    // https://www.postcss.com.cn/docs/writing-a-postcss-plugin
    // Declaration Rule RuleExit OnceExit
    // There two types or listeners: enter and exit.
    // Once, Root, AtRule, and Rule will be called before processing children.
    // OnceExit, RootExit, AtRuleExit, and RuleExit after processing all children inside node.
    OnceExit(css: Root, { AtRule }: { AtRule: any }) {
      // When running this logic in Once, setting landscape mode causes portrait styles to override landscape styles in production environment after packaging, so run in OnceExit.
      if (landscapeRules.length > 0) {
        const landscapeRoot = new AtRule({
          params: '(orientation: landscape)',
          name: 'media',
        });

        landscapeRules.forEach(function(rule) {
          landscapeRoot.append(rule);
        });
        css.append(landscapeRoot);
      }

      // Add media query for minViewportWidth feature
      if (opts.minViewportWidth && minViewportRules.length > 0) {
        const minViewportRoot = new AtRule({
          params: `(min-width: ${opts.minViewportWidth}px)`,
          name: 'media',
        });

        minViewportRules.forEach(function(rule) {
          minViewportRoot.append(rule);
        });
        css.append(minViewportRoot);
      }
    },
  };
};

postcssPxToViewport.postcss = true;
module.exports = postcssPxToViewport;
export default postcssPxToViewport;
