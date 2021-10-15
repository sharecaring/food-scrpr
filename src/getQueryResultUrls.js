const axios = require('axios');
const cheerio = require('cheerio');
const domain = "https://www.website.com";

export async function getQueryResultUrls(query, page){
    let urls = [];

    const queryUrl = `${domain}/q=${encodeURI(query)}&pg=${page}`;
    const queryRes = await axios.get(queryUrl);
    const $ = cheerio.load(queryRes.data);
    $.html();
    
    // Make sure that the page returned results on 
    if($(".searchNoResult").first().text()){
        // console.log(`No more results on query: "${query}"`);
        return urls;
    }

    $('table tbody tr td a.prominent').each(
        (key, value)=>{
            const itemLink = domain+$(value).attr('href');
            urls.push(itemLink);
        }
    );

    return urls;
}