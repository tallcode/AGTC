export default {
  extends: [
    'stylelint-config-standard',
  ],
  plugins: [
    '@stylistic/stylelint-plugin',
  ],
  rules: {
    '@stylistic/indentation': [2, { baseIndentLevel: 0 }],
    '@stylistic/color-hex-case': 'upper',
    '@stylistic/unit-case': 'lower',
  },
  overrides: [
    {
      files: ['**/*.less'],
      customSyntax: 'postcss-less',
    },
  ],
}
