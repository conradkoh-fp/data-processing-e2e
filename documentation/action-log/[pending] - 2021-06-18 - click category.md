## Error Log

```
FAIL browser: webkit e2e/tests/vp-plugin/prep-time-details-page.e2e.ts (48.672s)
  ● VP - Prep Time details page › [C367697]Verify the "Avg food preparation time" KPI card, insight and details screen details

    page.waitForSelector: Timeout 30000ms exceeded.
    =========================== logs ===========================
    waiting for selector "a[data-testid="prepTime"]" to be visible
      selector resolved to hidden <a data-testid="prepTime" class="sc-hRmvpr fHmWTv" …>…</a>
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      46 |
      47 |   it('[C367697]Verify the "Avg food preparation time" KPI card, insight and details screen details', async () => {
    > 48 |     await page.waitForSelector(prepTimeCard);
         |                ^
      49 |     const hasTrendIcon = await inspectTrendIconExist(page)(prepTimeCard);
      50 |     const kpiCardDetails = await inspectKpiCard(page)(prepTimeCard);
      51 |     expect(kpiCardDetails).toMatchObject({

      at Object.captureStackTrace (../../../node_modules/playwright/lib/utils/stackTrace.js:51:19)
      at Connection.sendMessageToServer (../../../node_modules/playwright/lib/client/connection.js:69:48)
      at Proxy.<anonymous> (../../../node_modules/playwright/lib/client/channelOwner.js:64:61)
      at ../../../node_modules/playwright/lib/client/frame.js:193:42
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:34)
      at Frame.waitForSelector (../../../node_modules/playwright/lib/client/frame.js:188:21)
      at ../../../node_modules/playwright/lib/client/page.js:212:60
      at Page._attributeToPage (../../../node_modules/playwright/lib/client/page.js:202:20)
      at Page.waitForSelector (../../../node_modules/playwright/lib/client/page.js:212:21)
      at tests/vp-plugin/prep-time-details-page.e2e.ts:48:16
      at step (tests/vp-plugin/prep-time-details-page.e2e.ts:52:23)
      at Object.next (tests/vp-plugin/prep-time-details-page.e2e.ts:33:53)
      at tests/vp-plugin/prep-time-details-page.e2e.ts:27:71
      at Object.<anonymous>.__awaiter (tests/vp-plugin/prep-time-details-page.e2e.ts:23:12)
      at Object.<anonymous> (tests/vp-plugin/prep-time-details-page.e2e.ts:47:102)
```

## Hypothesis

Clicking the category on kpi dashboard has not loaded before further verification is done.

All these errors happened when running code in the format:

Setup Code:

```typescriptreact
  beforeAll(async () => {
    await kpiDashboardPageSetup(page, context, env)();
    apiResponse = await fetchKpiData<Computed>(env)(YodaKpiEndpoint.PrepTime);

    // inspect kpi card in dashboard
    await clickCategory(page)(CategoryIdentifier.OperationalMetrics, CategoryAction.Open);
  });
```

Test Case:

```typescriptreact
 it('[C367697]Verify the "Avg food preparation time" KPI card, insight and details screen details', async () => {
    await page.waitForSelector(prepTimeCard);
```

There is no wait in between the clicking of the category and the verification in the test case.

## Possible related failures

- tests/vp-plugin/customer-conversion-all-details-check.e2e.ts:115:14
- tests/vp-plugin/kpi-summary.e2e.ts:8:71

## Resolution

Update in `e2e/actions/vp-plugin/dashboard/index.ts`

### Old Code:

```typescriptreact

/**
 * Click on a category
 * @param categoryNumber this is the category order shown. number starts from 1
 */
export const clickCategory = (page: Page) => async (
  categoryId: CategoryIdentifier,
  action: CategoryAction
) => {
  let category;
  const categorySelector = categorySelectors[categoryId];
  try {
    category = await page.waitForSelector(categorySelector);
  } catch {
    throw new Error(`clickCategory() unable to click category ${categorySelector}`);
  }
  const classes = await category.getAttribute('class');
  const currentCategoryState = classes.includes('Mui-expanded')
    ? CategoryAction.Open
    : CategoryAction.Close;
  if (categoryShouldBeClicked(currentCategoryState, action)) {
    await category.click();
  }
};

```

### New Code:

```typescriptreact

/**
 * Click on a category
 * @param categoryNumber this is the category order shown. number starts from 1
 */
export const clickCategory = (page: Page) => async (
  categoryId: CategoryIdentifier,
  action: CategoryAction
) => {
  let category;
  const categorySelector = categorySelectors[categoryId];
  try {
    category = await page.waitForSelector(categorySelector);
  } catch {
    throw new Error(`clickCategory() unable to click category ${categorySelector}`);
  }
  const classes = await category.getAttribute('class');
  const currentCategoryState = classes.includes('Mui-expanded')
    ? CategoryAction.Open
    : CategoryAction.Close;
  if (categoryShouldBeClicked(currentCategoryState, action)) {
    await category.click();
  }
  await page.waitForLoadState();
};
};

```
