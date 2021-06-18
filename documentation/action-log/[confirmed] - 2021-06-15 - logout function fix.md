## Error Log

```
  ● VFD - Deal Creation › [C260036]Verify the deal creation flow - Percentage Discount

    page.waitForSelector: Unable to adopt element handle from a different document
    =========================== logs ===========================
    waiting for selector "#button_login" to be visible
      selector resolved to visible <button tabindex="0" type="submit" id="button_login" dat…>…</button>
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      11 |
      12 |   // wait for login button to appear
    > 13 |   await page.waitForSelector('#button_login', { timeout: 30000 });
         |              ^
      14 | };
      15 |

      at Object.captureStackTrace (../../../node_modules/playwright/lib/utils/stackTrace.js:48:19)
      at Connection.sendMessageToServer (../../../node_modules/playwright/lib/client/connection.js:69:48)
      at Proxy.<anonymous> (../../../node_modules/playwright/lib/client/channelOwner.js:64:61)
      at ../../../node_modules/playwright/lib/client/frame.js:202:42
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:34)
      at Frame.waitForSelector (../../../node_modules/playwright/lib/client/frame.js:197:21)
      at ../../../node_modules/playwright/lib/client/page.js:241:60
      at Page._attributeToPage (../../../node_modules/playwright/lib/client/page.js:231:20)
      at Page.waitForSelector (../../../node_modules/playwright/lib/client/page.js:241:21)
      at setup/common/logout.ts:13:14
```

## Resolution

Update in `e2e/setup/common/logout.ts`

### Old Code:

```typescriptreact

export const userLogout = (page: Page) => async () => {
  // press menu button
  await page.waitForSelector('button[data-testid="popmenu-trigger"]', { timeout: 30000 });
  await page.click('button[data-testid="popmenu-trigger"]');

  // press logout button
  await page.waitForSelector('li[data-testid="menu-item-1"]', { timeout: 30000 });
  await page.click('li[data-testid="menu-item-1"]');

  // wait for login button to appear
  await page.waitForSelector('#button_login', { timeout: 30000 });
};

```

### New Code:

```typescriptreact
export const userLogout = (ctx: BrowserContext, page: Page, env: Env) => async () => {
  await page.evaluate(() => localStorage.removeItem('mainSessionInfo'));
  await goTo(page, env)('/login');
};

```
