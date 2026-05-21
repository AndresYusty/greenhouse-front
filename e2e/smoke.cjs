/**
 * Copyright (c) 2026 — Proyecto académico Invernadero.
 * Prueba E2E con Selenium (Node CommonJS para compatibilidad con selenium-webdriver).
 */
const { Builder, Browser } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const baseUrl = process.env.BASE_URL || "http://localhost:5173";

(async () => {
  const options = new chrome.Options();
  options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu");

  const driver = await new Builder().forBrowser(Browser.CHROME).setChromeOptions(options).build();

  try {
    await driver.get(baseUrl);
    const title = await driver.getTitle();
    const ok =
      title.toLowerCase().includes("invernadero") || title.toLowerCase().includes("greenhouse");
    if (!ok) {
      console.error("Unexpected title:", title);
      process.exitCode = 1;
    } else {
      console.log("OK smoke:", title);
    }
  } finally {
    await driver.quit();
  }
})();
