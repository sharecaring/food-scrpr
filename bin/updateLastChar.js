#!/usr/bin/env node
require = require('esm')(module /*, option */)
const index = process.argv[2];
const {updateLastChar} = require('../src/updateLastChar')
updateLastChar(index)
.then(res=>console.log(res))
.catch(e=>console.log(e));