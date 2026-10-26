# Vendored shadcn/ui components

Generated on October 26, 2026 with the official `shadcn@4.22.1` CLI, using
`--base radix --preset nova`, neutral colors, and Lucide icons. This is the
`radix-nova` registry, not the Base UI implementation. The CLI configuration is
in `../../../components.json`; package versions and the dependency graph are
pinned in the kit's `package.json` and the workspace lockfile.

Upstream: https://github.com/shadcn-ui/ui
Upstream reference at generation: `481d523374745e77d0cf9c53a4115ab5dd7c8481`.
Registry: https://ui.shadcn.com/r/styles/radix-nova/

The source snapshot is committed here because shadcn distributes components as
source. Local changes are formatting only. Keep component behavior and classes
intact; fixture labels and user journeys belong in `../../fixtures.tsx`.
`LICENSE.md` contains the upstream MIT license.

The CLI add command was:

```sh
pnpm dlx shadcn@4.22.1 add --cwd conformance/kits/shadcn --yes \
  button input textarea label checkbox switch select native-select \
  dialog dropdown-menu tabs sonner
```

Regeneration can fetch a newer registry snapshot even with a pinned CLI. Review
and commit the source diff and rerun every browser scenario after doing so.
