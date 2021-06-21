Run test 20 times locally

```
seq 1 20 | xargs -I{} sh -c "yarn e2e:local > /Users/c.koh.3/Downloads/e2e_results/e2e_run_{}.txt 2>&1"
```

Run test 20 times on staging

```
seq 1 20 | xargs -I{} sh -c "E2E_TEST_PASSWORD=foodpanda1 yarn e2e:staging > /Users/c.koh.3/Downloads/e2e_results/data/e2e_staging/e2e_run_{}.txt 2>&1"
```

Debug 60 times on locally with tracing

```
mkdir -p /Users/c.koh.3/Downloads/e2e_results/data/e2e_local && seq 1 60 | xargs -I{} sh -c "RUN_ID={} yarn e2e:local > /Users/c.koh.3/Downloads/e2e_results/data/e2e_local/e2e_run_{}.txt 2>&1"
```

Debug 20 times on locally with tracing

```
mkdir -p /Users/c.koh.3/Downloads/e2e_results/data/e2e_local && seq 1 20 | xargs -I{} sh -c "RUN_ID={} yarn e2e:local > /Users/c.koh.3/Downloads/e2e_results/data/e2e_local/e2e_run_{}.txt 2>&1"
```

Debug 20 times on a single test with tracing

```
mkdir -p /Users/c.koh.3/Downloads/e2e_results/data/e2e_local_single && seq 1 20 | xargs -I{} sh -c "RUN_ID={} yarn e2e:local_single e2e/tests/vp-plugin/customer-conversion-all-details-check.e2e.ts > /Users/c.koh.3/Downloads/e2e_results/data/e2e_local_single/e2e_run_{}.txt 2>&1"
```

Debug 40 times on a single test in parallel with tracing

```
mkdir -p /Users/c.koh.3/Downloads/e2e_results/data/e2e_local_single && seq 1 20 | xargs -P -I{} sh -c "RUN_ID={} yarn e2e:local_single e2e/tests/vp-plugin/customer-conversion-all-details-check.e2e.ts > /Users/c.koh.3/Downloads/e2e_results/data/e2e_local_single/e2e_run_{}.txt 2>&1"
```
