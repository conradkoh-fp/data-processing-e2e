Run test 20 times locally

```
seq 1 20 | xargs -I{} sh -c "yarn e2e:local > /Users/c.koh.3/Downloads/e2e_results/e2e_run_{}.txt 2>&1"
```

Run test 20 times on staging

```
seq 1 20 | xargs -I{} sh -c "E2E_TEST_PASSWORD=foodpanda1 yarn e2e:staging > /Users/c.koh.3/Downloads/e2e_results/data/e2e_staging/e2e_run_{}.txt 2>&1"
```
