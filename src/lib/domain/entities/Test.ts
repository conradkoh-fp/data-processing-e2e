export interface Test {
  runId: string;
  passed: boolean;
  browser: string;
  path: string;
  duration: number;
}
