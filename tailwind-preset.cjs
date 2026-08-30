// CJS entry for the preset. Without it, require('moon-design-system/tailwind-preset')
// resolved to the .mjs and handed back the MODULE NAMESPACE — so a CJS config got
// { default: preset }, spread it into `presets`, and every brand token silently
// vanished from that app unless the author knew to write `.default` (trap 5 in
// docs/design-system-handoff.md). The exports map now routes `require` here and
// `import` to the .mjs, so both spellings just work.
// require(esm) is native from Node 22.12; the repo pins 22.22 (.node-version).
module.exports = require('./tailwind-preset.mjs').default;
