const fs = require('fs').promises;

export function updateLastChar(index){
    return fs.writeFile('./public/lastCharIndex.json', `${index}`)
    .then(result=> 1)
    .catch(e=> {
        console.log(e)
        return 0;
    });
}
