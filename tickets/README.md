# Tickets

`tickets/` holds tickets ready to start. `backlog/` holds tickets with an open
blocker. When every blocker of a backlog ticket is done, move its file here and
set its status to `ready-for-agent`. Delete a ticket's file in the PR that
completes it. Numbers never change, so "Blocked by" references survive moves.

Vocabulary: [GLOSSARY.md](../GLOSSARY.md). Design:
[conformance spec](../docs/specs/conformance.md).
