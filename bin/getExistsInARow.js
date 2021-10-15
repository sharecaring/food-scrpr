#!/usr/bin/env node
require = require('esm')(module /*, option */)
const {getExistsInARow} = require('../src/getExistsInARow')
console.log(getExistsInARow());