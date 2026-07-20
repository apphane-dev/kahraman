// Warm, blue-free syntax theme matching the kahraman amber-on-ink identity.
// Passed to Astro's <Code> (Shiki) component.
export const kahramanTheme = {
  name: 'kahraman-amber',
  type: 'dark',
  colors: {
    'editor.background': '#0b1226',
    'editor.foreground': '#fcedd2',
  },
  settings: [
    { settings: { foreground: '#fcedd2', background: '#0b1226' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6f6a58', fontStyle: 'italic' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'], settings: { foreground: '#fda115' } },
    { scope: ['keyword.operator'], settings: { foreground: '#c89257' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#ffd089' } },
    { scope: ['variable.other.property', 'meta.property.object'], settings: { foreground: '#f5deb0' } },
    { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: '#c7cf7a' } },
    { scope: ['string.regexp', 'constant.other.character-class'], settings: { foreground: '#e0a95f' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.language.boolean'], settings: { foreground: '#e88c4a' } },
    { scope: ['variable', 'variable.other.readwrite', 'meta.definition.variable'], settings: { foreground: '#fcedd2' } },
    { scope: ['variable.language', 'variable.language.this'], settings: { foreground: '#d97e0a', fontStyle: 'italic' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class'], settings: { foreground: '#e8b877' } },
    { scope: ['punctuation', 'meta.brace', 'punctuation.accessor'], settings: { foreground: '#8f8a76' } },
    { scope: ['variable.parameter'], settings: { foreground: '#d8cbab' } },
  ],
};
