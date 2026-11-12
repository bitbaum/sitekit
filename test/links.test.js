/**
 * Links that are not in-site paths (found 2026-11-12): a nav could not point
 * at 'https://github.com/bitbaum' (href() made it '/https://github.com/bitbaum'),
 * and a static site serving directories had no way to get '/work/'.
 *
 * The rules this file pins: a `path` is always an in-site path, joined exactly
 * as in 0.7.0; only an item's `href` is used verbatim, and only for http(s),
 * mailto, tel, //host, #fragment and ?query;
 * the footer drops only javascript:, vbscript: and data: links; `trailingSlash` touches the path
 * part only; without it, nothing a 0.7.0 consumer renders changes.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  href,
  isAllowedHref,
  isExternalHref,
  isCurrentNavItem,
  navItemHref,
  siteNavItemSchema,
  siteNavLinkSchema,
} from '@bitbaum/sitekit';
import { SiteMasthead, SiteFooter, SiteNav, SiteTabBar } from '@bitbaum/sitekit/react';

const chrome = { name: 'Example', tagline: '', footerNote: '' };

// href(path) on origin/main (0.7.0), for every input the review tried.
const ORIGIN_HREF = [
  ['', '/'],
  ['/', '/'],
  ['menu', '/menu'],
  ['/menu/', '/menu'],
  ['a/b', '/a/b'],
  ['a//b', '/a//b'],
  ['notes:2026', '/notes:2026'],
  ['C:/x', '/C:/x'],
  ['javascript:alert(1)', '/javascript:alert(1)'],
  ['JAVASCRIPT:alert(1)', '/JAVASCRIPT:alert(1)'],
  [' javascript:alert(1)', '/ javascript:alert(1)'],
  ['#', '/#'],
  ['?q', '/?q'],
  ['//host/x', '/host/x'],
  ['HTTPS://X', '/HTTPS://X'],
  ['mailto:a@b', '/mailto:a@b'],
  ['tel:+41', '/tel:+41'],
  ['a/../b', '/a/../b'],
  ['./a', '/./a'],
  ['../a', '/../a'],
  ['/a.html', '/a.html'],
  ['a?b', '/a?b'],
  ['a#b', '/a#b'],
  ['\\\\evil.com', '/\\\\evil.com'],
  ['/\\evil.com', '/\\evil.com'],
  ['\t//evil', '/\t//evil'],
];

test('href(path) is byte-identical to 0.7.0 for every input when no option is set', () => {
  assert.equal(ORIGIN_HREF.length, 26);
  assert.equal(href(), '/');
  for (const [input, expected] of ORIGIN_HREF) {
    assert.equal(href(input), expected, JSON.stringify(input));
    assert.equal(href(input, {}), expected, `${JSON.stringify(input)} with {}`);
    assert.equal(href(input, { trailingSlash: false }), expected, JSON.stringify(input));
  }
});

test('trailingSlash: a slash on the path part only', () => {
  const slash = (path) => href(path, { trailingSlash: true });
  assert.equal(slash('work'), '/work/');
  assert.equal(slash('/work/'), '/work/');
  assert.equal(slash('a/b'), '/a/b/');
  assert.equal(slash(''), '/');
  assert.equal(slash('/'), '/');
  assert.equal(slash('/a#b'), '/a/#b');
  assert.equal(slash('/a?b'), '/a/?b');
  assert.equal(slash('a/?x=1#y'), '/a/?x=1#y');
  assert.equal(slash('#top'), '/#top');
  assert.equal(slash('?page=2'), '/?page=2');
});

test('trailingSlash: no slash after a last segment with a file extension', () => {
  const slash = (path) => href(path, { trailingSlash: true });
  assert.equal(slash('/a.html'), '/a.html');
  assert.equal(slash('feed.xml'), '/feed.xml');
  assert.equal(slash('assets/jquery.min.js'), '/assets/jquery.min.js');
  assert.equal(slash('feed.xml?v=2'), '/feed.xml?v=2');
  assert.equal(slash('docs.v2/intro'), '/docs.v2/intro/');
  assert.equal(slash('.well-known'), '/.well-known/');
  assert.equal(slash('releases/1.2'), '/releases/1.2/');
  // A slash the caller wrote stays, even after a name that looks like a file.
  assert.equal(slash('/a/b.c/'), '/a/b.c/');
  assert.equal(slash('feed.xml/#x'), '/feed.xml/#x');
});

test('an href is allowed for http(s), mailto, tel, //host, # and ? only', () => {
  for (const value of [
    'https://github.com/bitbaum',
    'http://x.y/z/',
    'HTTPS://EXAMPLE.COM',
    'mailto:hello@example.com',
    'MailTo:a@b.c',
    'tel:+41000000000',
    '//cdn.example.com/a',
    '#start',
    '?page=2',
  ]) {
    assert.ok(isAllowedHref(value), value);
  }
  for (const value of [
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    '\tjavascript:alert(1)',
    '\u0001javascript:alert(1)',
    'java\nscript:alert(1)',
    'data:text/html,<p>x</p>',
    'DATA:text/html,x',
    'vbscript:msgbox(1)',
    'web+app:thing',
    'notes:2026',
    'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    'BITCOIN:bc1q?amount=0.001',
    'lightning:lnbc1',
    'sms:+41000000000',
    'nostr:npub1abc',
    ' https://x.y',
    '/feed.xml',
    'work',
    '',
  ]) {
    assert.equal(isAllowedHref(value), false, JSON.stringify(value));
  }
});

test('another origin is external, as a browser reads it; mail, phone, fragments and paths are not', () => {
  for (const value of [
    'https://github.com/bitbaum',
    '//cdn.example.com',
    'https:/\\evil',
    'https:evil',
    'http:evil',
    '/\\evil.com',
    '\\\\evil.com',
    ' https://x.y',
    '\t//evil',
  ]) {
    assert.ok(isExternalHref(value), JSON.stringify(value));
  }
  for (const value of [
    '/work',
    'work',
    '#a',
    '?q',
    '',
    'mailto:a@b.c',
    'tel:1',
    'bitcoin:bc1q',
    'lightning:lnbc1',
    'notes:2026',
  ]) {
    assert.equal(isExternalHref(value), false, value);
  }
});

test('siteNavItemSchema is path-only, as in 0.7.0', () => {
  assert.ok(siteNavItemSchema.safeParse({ path: 'work', label: 'Work' }).success);
  assert.equal(siteNavItemSchema.safeParse({ href: 'https://x.y', label: 'X' }).success, false);
});

test('siteNavLinkSchema: exactly one of path or href, with a field-addressed message', () => {
  const issues = (input) => {
    const result = siteNavLinkSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((i) => [i.path.join('.'), i.message]);
  };
  assert.deepEqual(issues({ path: 'work', label: 'Work' }), []);
  assert.deepEqual(issues({ path: '', label: 'Home' }), []);
  assert.deepEqual(issues({ path: 'notes:2026', label: 'Notes' }), []);
  assert.deepEqual(issues({ href: 'https://x.y', label: 'Source' }), []);
  assert.deepEqual(issues({ href: '#top', label: 'Top' }), []);
  assert.deepEqual(issues({ path: 'work', href: 'https://x.y', label: 'Both' }), [
    ['href', 'give exactly one of path or href, not both'],
  ]);
  assert.deepEqual(issues({ label: 'Nowhere' }), [
    ['path', 'give exactly one of path (an in-site page) or href (a link elsewhere)'],
  ]);
  for (const bad of [
    'bitcoin:bc1q',
    'lightning:lnbc1',
    'javascript:alert(1)',
    'JAVASCRIPT:x',
    ' javascript:x',
    'data:x',
    'notes:2026',
    '',
  ]) {
    const found = issues({ href: bad, label: 'Bad' });
    assert.equal(found.length, 1, JSON.stringify(bad));
    assert.equal(found[0][0], 'href');
    assert.match(found[0][1], /must start with http:, https:, mailto:, tel:, \/\/, # or \?/);
  }
});

test('navItemHref: path through href(), allowed href verbatim, refused href null', () => {
  assert.equal(navItemHref({ path: 'work', label: 'W' }), '/work');
  assert.equal(navItemHref({ path: 'work', label: 'W' }, { trailingSlash: true }), '/work/');
  assert.equal(navItemHref({ path: 'notes:2026', label: 'N' }), '/notes:2026');
  assert.equal(navItemHref({ path: 'https://x.y', label: 'P' }), '/https://x.y');
  assert.equal(
    navItemHref({ href: 'https://x.y/z', label: 'X' }, { trailingSlash: true }),
    'https://x.y/z',
  );
  assert.equal(navItemHref({ href: 'javascript:alert(1)', label: 'J' }), null);
  assert.equal(navItemHref({ href: '/feed.xml', label: 'F' }), null);
});

test('current item: exact path equality without trailingSlash, as in 0.7.0', () => {
  const work = { path: 'work', label: 'Work' };
  assert.ok(isCurrentNavItem(work, 'work'));
  for (const current of ['/work', '/work/', 'work/', 'workshop']) {
    assert.equal(isCurrentNavItem(work, current), false, current);
  }
  assert.equal(isCurrentNavItem({ path: '', label: 'Home' }, '/'), false);
  assert.ok(isCurrentNavItem({ path: '/a/b/', label: 'AB' }, '/a/b/'));
  // Untyped input carrying both fields is rendered by its href, so it is never
  // marked current, whatever its path says.
  assert.equal(isCurrentNavItem({ path: 'work', href: 'https://x.ch', label: 'X' }, 'work'), false);
  assert.equal(isCurrentNavItem({ href: '#top', label: 'Top' }, '#top'), false);
  assert.equal(isCurrentNavItem({ path: '/a/b/', label: 'AB' }, 'a/b'), false);
});

test('current item with trailingSlash: slashes at either end do not matter', () => {
  const opts = { trailingSlash: true };
  const work = { path: 'work', label: 'Work' };
  for (const current of ['work', '/work', '/work/', 'work/']) {
    assert.ok(isCurrentNavItem(work, current, opts), current);
  }
  assert.ok(isCurrentNavItem({ path: '', label: 'Home' }, '/', opts));
  assert.equal(isCurrentNavItem(work, 'workshop', opts), false);
  assert.equal(isCurrentNavItem({ href: 'https://x.y/work', label: 'X' }, 'work', opts), false);
  assert.equal(isCurrentNavItem({ href: '#work', label: 'X' }, '#work', opts), false);
});

const navItems = [
  { path: 'work', label: 'The work' },
  { path: 'builders', label: 'Builders' },
  { href: 'https://github.com/bitbaum', label: 'Source' },
];
const count = (html, pattern) => (html.match(pattern) || []).length;

test('flat masthead: an href verbatim with rel=noopener, paths unchanged', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, { chrome, appearance: 'application', currentPath: 'work', navItems }),
  );
  assert.ok(!html.includes('/https://'));
  assert.equal(count(html, /href="https:\/\/github.com\/bitbaum" rel="noopener"/g), 2);
  assert.equal(count(html, /href="\/work" aria-current="page"/g), 2);
  assert.ok(html.includes('href="/builders">'), 'in-site links carry no rel');
});

test('without trailingSlash, a slashed currentPath marks nothing, as in 0.7.0', () => {
  for (const currentPath of ['/', '/work', '/work/', 'work/']) {
    for (const appearance of ['application', undefined]) {
      const html = renderToStaticMarkup(
        h(SiteMasthead, {
          chrome,
          appearance,
          currentPath,
          navItems: [{ path: '', label: 'Home' }, ...navItems.slice(0, 2)],
        }),
      );
      assert.equal(count(html, /aria-current/g), 0, `${appearance} at ${currentPath}`);
    }
  }
});

test('a path with a colon stays an in-site path in every renderer', () => {
  const items = [{ path: 'notes:2026', label: 'Notes' }];
  for (const appearance of ['application', undefined]) {
    const html = renderToStaticMarkup(
      h(SiteMasthead, { chrome, appearance, currentPath: '', navItems: items }),
    );
    assert.ok(html.includes('href="/notes:2026"'), String(appearance));
    assert.ok(!html.includes('href="notes:'), String(appearance));
  }
  const tabs = renderToStaticMarkup(
    h(SiteTabBar, {
      currentPath: '',
      items: [
        { path: 'notes:2026', label: 'Notes', icon: '◎' },
        { path: 'https://x.y', label: 'X', icon: '★' },
      ],
    }),
  );
  assert.ok(tabs.includes('href="/notes:2026"'));
  assert.ok(tabs.includes('href="/https://x.y"'), 'a tab is always an in-site path');
  assert.ok(!tabs.includes('rel='));
});

test('a refused href is never rendered, in any appearance', () => {
  const bad = [
    { path: 'work', label: 'Work' },
    { href: 'JaVaScRiPt:alert(1)', label: 'Evil' },
    { href: ' javascript:alert(2)', label: 'Evil' },
    { href: 'data:text/html,x', label: 'Evil' },
  ];
  const renders = [
    h(SiteMasthead, { chrome, appearance: 'application', currentPath: '', navItems: bad }),
    h(SiteMasthead, { chrome, currentPath: '', navItems: bad }),
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: '',
      navItems: [],
      navGroups: [{ label: 'G', items: bad }],
    }),
  ];
  for (const element of renders) {
    const html = renderToStaticMarkup(element);
    assert.ok(!/javascript|data:/i.test(html), html);
    assert.ok(!html.includes('Evil'));
    assert.ok(html.includes('href="/work"'));
  }
});

test('grouped masthead: the source link survives, trailingSlash gives directory URLs', () => {
  const html = renderToStaticMarkup(
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: '/work/',
      navItems: [],
      trailingSlash: true,
      navGroups: [{ label: 'Studio', items: navItems }],
    }),
  );
  assert.ok(html.includes('href="https://github.com/bitbaum" rel="noopener"'));
  assert.ok(html.includes('href="/work/" aria-current="page"'));
  assert.ok(html.includes('href="/builders/"'));
  assert.equal(count(html, /aria-current="page"/g), 1);
});

test('document appearance: the same link rules', () => {
  const html = renderToStaticMarkup(
    h(SiteNav, { items: navItems, currentPath: 'work/', trailingSlash: true }),
  );
  assert.ok(html.includes('href="https://github.com/bitbaum" rel="noopener"'));
  assert.match(html, /href="\/work\/" aria-current="page"/);
});

test('omitting trailingSlash keeps the markup of trailingSlash={false}', () => {
  const props = { chrome, appearance: 'application', currentPath: 'work', navItems };
  assert.equal(
    renderToStaticMarkup(h(SiteMasthead, props)),
    renderToStaticMarkup(h(SiteMasthead, { ...props, trailingSlash: false })),
  );
});

test('footer: rel=noopener on another origin; javascript:, vbscript: and data: are not rendered', () => {
  const html = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      year: 2026,
      links: [
        { href: '/roadmap', label: 'Roadmap' },
        { href: 'mailto:a@b.c', label: 'Mail' },
        { href: 'javascript:alert(1)', label: 'Evil' },
        { href: '\u0000 JaVa\tScRiPt:alert(2)', label: 'Evil' },
        { href: 'vbscript:x', label: 'Evil' },
      ],
      groups: undefined,
    }),
  );
  assert.ok(html.includes('<a href="/roadmap">Roadmap</a>'));
  assert.ok(html.includes('<a href="mailto:a@b.c">Mail</a>'));
  assert.ok(!html.includes('Evil'));
  const grouped = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      year: 2026,
      groups: [
        {
          label: 'More',
          links: [
            { href: '/hire', label: 'Hire' },
            { href: 'https://github.com/bitbaum', label: 'Source' },
            { href: 'data:text/html,x', label: 'Evil' },
          ],
        },
      ],
    }),
  );
  assert.ok(grouped.includes('<a href="/hire">Hire</a>'));
  assert.ok(grouped.includes('<a href="https://github.com/bitbaum" rel="noopener">Source</a>'));
  assert.ok(!grouped.includes('Evil'));
});

test('tab bar: trailingSlash gives directory URLs and the current tab still matches', () => {
  const html = renderToStaticMarkup(
    h(SiteTabBar, {
      currentPath: '/work/',
      trailingSlash: true,
      items: [
        { path: '', label: 'Home', icon: '◎' },
        { path: 'work', label: 'Work', icon: '★' },
        { path: 'feed.xml', label: 'Feed', icon: '≡' },
      ],
    }),
  );
  assert.match(html, /href="\/work\/" aria-current="page"/);
  assert.match(html, /href="\/" class="sk-tab"/);
  assert.match(html, /href="\/feed.xml" class="sk-tab"/);
});

test('bitcoin: and lightning: hrefs are refused in the nav; the footer renders them as in 0.7.0', () => {
  const pay = [
    { path: 'work', label: 'Work' },
    { href: 'bitcoin:bc1qexample', label: 'Pay' },
    { href: 'lightning:lnbc1example', label: 'Zap' },
  ];
  const renders = [
    h(SiteMasthead, { chrome, appearance: 'application', currentPath: '', navItems: pay }),
    h(SiteMasthead, { chrome, currentPath: '', navItems: pay }),
    h(SiteMasthead, {
      chrome,
      appearance: 'application',
      currentPath: '',
      navItems: [],
      navGroups: [{ label: 'G', items: pay }],
    }),
  ];
  for (const element of renders) {
    const html = renderToStaticMarkup(element);
    assert.match(html, /<a href="\/work"/);
    assert.ok(!html.includes('bitcoin:'), html);
    assert.ok(!html.includes('lightning:'), html);
  }
  const footer = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      year: 2026,
      links: [
        { href: 'bitcoin:bc1qexample', label: 'Pay' },
        { href: 'lightning:lnbc1example', label: 'Zap' },
        { href: 'notes:2026', label: 'Notes' },
        { href: 'web+app:thing', label: 'App' },
      ],
    }),
  );
  assert.ok(footer.includes('<a href="bitcoin:bc1qexample">Pay</a>'));
  assert.ok(footer.includes('<a href="lightning:lnbc1example">Zap</a>'));
  assert.ok(footer.includes('<a href="notes:2026">Notes</a>'), 'rendered as in 0.7.0');
  assert.ok(footer.includes('<a href="web+app:thing">App</a>'));
});

test('footer: backslash forms a browser reads as another origin get rel', () => {
  const html = renderToStaticMarkup(
    h(SiteFooter, {
      chrome,
      appearance: 'application',
      year: 2026,
      links: [
        { href: '/\\evil.com', label: 'A' },
        { href: 'https:/\\evil', label: 'B' },
      ],
    }),
  );
  assert.ok(html.includes('<a href="/\\evil.com" rel="noopener">A</a>'), html);
  assert.ok(html.includes('<a href="https:/\\evil" rel="noopener">B</a>'), html);
});

test('a nav whose every item is refused renders as one given no items', () => {
  const refused = [{ href: 'javascript:x', label: 'J' }];
  const flat = (navItems) =>
    renderToStaticMarkup(
      h(SiteMasthead, { chrome, appearance: 'application', currentPath: '', navItems }),
    );
  assert.equal(flat(refused), flat([]));
  assert.ok(!flat(refused).includes('sk-desktop-nav'));
  assert.equal(
    renderToStaticMarkup(
      h(SiteNav, { appearance: 'application', items: refused, currentPath: '' }),
    ),
    '',
  );
  const grouped = (navGroups) =>
    renderToStaticMarkup(
      h(SiteMasthead, {
        chrome,
        appearance: 'application',
        currentPath: '',
        navItems: [{ path: 'work', label: 'Work' }],
        navGroups,
      }),
    );
  assert.equal(
    grouped([
      { label: 'Kept', items: [{ path: 'a', label: 'A' }] },
      { label: 'Gone', items: refused },
    ]),
    grouped([{ label: 'Kept', items: [{ path: 'a', label: 'A' }] }]),
  );
  assert.ok(!grouped([{ label: 'Gone', items: refused }]).includes('Gone'));
  assert.equal(grouped([{ label: 'Gone', items: refused }]), grouped([]), 'falls back to flat');
  const doc = renderToStaticMarkup(h(SiteNav, { items: refused, currentPath: '' }));
  assert.equal(doc, renderToStaticMarkup(h(SiteNav, { items: [], currentPath: '' })));
});

test('footer: a group whose every link is dropped is left out, heading and all', () => {
  const footer = (groups) =>
    renderToStaticMarkup(h(SiteFooter, { chrome, appearance: 'application', year: 2026, groups }));
  const kept = { label: 'Kept', links: [{ href: '/a', label: 'A' }] };
  const gone = { label: 'Gone', links: [{ href: 'javascript:x', label: 'J' }] };
  assert.equal(footer([kept, gone]), footer([kept]));
  assert.ok(!footer([kept, gone]).includes('<h2>Gone</h2>'));
  assert.ok(footer([kept, gone]).includes('--sk-footer-columns:1'));
  assert.equal(footer([gone]), footer([]));
  // A group given no links at all renders as in 0.7.0: its heading stays.
  assert.ok(footer([{ label: 'Empty', links: [] }]).includes('<h2>Empty</h2>'));
});

test('a nav path a browser reads as another host gets rel, as in the footer', () => {
  // The href is joined exactly as in 0.7.0; rel="noopener" is the one addition.
  for (const path of ['\\\\evil.com', '/\\evil.com']) {
    const html = renderToStaticMarkup(
      h(SiteMasthead, {
        chrome,
        appearance: 'application',
        currentPath: '',
        navItems: [{ path, label: 'X' }],
      }),
    );
    assert.ok(html.includes(`<a href="${href(path)}" rel="noopener">X</a>`), html);
  }
});

test('siteNavLinkSchema outputs a SiteNavLink: only the field that was given', () => {
  assert.deepEqual(siteNavLinkSchema.parse({ href: '#top', label: 'Top', path: undefined }), {
    href: '#top',
    label: 'Top',
  });
  assert.deepEqual(siteNavLinkSchema.parse({ path: 'work', label: 'Work', href: undefined }), {
    path: 'work',
    label: 'Work',
  });
  const html = renderToStaticMarkup(
    h(SiteNav, {
      appearance: 'application',
      currentPath: 'work',
      items: siteNavLinkSchema.array().parse([
        { path: 'work', label: 'Work' },
        { href: '#top', label: 'Top' },
      ]),
    }),
  );
  assert.ok(html.includes('href="/work" aria-current="page"'));
  assert.ok(html.includes('href="#top"'));
});
