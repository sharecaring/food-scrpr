#!/usr/bin/env node
require = require('esm')(module /*, option */)
const index = process.argv[2];
const {updateExistsInARow} = require('../src/updateExistsInARow')
updateExistsInARow(index)
.then(res=>console.log(res))
.catch(e=>console.log(e));