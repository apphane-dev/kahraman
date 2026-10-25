# Tickets

`tickets/` holds tickets ready to start. `backlog/` holds tickets with an open
blocker. When every blocker of a backlog ticket is done, move its file here and
set its status to `ready-for-agent`. Delete a ticket's file in the PR that
completes it. Numbers never change, so "Blocked by" references survive moves.

A known gap names the ticket that would fix it by number, so moving the file
does not break the reference.

Vocabulary: [GLOSSARY.md](../GLOSSARY.md). Design:
[conformance spec](../docs/specs/conformance.md).
