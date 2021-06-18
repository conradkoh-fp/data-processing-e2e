export interface ErrorStat {
  filepath: string;
  count: number;
  runs: {
    [runId: string]: {
      runId: string;
      count: number;
    };
  };
}
