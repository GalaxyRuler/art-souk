module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  jsxSingleQuote: false,
  proseWrap: 'preserve',
  requirePragma: false,
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
      },
    },
  ],
}