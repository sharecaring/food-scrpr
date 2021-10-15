#!/usr/bin/env node

require = require("esm")(module /*, option */);
const { spawn, exec } = require("child_process");
const chars = require('../public/hangeul_characters.json');

function runScraper(i=0){
    if(i===chars.length-1) return;
    
    exec(`last-char-i ${i}`, (err, stdout, stderr)=>{
        if(stdout){
            if(Number(stdout)){
                console.log(`Updated last character index: ${i}`)
            }
            if(!Number(stdout)){
                console.log(`Couldn't update last charachter: ${i}`)
            }
        }
    });

    const scrape = spawn("scrape", [chars[i]]);

    scrape.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    scrape.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
    });

    scrape.on("error", (error) => {
        console.log(`error: ${error.message}`);
        return runScraper(++i);
    });

    scrape.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        return runScraper(++i);
    });
}

function runFromLastCharacter(){
    exec('last-char', (err, stdout, stderr)=>{
        const index = Number(stdout);
        if(Number.isInteger(Number(index))){
            runScraper(index);
        }else{
            runScraper();
        }
    })
}

function addOneTolastChar(){
    exec('last-char', (err, stdout, stderr)=>{
        const index = Number(stdout);
        if(Number.isInteger(Number(index))){
            const newIndex = index+1;
            exec(`last-char-i ${newIndex}`, (err, stdout, stderr)=>{
                if(stdout){
                    if(Number(stdout)){
                        console.log(`Updated last character index: ${newIndex}`)
                    }
                    if(!Number(stdout)){
                        console.log(`Couldn't update last charachter: ${newIndex}`)
                    }
                }
            });

        }else{
            console.log(`Couldn't get last index}`)
        }
    })
}

runFromLastCharacter()