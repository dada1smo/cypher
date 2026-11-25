const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
// The dictionary ships as a bundled SQLite file (assets/cypher-en.db).
config.resolver.assetExts.push('db');

module.exports = config;
