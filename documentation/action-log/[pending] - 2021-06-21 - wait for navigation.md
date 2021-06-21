## Error Log

```
FAIL browser: webkit e2e/tests/vp-plugin/customer-conversion-all-details-check.e2e.ts (70.359s)
  ● VP - Customer Conversion Individual details page check › [C682218]Verify "Customer conversion-Entered your store" funnel graph details

    TimeoutError: page.waitForNavigation: Timeout 30000ms exceeded.
    =========================== logs ===========================
    waiting for navigation until "networkidle"
    ============================================================
    Note: use DEBUG=pw:api environment variable to capture Playwright logs.

      at ../../../node_modules/playwright/lib/client/waiter.js:49:51
      at Waiter.waitForPromise (../../../node_modules/playwright/lib/client/waiter.js:62:28)
      at ../../../node_modules/playwright/lib/client/frame.js:120:36
      at Frame._wrapApiCall (../../../node_modules/playwright/lib/client/channelOwner.js:77:28)
          at async Promise.all (index 0)
```

## Hypothesis

Navigation could be attempted at a time where the page is not ready to be navigated, for whatever reason.

This is also experienced in the login action which affects VFD as well as seen in the logs of `data/1624261065445_e2e_staging/e2e_run_11.txt`

Another issue is that wait for navigation does not seem to nicely preserve the stack trace for some reason. Hopefully catching catching and rethrowing errors will properly preserve the stack trace.

## Resolution

Add a retry mechanism

## Possible related failures

- e2e/tests/vp-plugin/customer-conversion-all-details-check.e2e.ts
- e2e/tests/vp-plugin/order-revenue-loss-card-and-details.e2e.ts
- e2e/tests/vp-plugin/accept-time-details-page.e2e.ts

### Old Code:

```typescriptreact
await Promise.all([
  page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
  card.click(),
]);
```

### New Code:

```typescriptreact
try {
  retry(
    async () => {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
        card.click(),
      ]);
      return true;
    },
    { maxExecutionTime: 30000, retryInterval: 0 }
  );
} catch (err) {
  throw new Error('Failed to navigate after card selector click: ' + `'${cardSelector}'`);
}
```
