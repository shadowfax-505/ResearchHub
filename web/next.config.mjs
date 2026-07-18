import path from 'node:path';

const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  outputFileTracingRoot: path.join(process.cwd(), '..')
};

export default nextConfig;
