#!/usr/bin/env node
const query = process.argv[2];
const page = process.argv[3];
if(!query || !page){
    console.log("Invalid arguments");
    process.exit();
}
require = require('esm')(module /*, option */)
require('../src/getQueryResultUrls').getQueryResultUrls(query, page)
.then(res=>console.log(res))
.catch(e=>console.log(e));