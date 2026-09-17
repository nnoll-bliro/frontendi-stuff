import { defineConfig, devices } from "@playwright/test";

const channel = process.env.PLAYWRIGHT_CHANNEL;

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3137",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        browserName: "chromium",
        viewport: { width: 1440, height: 1000 },
        ...(channel ? { channel } : {}),
      },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3137 --strictPort --open false",
    url: "http://localhost:3137",
    reuseExistingServer: false,
  },
});
