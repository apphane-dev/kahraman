# 0005: Open shadow queries are an experimental actor option

- **Status:** Accepted. Open-shadow traversal requires an explicit actor option.
- **Date:** 2026-10-27
- **Scope:** `createActor({ shadowDom: 'open' })`; off by default

Web Awesome's controls expose open shadow roots. The default actor cannot find
most of those controls, so its conformance manifest records ticket 17. The
experiment must not turn those expected failures into an implicit claim that
the default actor supports them.

## Contract

The option extends the actor's role and text query families, including their
`get`, `query`, `find`, and `All` variants. It does not change other query
families or global Testing Library configuration. It follows open roots and
assigned elements within the selected scope, including nested roots and slots.
An explicit locator scope takes precedence over an actor scope, which takes
precedence over the story document's body. Open-root traversal starts there;
it does not search unrelated roots elsewhere in the document. A scoped host's
own root and content assigned into slots in scope are included.

Testing Library still computes roles, accessible names, text matches, and query
options. This code does not implement a separate accessible-name algorithm or
claim to reproduce the browser's entire accessibility tree. Matches across
roots are pooled and deduplicated by element identity before the query applies
its cardinality rule. Two different matching elements remain ambiguous.

Default role queries exclude matches behind hidden rendered ancestors,
unassigned light DOM below an open shadow host, and slot fallback content when
the slot has assigned nodes, including text nodes. `{ hidden: true }` includes
those matches. Text queries retain their hidden-DOM behavior and actor-local
`textIgnore` policy. A query's `ignore` overrides the actor policy.

Hit testing and `aria-controls` ID references resolve within the target's own
root. Clearing an input in a shadow root uses typing rather than user-event's
document-level active-element check. Closed roots remain inaccessible. The
option is not a guarantee that every web component works.

## Evidence and trade-off

`conformance/kits/web-awesome/regressions/shadow-dom-option.stories.ts` runs the
same twelve shared scenarios individually and in one page journey with one
opt-in actor. It also checks scope, duplicate names, hidden slots, unslotted
content, and fallback content. The ordinary conformance stories continue to
verify the default actor and its expected failures.

Keeping the option off makes the new traversal explicit and avoids silently
adding duplicate matches to existing tests. It leaves the default matrix with
known gaps. The default remains off. A future change to that policy needs its own
compatibility decision. Ticket 17 tracks publishing option-enabled coverage
separately from default support.
