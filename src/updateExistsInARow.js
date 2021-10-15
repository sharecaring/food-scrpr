const fs = require('fs').promises;

export function updateExistsInARow(index){
    return fs.writeFile('./public/exsistInARow.json', `${index}`)
    .then(result=> 1)
    .catch(e=> {
        console.log(e)
        return 0;
    });
}
