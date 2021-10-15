const puppeteer = require('puppeteer');
const fs = require('fs').promises;

function toStringArray(array){
  return `[${array.map(v=>`"${v}"`)}]`;
}

const getCharacters = async () => {
    // launch "headed" browser (verification needs to be done to run headless) -> "headed" saves time
    const browser = await puppeteer.launch({
      headless: false
    });

    // open a new page & go to the url
    const page = await browser.newPage();
    const url = "someurl"
    await page.goto(url);

    // run script
    let myElements = await page.evaluate(()=>{
      // define selector
      const selector = 'div.w div.wiki-heading-content div.wiki-paragraph a.wiki-link-internal:not(.not-exist)';

      // select and map through to her innerHTML of selected elements
      let elements = Array.from(
        document.querySelectorAll(selector)
        ).map(el=>el.innerHTML);
      
      // only get characters: slice the array 
      // - from index of the first valid character "가"
      // - to the last valid character "힣" => index+1 (including the last one)
      elements = elements.slice(elements.indexOf("가"), elements.indexOf("힣")+1);

      // return the variables
      return elements;
    });

    // close the browser
    await browser.close();
    
    // create JS file with exporting const "characters"
    const jsContent = `${toStringArray(myElements)}`
    console.log(jsContent)
    await fs.writeFile('../public/permutations.json', jsContent, 'utf8');
    return "Success";
}

getCharacters().then(res=>console.log(res)).catch(e=>console.log(e));