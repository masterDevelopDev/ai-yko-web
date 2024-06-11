import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { XMLParser } from 'fast-xml-parser';

const xmlStr = readFileSync(
  join(__dirname, 'data-initial-migration/Termstore.xml'),
);

const parser = new XMLParser({ ignoreAttributes: false });

const jObj = parser.parse(xmlStr);

console.log(JSON.stringify(jObj, null, 2));
