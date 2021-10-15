#!/usr/bin/env node
require = require('esm')(module /*, option */)
const {getLastChar} = require('../src/getLastChar')
console.log(getLastChar());