/**
 * Which link targets the chrome uses verbatim. No React, no Zod: the schema
 * and the renderers both ask this file, so the rule is written once.
 */

/**
 * The targets an item's `href` may have: 'http:', 'https:', 'mailto:', 'tel:'
 * (any letter case), a protocol-relative '//host', a '#fragment' or a
 * '?query'. Checked on the raw
 * value, so leading whitespace or a control character fails it too.
 */
const ALLOWED_HREF = /^(?:(?:https?|mailto|tel):|\/\/|[#?])/i;

/** What the schema's message lists, in the order of {@link ALLOWED_HREF}. */
export const ALLOWED_HREF_STARTS = 'http:, https:, mailto:, tel:, //, # or ?';

/**
 * True when `value` may be used verbatim as a nav item's `href`. Everything
 * else ('javascript:', 'data:', 'vbscript:', any other scheme, an in-site
 * path) is refused: an in-site page is given by `path`.
 */
export function isAllowedHref(value: string): boolean {
  return ALLOWED_HREF.test(value);
}

const SELF = 'self.invalid';

/**
 * True for a link to another origin, decided as a browser decides it: the
 * value is resolved against this page, and the result is an http(s) URL on
 * another host. That covers 'https://…' and '//…', and also what a browser
 * reads the same way ('https:/\\host', '/\\host', '\\\\host'; 'https:host'
 * from an http page). Such links get `rel="noopener"` from the renderers.
 * 'mailto:', 'tel:', 'bitcoin:', fragments and in-site paths are not.
 */
export function isExternalHref(value: string): boolean {
  // The page may be http or https, and 'https:host' leaves the origin only
  // from the other one, so ask from both.
  return ['http:', 'https:'].some((protocol) => {
    try {
      const url = new URL(value, `${protocol}//${SELF}/`);
      return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname !== SELF;
    } catch {
      return false;
    }
  });
}

const DANGEROUS_SCHEMES = new Set(['javascript', 'vbscript', 'data']);

/**
 * True when a link runs code or carries a document instead of pointing at
 * one: a 'javascript:', 'vbscript:' or 'data:' scheme, read the way a browser
 * reads it (leading spaces and control characters dropped, tabs and line
 * breaks removed anywhere, any letter case). The footer does not render such
 * a link; every other footer link renders as given.
 */
export function isDangerousHref(value: string): boolean {
  // eslint-disable-next-line no-control-regex -- the browser's own URL clean-up
  const read = value.replace(/^[\u0000- ]+/, '').replace(/[\t\n\r]/g, '');
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(read)?.[1];
  return scheme !== undefined && DANGEROUS_SCHEMES.has(scheme.toLowerCase());
}
