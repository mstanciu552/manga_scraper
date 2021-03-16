import puppeteer from 'puppeteer';

const url = 'https://m.manganelo.com/w';

const favorites = [
  'I Am The Sorcerer King',
  'Apotheosis',
  'Martial Peak',
  'Rebirth: City Deity',
  'Yuan Zun',
  'Rebirth Of The Urban Immortal Cultivator',
  'Spirit Sword Sovereign',
  'Tales Of Demons And Gods',
  'God Of Martial Arts',
  'Star Martial God Technique',
  'Tower Of God',
  'Everlasting God Of Sword',
  'Cultivation Chat Group',
  'Yong Heng Zhi Zun',
  'Versatile Mage',
  'Magic Emperor',
  'Solo Leveling',
  'Volcanic Age',
  'Immortal, Invincible',
];
(async () => {
  // Starting the browser and going to specified page
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle2',
  });

  // Get promises with the data
  const mangaRaw = await page.$$('.content-homepage-item > a');

  // Extract only what data we want from each element
  let manga = []; // Will hold info about a manga if on the main page
  for (let i = 0; i < mangaRaw.length; i++) {
    manga.push({
      title: await (await mangaRaw[i].getProperty('title')).jsonValue(),
      href: await (await mangaRaw[i].getProperty('href')).jsonValue(),
      image: await (
        await (await mangaRaw[i].$('img')).getProperty('src')
      ).jsonValue(),
    });
  }

  // Loops through the first page of new manga and gets any that match the favorites array
  console.log('First Check');
  console.log('-----------------------------------------------------------');
  manga.forEach(m => {
    if (favorites.includes(m.title)) {
      console.log(m);
    }
  });
  console.log('-----------------------------------------------------------\n');

  console.log('Second Check');
  console.log('-----------------------------------------------------------');
  // Loop through all favorites manga
  let mangaInfo = [];
  for (let i = 0; i < favorites.length; i++) {
    // Write the name we are looking for in the input and wait for results to show
    await page.type('#search-story', favorites[i], { delay: 1 });
    await page.waitForSelector('#SearchResult > ul > a');

    // Get the first link in the search result list
    let href = await (
      await (await page.$('#SearchResult > ul > a')).getProperty('href')
    ).jsonValue();

    // Get suggestions from search bar
    let hrefListRaw = Array.from(await page.$$('#SearchResult > ul > a'));
    let hrefList = hrefListRaw.map(async el => await el.getProperty('href'));
    let hrefListTitle = Array.from(
      await page.$$(
        '#SearchResult > ul > a > li > .item_panel_right > .item_name'
      )
    );

    // Change array to hold the hrefs of all suggestions
    for (let i = 0; i < hrefList.length; i++) {
      hrefList[i] = await (await hrefList[i]).jsonValue();
    }

    // Change array to hold the titles of all suggestions
    for (let i = 0; i < hrefListTitle.length; i++) {
      hrefListTitle[i] = await hrefListTitle[i].evaluate(el => el.innerText);
    }

    // Match the favorite to the hrefListTitle
    let match = 0;
    let link = hrefList[match];
    if (hrefListTitle.length !== 1) {
      match = hrefListTitle.indexOf(favorites[i]);
      if (match === -1)
        match = hrefListTitle.indexOf(favorites[i].toLowerCase());
      if (match !== -1) link = hrefList[match];
      else match = 0;
    }

    // Pick the one that matches most with href from hrefList
    await page.goto(link);
    await page.waitForSelector('.info-image > img:nth-child(1)');

    // Get manga info
    let image = await (
      await page.$('.info-image > img:nth-child(1)')
    ).getProperty('src');
    image = await image.jsonValue();
    let lastChapter = await page.$eval('a.chapter-name', el => el.innerText);
    let lastDate = await page.$eval('span.chapter-time', el => el.innerText);

    let info = { title: favorites[i], image, lastChapter, lastDate, link };
    mangaInfo.push(info);
  }
  console.log('-----------------------------------------------------------');
  console.log('Manga Info', mangaInfo);
  // Close the browser when done
  await browser.close();
})();
