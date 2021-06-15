export interface TestStat {
  browser: string;
  path: string;
  count: {
    passed: number;
    failed: number;
    total: number;
  };
  duration: {
    total: number;
    average: number;
  };
}
