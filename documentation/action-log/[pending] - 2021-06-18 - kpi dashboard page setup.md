## Error Log

```
FAIL browser: webkit e2e/tests/vp-plugin/deal-utilization-card-and-details.e2e.ts (76s)
  ● VP - Deal Utilization card and details page › [C457064]Verify pandaPromo utilization card and table details

    page.waitForSelector: Timeout 30000ms exceeded.
    =========================== logs ===========================
    waiting for selector "[data-testid="pr-vfd-sc"]" to be visible
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      57 |   cardSelector: string
      58 | ): Promise<DealUtilizationCardInformation> => {
    > 59 |   await page.waitForSelector(cardSelector);
         |              ^
      60 |
      61 |   const title = await page.innerText(
      62 |     `${cardSelector} ${DealsUtilizationSummaryCard.dealSummaryTitle}`

      at Object.captureStackTrace (../../../node_modules/playwright/lib/utils/stackTrace.js:51:19)
      at Connection.sendMessageToServer (../../../node_modules/playwright/lib/client/connection.js:69:48)
      at Proxy.<anonymous> (../../../node_modules/playwright/lib/client/channelOwner.js:64:61)
      at ../../../node_modules/playwright/lib/client/frame.js:193:42
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:34)
      at Frame.waitForSelector (../../../node_modules/playwright/lib/client/frame.js:188:21)
      at ../../../node_modules/playwright/lib/client/page.js:212:60
      at Page._attributeToPage (../../../node_modules/playwright/lib/client/page.js:202:20)
      at Page.waitForSelector (../../../node_modules/playwright/lib/client/page.js:212:21)
      at actions/vp-plugin/kpi-details/index.ts:59:14
      at step (actions/vp-plugin/kpi-details/index.ts:33:23)
      at Object.next (actions/vp-plugin/kpi-details/index.ts:14:53)
      at actions/vp-plugin/kpi-details/index.ts:8:71
      at Object.<anonymous>.__awaiter (actions/vp-plugin/kpi-details/index.ts:4:12)
      at actions/vp-plugin/kpi-details/index.ts:57:23
      at tests/vp-plugin/deal-utilization-card-and-details.e2e.ts:113:67
      at step (tests/vp-plugin/deal-utilization-card-and-details.e2e.ts:63:23)
      at Object.next (tests/vp-plugin/deal-utilization-card-and-details.e2e.ts:44:53)
      at fulfilled (tests/vp-plugin/deal-utilization-card-and-details.e2e.ts:35:58)
```

## Hypothesis

Clicking the card for the kpi dashboard has not loaded before further verification is done

## Resolution

Update in `e2e/setup/vp-plugin/dashboard.ts`

## Possible related failures

- tests/vp-plugin/kpi-summary.e2e.ts:46:16
- tests/vp-plugin/deal-utilization-card-and-details.e2e.ts:113:67
- tests/vp-plugin/prep-time-details-page.e2e.ts:48:16

### Old Code:

```typescriptreact
/**
 * Page setup for vp dashboard
 * @param page
 * @param context
 * @param env
 */
export const kpiDashboardPageSetup = (page: Page, context: BrowserContext, env: Env) => async (
  opts?: KpiDashboardPageSetupOptions
) => {
  const vendorFixture = getVendorFixture(env)();
  const { globalEntityId } = vendorFixture;
  const { user } = getTestConfiguration({ env, globalEntityId, accountType: opts?.accountType });
  let { from, to } = kpiDateRange;
  if (opts?.startDate && opts?.endDate) {
    from = opts.startDate;
    to = opts.endDate;
  }
  //Perform login actions
  await userLogin(page, context, env)(user.username, user.password, {
    redirectUrl: `/vendor-performance?from=${from}&to=${to}&vh-select=current&curdate=${kpiCurDate}`,
  });

  //Ensure that the page has completed loading
  await page.waitForLoadState('domcontentloaded');
};

```

### New Code:

```typescriptreact
/**
 * Page setup for vp dashboard
 * @param page
 * @param context
 * @param env
 */
export const kpiDashboardPageSetup = (page: Page, context: BrowserContext, env: Env) => async (
  opts?: KpiDashboardPageSetupOptions
) => {
  const vendorFixture = getVendorFixture(env)();
  const { globalEntityId } = vendorFixture;
  const { user } = getTestConfiguration({ env, globalEntityId, accountType: opts?.accountType });
  let { from, to } = kpiDateRange;
  if (opts?.startDate && opts?.endDate) {
    from = opts.startDate;
    to = opts.endDate;
  }
  //Perform login actions
  await userLogin(page, context, env)(user.username, user.password, {
    redirectUrl: `/vendor-performance?from=${from}&to=${to}&vh-select=current&curdate=${kpiCurDate}`,
  });

  //Ensure that the page has completed loading
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  await page.waitForLoadState('domcontentloaded');
};

```
