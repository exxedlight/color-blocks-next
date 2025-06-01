const withPWA = require("next-pwa")({
  dest: "public", // PWA files
  disable: process.env.NODE_ENV === "development", // disable PWA in DEV mode
  register: true, // auto SW register
  skipWaiting: true, // skip SW update waiting

  workboxOptions: {
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /^\/_next\/static.*/, // Кэшируем статические файлы Next.js
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 дней
          },
        },
      },
      {
        urlPattern: /\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$/, // Кэшируем медиафайлы и стили
        handler: "CacheFirst",
        options: {
          cacheName: "assets-cache",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 дней
          },
        },
      },
    ],
  },
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);