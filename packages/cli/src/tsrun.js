#!/usr/bin/env node

const path = require('path');
// eslint-disable-next-line @typescript-eslint/unbound-method
const { tsNode } = require('./utils/tsnode');

tsNode({ configFile: path.join(__dirname, '../tsconfig.json') });
require('./bin');
