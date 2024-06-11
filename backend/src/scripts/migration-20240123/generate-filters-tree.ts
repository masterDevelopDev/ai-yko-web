import Excel from 'exceljs';
import path from 'node:path';
import _ from 'lodash';
import { writeFileSync } from 'node:fs';

const workbook = new Excel.Workbook();

const WATCHES_FILTERS = [];

const MANAGED_METADATA = [];

const DIRTY_KEY =
  'PousForme, AiguForm, BoitForm, BoucForm, CadrForme, IndeForme, LuneForme, PousForme,VisForme';

const getArborescence = (array: any, level: number) => {
  const levelAsString = 'level' + String(level);

  const groupedByLevelValue = _.groupBy(array, levelAsString);

  if (level === 0) {
    /// console.log({ groupedByLevelValue });
  }

  if (level >= 6) return;

  if (Object.keys(groupedByLevelValue).length === 0) {
    return;
  }

  return Object.entries(groupedByLevelValue)
    .filter(([key]) => key !== 'undefined')
    .map(([key, value]) => {
      const children = getArborescence(value, level + 1) ?? [];

      return {
        name: key,
        children,
        type: children ? 'GROUP' : 'VALUE',
      };
    });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const convertNode = (node) => {
  if (
    node.children &&
    node.children[0].type === 'VALUE' &&
    node.children[0].name === 'STRING'
  ) {
    node.type = 'VALUE';
    delete node.children;
    return node;
  }

  if (node.children && node.children[0].type === 'VALUE') {
    node.type = 'FILTER';
    node.values = node.children.map(({ name }) => name);
    delete node.children;
    return node;
  }

  return {
    name: node.name,
    type: node.type,
    children: node.children.map(convertNode),
  };
};

workbook.xlsx
  .readFile(
    path.join(__dirname, 'Termstore_cleansed_EN - Updated -20240121.xlsx'),
  )
  .then((wb) => {
    const worksheet = wb.getWorksheet('WATCHES');

    const rows = worksheet.getRows(2, 65);

    rows.forEach((row) => {
      let name: string;
      let type: string;

      row.eachCell((c, colNumber) => {
        if (colNumber === 2) {
          name = c.text;
        }

        if (colNumber === 3) {
          type = c.text;
        }

        if (colNumber === 4) {
          WATCHES_FILTERS.push({ name, type });
        }
      });
    });

    const metadataWorksheet = wb.getWorksheet('ManagedMetadata');

    const mmrows = metadataWorksheet.getRows(2, 1149);

    mmrows.forEach((row) => {
      let level0: string;
      let level1: string;
      let level2: string;
      let level3: string;
      let level4: string;
      let level5: string;
      let type: string;

      row.eachCell((c, colNumber) => {
        if (colNumber === 1) {
          level0 = c.text;
        }

        if (colNumber === 2) {
          level1 = c.text;
        }

        if (colNumber === 3) {
          level2 = c.text;
        }

        if (colNumber === 4) {
          level3 = c.text;
        }

        if (colNumber === 5) {
          level4 = c.text;
        }

        if (colNumber === 6) {
          level5 = c.text;
        }

        if (colNumber === 7) {
          level5 = c.text;

          MANAGED_METADATA.push({
            level0,
            level1,
            level2,
            level3,
            level4,
            level5,
            type,
          });
        }
      });
    });

    const MANAGED_METADATA_WATCHES = MANAGED_METADATA.filter(
      ({ level0 }) => level0 === 'Watches',
    );

    console.log(MANAGED_METADATA.at(30));

    const WATCHES_FILTERS_GROUPED_1 = _.groupBy(
      MANAGED_METADATA_WATCHES,
      'level1',
    );

    // console.log(Object.keys(WATCHES_FILTERS_GROUPED_1));

    const dkValue = WATCHES_FILTERS_GROUPED_1[DIRTY_KEY];

    DIRTY_KEY.split(',').forEach((s) => {
      const k = s.trim();

      WATCHES_FILTERS_GROUPED_1[k] = dkValue;
    });

    delete WATCHES_FILTERS_GROUPED_1[DIRTY_KEY];

    // console.log(Object.keys(WATCHES_FILTERS_GROUPED_1));
    // console.log(WATCHES_FILTERS_GROUPED_1);

    // console.log({ MANAGED_METADATA_WATCHES });

    // console.log({ MANAGED_METADATA });

    const m = getArborescence(MANAGED_METADATA, 0);

    // m = m.map(convertNode);

    // console.log(m[0].children[8]);

    writeFileSync(
      path.join(__dirname, 'managed_metadata.json'),
      JSON.stringify(m),
    );
  });
