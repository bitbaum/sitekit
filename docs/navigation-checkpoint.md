# Grouped application navigation checkpoint

Active scope: extend SiteKit's application navigation with host-supplied groups
and descriptive links; adopt the verified release in BiasLens as the canary.
Fleet's content workflow plan records the wider writing queue. OrangeCat's
signed-in publication and physical keyboard acceptance remain separate work.

Starting source: SiteKit main, package 0.5.1. No open SiteKit pull requests were
returned by the connected GitHub search on 2026-11-05. BiasLens main already has
its manual composer; do not duplicate that feature.

Acceptance: preserve flat navigation; share one grouped renderer between desktop
and phone; announce the active destination; support native keyboard opening,
Escape/focus return, outside-click and route dismissal; fit the viewport and
retain 44px targets. Product grouping and descriptions belong in BiasLens.

State: grouped API and shared responsive renderer implemented. Public-rendered
markup tests and the real Chromium interaction regression passed at
320/390/834/1440px. The browser check caught and verified the fix for undersized
account links inside the phone menu. The 390px screenshot was inspected.
Full verify (format/lint/types/build/44 tests) and docs truth audit passed.
No release, merge or consumer deployment is established by these local results.
Next: open a normal PR, follow CI and fleet sweep, release through the workflow,
then update BiasLens with product groups and verify its deployment/rollout gate.


SiteKit #43 merged as `cb68eabb47b0b54869ef182f3524aaebba7bed72` after
successful PR CI. Main CI run 42128370320 remained in browser installation for
several minutes before reaching tests. The follow-up prefers the existing
runner Chrome, with the same browser regression and a Playwright installation
fallback. Apply the same selection to release verification. BiasLens config is
prepared on `feat/grouped-sitekit-navigation`; its release pin and checks await
the verified package release.


SiteKit #44 merged as `dd081d8766ea02e687dea524edf9a7c5bc1b74d7`; main CI
42129403111 passed in 40 seconds. Release 42129551419 verified and created
v0.6.0 at `f183a4d4fd16337d58a46f91760cd7ede8ca8a8f`. npm publication
42129643231 failed because its separate verify job had no configured browser.
Prepare the same runner browser before publish verification, then release a
new patch version. Do not move v0.6.0 or call its npm publication successful.


BiasLens screenshot review of installed npm 0.6.1 caught two integration layout
issues: desktop panels were positioned against the viewport rather than the
bounded header frame; at 320px the inset navigation clipped a wider account
popover. Position grouped panels relative to the masthead frame and use the
full panel width on the narrowest phones. BiasLens adds a regression against
the actual AccountKit popup bounds. Reverify and release a new patch; its
consumer checks and deployment remain required.


The narrow account screenshot also showed navigation link styles leaking into
nested host widget links. Restrict generic action styling to direct links;
nested account controls keep their package-owned layout. A real browser fixture
reproduced column layout overriding the host's row before the selector fix.
Include this correction in the next release before BiasLens adoption.
