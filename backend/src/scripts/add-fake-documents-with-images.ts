import { faker } from '@faker-js/faker';
import { Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

const main = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const _ of Array.from({ length: 20 })) {
    const result = await prismaClient.document.create({
      data: {
        filename: faker.database.column().toLowerCase() + Date.now() + '.pdf',

        url:
          'http://localhost:3000/public/design-pdf-example-' +
          Date.now() +
          '.pdf',

        images: {
          createMany: {
            data: Array.from({
              length: faker.number.int({ min: 3, max: 6 }),
            }).map(() => ({
              url: faker.image.urlLoremFlickr({ category: 'airline' }),
            })),
          },
        },

        categoryId: 'todo',
      },
    });

    Logger.log({ result });
  }
};

main();
