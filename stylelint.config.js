export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-clean-order',
    'stylelint-config-recommended-vue',
  ],
  overrides: [
    {
      files: ['**/*.vue', '**/*.html'],
      customSyntax: 'postcss-html',
    },
  ],
  plugins: [
    '@stylistic/stylelint-plugin',
  ],
  rules: {
    '@stylistic/indentation': [2, { baseIndentLevel: 0 }],
    '@stylistic/color-hex-case': 'upper',
    '@stylistic/unit-case': 'lower',
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen', 'theme', 'reference'],
      },
    ],
    'at-rule-no-deprecated': null,
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: ['constant'],
      },
    ],
    'no-invalid-position-at-import-rule': null,
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*([-_]{1,2}[a-zA-Z0-9]+)*$',
    ],
  },
}
