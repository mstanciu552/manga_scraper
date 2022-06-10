import fs from 'fs';

function convert_to_options() {
  const manga = JSON.parse(fs.readFileSync('manga.json'));

  let options = {};

  for (let entry of manga) {
    let key = `${entry.title} - ${entry.lastChapter} - ${entry.lastDate}`;
    let value = `${entry.link}`;
    options[key] = value;
  }

  for (let key in options) {
    console.log(`${key} -> ${options[key]}`);
  }
}

convert_to_options()
