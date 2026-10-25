# kahraman

An accessibility-first test actor and locator DSL for Storybook stories, checked
for fit against third-party component libraries.

## Conformance

**UI kit**:
A third-party component library the actor is checked against.
_Avoid_: UI lib, design system, framework

**Conformance scenario**:
A UI-kit-agnostic user journey that runs unchanged against every UI kit.
_Avoid_: demo, probe, smoke test

**Kit fixture**:
The stories of one UI kit that render the widgets the conformance scenarios
need.
_Avoid_: demo app, sandbox

**Kit extension**:
An actor extension, built with `I.extend`, covering one UI kit's quirks.
_Avoid_: plugin, adapter

**Known gap**:
A conformance scenario expected to fail against a UI kit, linked to an issue.
_Avoid_: skip, unsupported

**Conformance matrix**:
The table of conformance scenarios against UI kits, each cell passing or a
known gap.
_Avoid_: support table, compatibility chart
