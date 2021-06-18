## Error Log

```
  ● VP - KPI Summary › [C367694] Verify the vendor is able to see the KPIs for multiple restaurants

    page.waitForSelector: Timeout 30000ms exceeded.
    =========================== logs ===========================
    waiting for selector "[data-testid="multiselect-filter-vendors-select"]"
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      59 |
      60 |     // Select first 2 vendors from dropdown
    > 61 |     const vendorSelector = await page.waitForSelector(
         |                                       ^
      62 |       '[data-testid="multiselect-filter-vendors-select"]',
      63 |       {
      64 |         state: 'attached',

      at Object.captureStackTrace (../../../node_modules/playwright/lib/utils/stackTrace.js:51:19)
      at Connection.sendMessageToServer (../../../node_modules/playwright/lib/client/connection.js:69:48)
      at Proxy.<anonymous> (../../../node_modules/playwright/lib/client/channelOwner.js:64:61)
      at ../../../node_modules/playwright/lib/client/frame.js:193:42
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:34)
      at Frame.waitForSelector (../../../node_modules/playwright/lib/client/frame.js:188:21)
      at ../../../node_modules/playwright/lib/client/page.js:212:60
      at Page._attributeToPage (../../../node_modules/playwright/lib/client/page.js:202:20)
      at Page.waitForSelector (../../../node_modules/playwright/lib/client/page.js:212:21)
      at tests/vp-plugin/kpi-summary.e2e.ts:61:39
      at step (tests/vp-plugin/kpi-summary.e2e.ts:33:23)
      at Object.next (tests/vp-plugin/kpi-summary.e2e.ts:14:53)
      at tests/vp-plugin/kpi-summary.e2e.ts:8:71
      at Object.<anonymous>.__awaiter (tests/vp-plugin/kpi-summary.e2e.ts:4:12)
      at Object.<anonymous> (tests/vp-plugin/kpi-summary.e2e.ts:56:86)
```

## Hypothesis

Clicking the card for the kpi dashboard has not loaded before further verification is done.

All these errors happened when running code in the format:

```typescriptreact
  //Clicking a KPI card
  await clickKpiCard(page)(...);
  //Waiting for a change
  await page.waitForSelector(...);
```

Possible solution would be to click the KPI card, and then wait for

1. Navigation to complete
2. Loading state to be reached
   before proceeding to do further verification

## Possible related failures

- tests/vp-plugin/customer-conversion-all-details-check.e2e.ts:115:14
- tests/vp-plugin/kpi-summary.e2e.ts:8:71

## Resolution

Update in `e2e/actions/vp-plugin/dashboard/index.ts`

### Old Code:

```typescriptreact

/**
 * Click on a card and navigate to details page
 * @param page
 */
export const clickKpiCard = (page: Page) => async (cardSelector: string) => {
  const card = await page.waitForSelector(cardSelector);
  await card.click();
};

```

### New Code:

```typescriptreact
/**
 * Click on a card and navigate to details page
 * @param page
 */
export const clickKpiCard = (page: Page) => async (cardSelector: string) => {
  const card = await page.waitForSelector(cardSelector);
  await card.click();
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.waitForLoadState();
};

```
