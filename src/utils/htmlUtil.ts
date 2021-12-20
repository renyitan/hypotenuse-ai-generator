import path from 'path';
import * as ejs from 'ejs';
import { promises as fs } from 'fs';

export const generateHTML = async (storeName, data): Promise<string> => {
  // 1. get the HTML template
  const template = await fs.readFile(
    path.join(__dirname, '../views/template.ejs'),
    'utf-8'
  );

  //2. grab the data
  const { results } = data;

  //3. dynamically render the html
  const html: string = ejs.render(template, { storeName, results });
  return html;
};

export default {
  generateHTML,
};
