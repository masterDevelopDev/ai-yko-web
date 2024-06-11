import { PrismaClient } from '@prisma/client';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { basename } from 'node:path';

const AWS_SECRET_ACCESS_KEY_INITIAL_MIGRATION =
  process.env.AWS_SECRET_ACCESS_KEY_INITIAL_MIGRATION;
const AWS_ACCESS_KEY_ID_INITIAL_MIGRATION =
  process.env.AWS_ACCESS_KEY_ID_INITIAL_MIGRATION;

if (
  !(
    AWS_SECRET_ACCESS_KEY_INITIAL_MIGRATION &&
    AWS_ACCESS_KEY_ID_INITIAL_MIGRATION
  )
) {
  throw new Error('all env variables should be set');
}

const client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID_INITIAL_MIGRATION,
    secretAccessKey: AWS_SECRET_ACCESS_KEY_INITIAL_MIGRATION,
  },
  region: 'eu-west-1',
});

const BUCKET_NAME = 'sample-design-documents';

const command = new ListObjectsV2Command({
  Bucket: BUCKET_NAME,
  // The default and maximum number of keys returned is 1000. This limits it to
  // one for demonstration purposes.
  MaxKeys: 1000,
});

const prismaClient = new PrismaClient();

const doMigration = async () => {
  try {
    let isTruncated = true;

    while (isTruncated) {
      const { Contents, IsTruncated, NextContinuationToken } =
        await client.send(command);

      const result = await prismaClient.document.createMany({
        data: Contents.map((c) => ({
          url: c.Key,
          filename: basename(c.Key),
          categoryId: 'todo',
        })),
        skipDuplicates: true,
      });

      console.log({ result });

      isTruncated = IsTruncated;
      command.input.ContinuationToken = NextContinuationToken;
    }
  } catch (err) {
    console.error(err);
  }
};

doMigration();
