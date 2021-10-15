#!/usr/bin/env node
const url = process.argv[2];
if(!url){
    console.log(null);
    process.exit();
}
require = require('esm')(module /*, option */)
require('../src/getItem').getSingleServing(url)
.then(res=>console.log(res))
.catch(e=>console.log(e));