import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pulse-http-cache",
        expiration: { maxEntries: 80, maxAgeSeconds: 86400 },
      },
    },
  ],
});

export default withPWA({
  reactStrictMode: true,
  poweredByHeader: false,
});
