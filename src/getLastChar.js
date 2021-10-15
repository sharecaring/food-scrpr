export function getLastChar(){
    let lastPermIndex = 0;

    try{
        lastPermIndex = require('../public/lastCharIndex.json')
    }catch(e){
        console.log(e)
    }

    return lastPermIndex;
}
