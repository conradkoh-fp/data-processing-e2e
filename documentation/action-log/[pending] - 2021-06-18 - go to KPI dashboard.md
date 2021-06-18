tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:69:30

## Error Log

```
FAIL browser: chromium e2e/tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts (73.285s)
  ● VP - Vendor Health Feature for account with single vendor › [C411571] Verify if the user account is single outlet, summary screen should display number of metrics are healthy

    page.innerText: Timeout 30000ms exceeded.
    =========================== logs ===========================
      retrieving innerText from "div[data-testid="outlet-health-topcard"] p[data-testid="pc-pri-title"]"
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      67 |   it('[C411571] Verify if the user account is single outlet, summary screen should display number of metrics are healthy', async () => {
      68 |     const { healthyMetricsCount, totalMetricsCount } = apiResponse.data[0];
    > 69 |     const title = await page.innerText(`${outletTopCard} ${cardTitle}`);
         |                              ^
      70 |     const value = await page.innerText(`${outletTopCard} ${topCardValue}`);
      71 |     const subtext = await page.innerText(`${outletTopCard} ${topCardSubtext}`);
      72 |

      at Object.captureStackTrace (../../../node_modules/playwright/lib/utils/stackTrace.js:51:19)
      at Connection.sendMessageToServer (../../../node_modules/playwright/lib/client/connection.js:69:48)
      at Proxy.<anonymous> (../../../node_modules/playwright/lib/client/channelOwner.js:64:61)
      at ../../../node_modules/playwright/lib/client/frame.js:301:35
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:34)
      at Frame.innerText (../../../node_modules/playwright/lib/client/frame.js:300:21)
      at ../../../node_modules/playwright/lib/client/page.js:440:60
      at Page._attributeToPage (../../../node_modules/playwright/lib/client/page.js:202:20)
      at Page.innerText (../../../node_modules/playwright/lib/client/page.js:440:21)
      at tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:69:30
      at step (tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:33:23)
      at Object.next (tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:14:53)
      at tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:8:71
      at Object.<anonymous>.__awaiter (tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:4:12)
      at Object.<anonymous> (tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:67:124)
```

## Hypothesis

Redirect not completing before verification is done.

## Possible related failures

- tests/vp-plugin/vendor-health-single-vendor-account.e2e.ts:69:30

## Resolution

Update in `e2e/actions/vp-plugin/vendor-health/index.ts`

### Old Code:

```typescriptreact

/**
 * Go to KPI Dashboard
 * @param page
 * @returns
 */
export const goToKPIDashboard = (page: Page, env: Env) => async (dateRange: DateRange) => {
  const { from, to } = dateRange;
  await goTo(page, env)(`/vendor-performance?from=${from}&to=${to}&curdate=${kpiCurDate}`);
};

```

### New Code:

```typescriptreact

/**
 * Go to KPI Dashboard
 * @param page
 * @returns
 */
export const goToKPIDashboard = (page: Page, env: Env) => async (dateRange: DateRange) => {
  const { from, to } = dateRange;
  await goTo(page, env)(`/vendor-performance?from=${from}&to=${to}&curdate=${kpiCurDate}`);
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.waitForLoadState();
};

```
