#!/usr/bin/env node

require = require("esm")(module /*, option */);
const { spawn, exec } = require("child_process");

//  ----------- START String->Array -----------
function stringToArray(str) {
  if (!str.replace(/[\s\[\]']/g, "")) return [];
  return str.replace(/[\s\[\]']/g, "").split(",");
}
//  ----------- END String->Array -----------

//  ----------- START Update Query Log -----------
function updateQueryLog(query, page) {
  const log = {
    query: query,
    page: page,
    createdAt: new Date(),
  };
  const insertLogDB = `mongo --eval 'db.queryLogs.insert(${JSON.stringify(
    log
  )})' foodDB`;
  exec(insertLogDB, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
      return;
    }
    if (stderr) {
      console.log(stderr);
      return;
    }
    if (stdout) {
      // console.log(stdout);
      console.log(`${query}-${page} is added to logs`);
      return;
    }
  });
}
//  ----------- START Update Query Log -----------

function addOneToExistsInRow(){
  exec('get-in-row', (err, stdout, stderr)=>{
      const exstsInROw = Number(stdout);
      if(Number.isInteger(Number(exstsInROw))){
          const newExstsInROw = exstsInROw+1;
          exec(`exst-in-row ${newExstsInROw}`, (err, stdout, stderr)=>{
              if(stdout){
                  if(Number(stdout)){
                      console.log(`Updated exists in row to: ${newExstsInROw}`)
                  }
                  if(!Number(stdout)){
                      console.log(`Couldn't update exists in row to: ${newExstsInROw}`)
                  }
              }
          });

      }else{
          console.log(`Couldn't get exists in row}`)
      }
  })
}

function nullifyExistsInRow(){
  exec(`exst-in-row ${0}`, (err, stdout, stderr)=>{
      if(stdout){
          if(Number(stdout)){
              console.log(`Nullified exists in a row`)
          }
          if(!Number(stdout)){
              console.log(`Couldn't nullify exists in a row`)
          }
      }
  });
}

function getItem(url) {
  return new Promise((resolve) => {
    // Check the url from database
    const urlCheckDB = `mongo --eval 'db.scrapedUrls.find({url: "${decodeURI(url)}"}).count()' foodDB`;
    exec(urlCheckDB, function (err, stdout, stderr) {
      if (!stdout) {
        console.log(`no stdout on ${urlCheckDB}`);
        return resolve();
      }

      const output = stdout.split("\n");
      const foundCount = Number(output[4]);

      // Skip if already scraped
      if (foundCount > 0) {
        console.log(`Exists: ${decodeURI(url)} (${foundCount})`);
        addOneToExistsInRow();
        return resolve();
      }

      // Getting Item
      const getItemCL = spawn("getItem", [url]);
      getItemCL.stdout.on("data", (itemData) => {
        console.log(`getting ${decodeURI(url)}`);
        try {
          const item = JSON.parse(`${itemData}`);
          // Check in DB & Write
          const checkDB = `mongo --eval 'db.foods.find({name: "${item.name.replace("'", "")}"}).count()' foodDB`;
          exec(checkDB, function (err, stdout, stderr) {
            if (!stdout) {
              console.log(`Couldn't run ${checkDB}`);
              return resolve();
            }
            const output = stdout.split("\n");
            const foundCount = Number(output[4]);
            if (foundCount > 0) {
              console.log(`${item.name} exists`);
              return resolve();
            }
            // write to DB
            const urlsToPush = item.urls; 
            delete item.urls
            const insertFood = `mongo --eval 'db.foods.insert(${JSON.stringify(
              item
            )})' foodDB`;
            exec(insertFood, function (err, stdout, stderr) {
              if (!stdout) {
                console.log(`Couldn't run ${insertFood}`);
                return resolve();
              }
              if (stdout) {
                console.log(`Inserted ${item.name}`);
                nullifyExistsInRow();
                return resolve();
              }
            });

            const insertUrls = `mongo --eval 'db.scrapedUrls.insert(${JSON.stringify(urlsToPush)})' foodDB`;
            exec(insertUrls, function (err, stdout, stderr) {
              if (!stdout) {
                console.log(`Couldn't run ${insertFood} `);
                return resolve();
              }
              if (stdout) {
                console.log(`Inserted ${item.name} scraped urls`);
                return resolve();
              }
            });
          });
        } catch (e) {
          console.log(e);
          return resolve();
        }
      });

      getItemCL.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
        return resolve();
      });
      getItemCL.on("error", (error) => {
        console.log(`error: ${error.message}`);
        return resolve();
      });
      getItemCL.on("close", (code) => {
        console.log(`getItemCL: child process exited with code ${code}`);
        return resolve();
      });
    });
  });
}

function getItems(urls, i = 0, callback) {
  if (i === urls.length) {
    callback();
    return console.log(`scraped the given ${urls.length} url(s)`);
  }

  getItem(urls[i]).then(() => {
    getItems(urls, ++i, callback);
  });
}

function scrapeQuery(term, page, callback) {
  const query = spawn("query", [term, page]);

  query.stdout.on("data", (urlsData) => {
    const urls = stringToArray(`${urlsData}`);
    if (urls.length) {
      return getItems(urls, 0, () => {
        updateQueryLog(term, page);
        return callback();
      });
    } else {
      return;
    }
  });

  query.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  query.on("error", (error) => {
    console.log(`error: ${error.message}`);
  });

  query.on("close", (code) => {
    console.log(`query: child process exited with code ${code}`);
  });
}

function runQuery(term, page = 0) {
  exec('get-in-row', (err, stdout, stderr)=>{
      const inRow = Number(stdout);
      if(inRow<=50){
        console.log(`runQuery: ${term}-${page}`);
        const queryCheckDB = `mongo --eval 'db.queryLogs.find({query: "${term}", page: ${page}}).count()' foodDB`;
        exec(queryCheckDB, function (err, stdout, stderr) {
          if (stdout) {
            const output = stdout.split("\n");
            const foundCount = Number(output[4]);
            if (foundCount > 0) {
              console.log(`${term}:${page} already queried`);
              return setTimeout(() => runQuery(term, ++page), 1000);
            }
            scrapeQuery(term, page, () =>
              setTimeout(() => runQuery(term, ++page), 1000)
            );
          }
        });
      }else{
        console.log(`More than 50 exists in a row`)
        nullifyExistsInRow();
        return;
      }
  });
}

const queryTerm = process.argv[2];
if (!queryTerm) {
  console.log("Invalid query term");
  process.exit();
} else {
  runQuery(queryTerm);
}
