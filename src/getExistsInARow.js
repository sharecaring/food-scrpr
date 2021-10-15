export function getExistsInARow(){
    let lastPermIndex = 0;
    try{
        lastPermIndex = require('../public/exsistInARow.json')
    }catch(e){
        console.log(e)
    }

    return lastPermIndex;
}
