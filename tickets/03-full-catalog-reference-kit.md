# 03: Full scenario catalog on React Aria Components

**What to build:** every first-wave conformance scenario runs against the
reference kit fixture and passes.

**Blocked by:** 01 (tracer bullet).

**Status:** ready-for-agent

- [ ] Scenarios and contract entries exist for `button-disabled`, `textbox`,
      `textarea`, `checkbox`, `switch`, `native-select`, `combobox`, `dialog`,
      `menu`, `tabs`, and `status`.
- [ ] No scenario uses an escape hatch such as `.within('global')`.
- [ ] The React Aria Components kit fixture implements every scenario it has a
      widget for; the rest are n/a in its manifest.
- [ ] All implemented scenarios pass. Any that fails is a suite bug to fix here,
      not a known gap.
