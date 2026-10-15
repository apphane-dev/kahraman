import type { ComponentProps } from 'astro/types';
import type { Code } from 'astro:components';

// Paper, ink, and cobalt, matching the canonical I. identity.
export const kahramanTheme = {
  name: 'kahraman-paper',
  type: 'light',
  colors: {
    'editor.background': '#fcfbf7',
    'editor.foreground': '#111111',
  },
  settings: [
    { settings: { foreground: '#111111', background: '#fcfbf7' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5b574f', fontStyle: 'normal' } },
    { scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'], settings: { foreground: '#2438f5' } },
    { scope: ['keyword.operator'], settings: { foreground: '#5b574f' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#2438f5' } },
    { scope: ['variable.other.property', 'meta.property.object'], settings: { foreground: '#111111' } },
    { scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: '#276437' } },
    { scope: ['string.regexp', 'constant.other.character-class'], settings: { foreground: '#9a3b12' } },
    { scope: ['constant.numeric', 'constant.language', 'constant.language.boolean'], settings: { foreground: '#9a3b12' } },
    { scope: ['variable', 'variable.other.readwrite', 'meta.definition.variable'], settings: { foreground: '#111111' } },
    { scope: ['variable.language', 'variable.language.this'], settings: { foreground: '#2438f5', fontStyle: 'normal' } },
    { scope: ['entity.name.type', 'support.type', 'entity.name.class'], settings: { foreground: '#2438f5' } },
    { scope: ['punctuation', 'meta.brace', 'punctuation.accessor'], settings: { foreground: '#5b574f' } },
    { scope: ['variable.parameter'], settings: { foreground: '#111111' } },
  ],
} satisfies NonNullable<ComponentProps<typeof Code>['theme']>;
