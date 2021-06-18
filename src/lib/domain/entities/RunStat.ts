import { RunErrorStat } from "./RunErrorStat";

export interface RunStat {
  runId: string;
  seq: number;
  errorCount: { [browserType: string]: number };
  failingTests: {
    browser: string;
    testPath: string;
  }[];
  errorLines: RunErrorStat[];
}
