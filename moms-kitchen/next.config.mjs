/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Mongoose and bcrypt run only on the server
  serverExternalPackages: ["mongoose", "bcryptjs"],
};

export default nextConfig;
