const axios = require("axios");
const cheerio = require("cheerio");
const domain = "https://www.website.com";

function removeSpaces(str) {
	return str.replace(/\s/g, "");
}

function extractNumberFromParameter(str) {
	if (!str) return 0;
	return Number(str.replace(/[^\d.-]/g, ""));
}

function extractFromPage($) {
	$.html();

	// ======= Extracting data =======
	let outputObj = {};
	let itemObj = {};
	itemObj.brand = $(".manufacturer").text().trim();
	itemObj.name = $("h1").text().trim();
	itemObj.string_length = removeSpaces($("h1").text()).length;

	// Set serving size grams
	itemObj.serving_size = removeSpaces(
		$(
			"div.nutrition_facts.international .serving_size.black.serving_size_value"
		).text()
	);

	itemObj.serving = removeSpaces(
		$(
			"div.nutrition_facts.international .serving_size.black.serving_size_value"
		).text()
	);

	// Exctracting Nutritional Details
	const titles = [];
	const values = [];
	const titlesEl = $("div.nutrition_facts.international .nutrient.left");
	const valuesEl = $(
		"div.nutrition_facts.international .nutrient.right.tRight"
	);
	titlesEl.each(function (key, value) {
		titles[key] = $(value).text();
	});
	valuesEl.each(function (key, value) {
		values[key] = $(value).text();
	});

	for (let i = 0; i < titles.length; i++) {
		if (i === 0) {
			const title = removeSpaces(titles[i]);
			const value = `${removeSpaces(values[1])}`;
			itemObj[title] = value;
		} else if (i === 1) {
			null;
		} else {
			const title = removeSpaces(titles[i]);
			const value = removeSpaces(values[i]);
			itemObj[title] = value;
		}
	}
	// ======= Formatting the output =======
	outputObj = {
		serving_unit: itemObj.serving,
		total_kal: extractNumberFromParameter(itemObj["열량"]),
		carbohydrate: extractNumberFromParameter(itemObj["탄수화물"]),
		sugar: extractNumberFromParameter(itemObj["설탕당"]),
		protein: extractNumberFromParameter(itemObj["단백질"]),
		fat: extractNumberFromParameter(itemObj["지방"]),
		fat_saturated: extractNumberFromParameter(itemObj["포화지방"]),
		fat_unsaturated: extractNumberFromParameter(itemObj["불포화지방"]),
		fat_polyunsaturated: extractNumberFromParameter(itemObj["다불포화지방"]),
		cholesterol: extractNumberFromParameter(itemObj["콜레스테롤"]),
		fiber: extractNumberFromParameter(itemObj["식이섬유"]),
		salt: extractNumberFromParameter(itemObj["나트륨"]),
		potassium: extractNumberFromParameter(itemObj["칼륨"]),
	};

	return outputObj;
}

export async function getSingleServing(url) {
	
	// ======= Access & Load =======
	const res = await axios.get(url);
	let $ = cheerio.load(res.data);
	$.html();

	// ======= Extracting data =======
	let outputObj = {};
	let itemObj = {};
	itemObj.brand = $(".manufacturer").text().trim();
	itemObj.name = $("h1").text().trim();
	itemObj.string_length = removeSpaces($("h1").text()).length;

	// Set serving size grams
	itemObj.serving_size = removeSpaces(
		$(
			"div.nutrition_facts.international .serving_size.black.serving_size_value"
		).text()
	);

	itemObj.serving = removeSpaces(
		$(
			"div.nutrition_facts.international .serving_size.black.serving_size_value"
		).text()
	);

	// Exctracting Nutritional Details
	const titles = [];
	const values = [];
	const titlesEl = $("div.nutrition_facts.international .nutrient.left");
	const valuesEl = $(
		"div.nutrition_facts.international .nutrient.right.tRight"
	);
	titlesEl.each(function (key, value) {
		titles[key] = $(value).text();
	});
	valuesEl.each(function (key, value) {
		values[key] = $(value).text();
	});

	for (let i = 0; i < titles.length; i++) {
		if (i === 0) {
			const title = removeSpaces(titles[i]);
			const value = `${removeSpaces(values[1])}`;
			itemObj[title] = value;
		} else if (i === 1) {
			null;
		} else {
			const title = removeSpaces(titles[i]);
			const value = removeSpaces(values[i]);
			itemObj[title] = value;
		}
	}
	let itemFullName = `${itemObj.brand} ${itemObj.name}`;
	if (itemObj.name.includes(itemObj.brand)) {
		itemFullName = itemObj.name;
	}
	// ======= Formatting the output =======
	outputObj = {
		serving_unit: itemObj.serving,
		total_kal: extractNumberFromParameter(itemObj["열량"]),
		carbohydrate: extractNumberFromParameter(itemObj["탄수화물"]),
		sugar: extractNumberFromParameter(itemObj["설탕당"]),
		protein: extractNumberFromParameter(itemObj["단백질"]),
		fat: extractNumberFromParameter(itemObj["지방"]),
		fat_saturated: extractNumberFromParameter(itemObj["포화지방"]),
		fat_unsaturated: extractNumberFromParameter(itemObj["불포화지방"]),
		fat_polyunsaturated: extractNumberFromParameter(itemObj["다불포화지방"]),
		cholesterol: extractNumberFromParameter(itemObj["콜레스테롤"]),
		fiber: extractNumberFromParameter(itemObj["식이섬유"]),
		salt: extractNumberFromParameter(itemObj["나트륨"]),
		potassium: extractNumberFromParameter(itemObj["칼륨"]),
	};

	return outputObj;
}

