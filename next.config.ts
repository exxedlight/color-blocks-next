const withPWA = require("next-pwa")({
  dest: "public", // PWA files
  disable: process.env.NODE_ENV === "development", // disable PWA in DEV mode
  register: true, // auto SW register
  skipWaiting: true, // skip SW update waiting
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);