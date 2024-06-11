/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'sample-design-documents.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'search-engine-extracted-images.s3.eu-west-1.amazonaws.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    })
    return config
  },
}

export default nextConfig