// Extract Servings Table Function
function extractAltServingTable($) {
	let table = [];
	let alreadyPushed = {};

	// extract array of "td"s from: next element from "일반 서빙크기:" -> the table with the servings
	const selectedElements = $('h4.separated:contains("일반 서빙크기:")')
		.next()
		.children("tbody")
		.children("tr")
		.children("td")
		.children("a");
	selectedElements.map((i, el) => {
		let name = $(el).text().trim();
		let href = $(el).attr("href");
		let url = `${domain}${href}`;
		const servingObj = {
			name: name,
			url: url,
		};
		if (!alreadyPushed[`${href}`]) {
			table.push(servingObj);
			alreadyPushed[`${href}`] = 1;
		}
	});
	return table;
}

export async function getItem(url) {
	try {
		let itemObj = {};

		// ======= Access & Load =======
		const res = await axios.get(url);
		let $ = cheerio.load(res.data);
		$.html();

		// ======= Item: name, string_length, serving_unit_list (+ serving unit urls) =======
		// == name ==
		let brand = $(".manufacturer").text().trim().replace("'", "");
		let name = $("h1").text().trim().replace("'", "");
		itemObj["name"] = `${brand} ${name}`;
		if (name.includes(brand)) {
			itemObj["name"] = name;
		}

		// == string_length ==
		itemObj["string_length"] = itemObj["name"].length;

		// == nutrition_list ==
		// get serving urls: array of objects [ { <serving_unit>: <serving_unit url> } ]
		let altServings = extractAltServingTable($); // return array of objects [ { <serving_unit>: <serving_unit url> } ]

		// Get the initial serving and push it to nutrition_list
		let nutrition_list = [];
		const initialServing = extractFromPage($);
		nutrition_list.push(initialServing);

		// filter altServings from existing servings
		altServings = altServings.filter((altServ) => {
			let alt_serv_name = new RegExp(removeSpaces(altServ.name), "gi");
			const includes = nutrition_list.some((item) =>
				alt_serv_name.test(removeSpaces(item.serving_unit))
			);
			return !includes;
		});

		// get the rest of the servings
        const altUrls = altServings.map(serv=>serv.url)
        for(let url of altUrls){
            try{
                const servingData = await getSingleServing(url);
                nutrition_list.push(servingData)
            }catch(e){
                console.log(e)
            }
        }

		// nutrition_list = [...nutrition_list, ...altServingsData];
		itemObj["nutrition_list"] = nutrition_list;

		// // == serving_unit_list ==
		itemObj["serving_unit_list"] = itemObj["nutrition_list"].map(
			(serv) => serv.serving_unit
		);

		// Format urls to be push to DB later
		const formattedAltUrls = altUrls.map(url=>{
			return { url: decodeURI(url), food_name: itemObj["name"] }
		});
		const urlsToPush = [...formattedAltUrls, { url: decodeURI(url), food_name: itemObj["name"] }];
		itemObj["urls"] = urlsToPush;

		return JSON.stringify(itemObj);
	} catch (e) {
		console.log(e);
	}
}
