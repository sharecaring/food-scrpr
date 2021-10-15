const fs = require('fs').promises;
const characters = require('./hangeul_characters.json'); //length = 1148
// Number of permutations: 1148 * 1147 = 1,316,756

function toStringArray(array){
    return `[${array.map(v=>`"${v}"`)}]`;
}

function generatePermutations(array, r) {                                                                       
    var n = array.length;                                                          
    if (r === undefined) {                                                         
        r = n;                                                                     
    }                                                                              
    if (r > n) {                                                                   
        return;                                                                    
    }                                                                              
    var indices = [];                                                              
    for (var i = 0; i < n; i++) {                                              
        indices.push(i);                                                           
    }                                                                              
    var cycles = [];                                                               
    for (var i = n; i > n - r; i-- ) {                                             
        cycles.push(i);                                                            
    }                                                                              
    var results = [];                                                              
    var res = [];                                                                  
    for (var k = 0; k < r; k++) {                                                  
        res.push(array[indices[k]]);                                               
    }                                                                     
    results.push(res.join(''));                                                             
                                                                                   
    var broken = false;                                                            
    while (n > 0) {                                                                
        for (var i = r - 1; i >= 0; i--) {                                         
            cycles[i]--;                                                           
            if (cycles[i] === 0) {                                                 
                indices = indices.slice(0, i).concat(                              
                    indices.slice(i+1).concat(
                        indices.slice(i, i+1)));             
                cycles[i] = n - i;                                                 
                broken = false;                                                    
            } else {                                                               
                var j = cycles[i];                                                 
                var x = indices[i];                                                
                indices[i] = indices[n - j];                          
                indices[n - j] = x;                                   
                var res = [];
                for (var k = 0; k < r; k++) {                        
                    res.push(array[indices[k]]);                                   
                }
                results.push(res.join(''));
                broken = true;                                                     
                break;                                                             
            }                                                                      
        }                                                                          
        if (broken === false) {                                                    
            break;                                                                 
        }                                                                          
    }                                                                              
    return results;                                                                
}                                                                                  

async function generate(){
    const permutations = generatePermutations(characters, 2);

    // generate into vars.json
    const jsContent = `${toStringArray(permutations)}`
    await fs.writeFile('../public/permutations.json', jsContent);
}

generate();
