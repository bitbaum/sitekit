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
