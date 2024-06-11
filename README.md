# AI-YKO Monorepo

The is the repo for the web application

## Getting Started

First install pnpm.

Then do, `pnpm install` and `pnpm dev`. This will launch the backend and frontend simultaneously.

## Important note when you modify backend routes

When you add or update a backend route, you must run the `pnpm generate-client` script from the root of the project.

This will update the client code in the frontend, and ensure type safety.

## PDFs and images Public access for S3

In image bucket: `search-engine-extracted-images`

```json
{
  "Id": "PublicAccessToImagesPolicy",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::search-engine-extracted-images/*"]
    }
  ]
}
```

In PDF bucket: `search-engine-pdfs`

```json
{
  "Id": "PublicAccessToPDFsPolicy",
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::search-engine-pdfs/*.pdf"]
    }
  ]
}
```

CORS configuration for public buckets (images/pdfs):

```json
[
  {
    "AllowedHeaders": [],
    "AllowedMethods": ["GET"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## TODO when possible

- Use SafeQL with Prisma <https://www.prisma.io/docs/orm/prisma-client/queries/raw-database-access/custom-and-type-safe-queries>

- To preserve consistance with the OpenAPI spec that is generated, replace null by undefined after retrieving objects from DB ?
