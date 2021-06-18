import fs from "fs";
import { ErrorStat } from "./domain/entities/ErrorStat";
import { RunStat } from "./domain/entities/RunStat";
import { Test } from "./domain/entities/Test";
import { TestError } from "./domain/entities/TestError";
import { TestStat } from "./domain/entities/TestStat";
import { TestEnv } from "./env";
import { formatDuration } from "./presentation/testStats/format";
import path from "path";
import { RunErrorStat } from "./domain/entities/RunErrorStat";
export function dataFolder(e: TestEnv) {
  return e === TestEnv.Local ? "e2e_local" : "e2e_staging";
}

export function formatTestStat(t: TestStat): string {
  return `[${t.browser}] ${t.path} | Duration: Avg (${formatDuration(
    t.duration.average
  )}), Total (${formatDuration(t.duration.total)}) | Count: Passed (${
    t.count.passed
  }, Failed (${t.count.failed}), Total (${t.count.total}))`;
}

export async function collectStats(filePath: string, state: StatsState) {
  const fileContent = await new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
  const pathParsed = path.parse(filePath);
  const runId = `${pathParsed.name}`;
  collectTestStats(runId, fileContent, state.test);
  collectErrorStats(runId, fileContent, state.errors);
  collectRunStats(runId, fileContent, state.runs);
}

function collectRunStats(
  runId: string,
  fileContent: string,
  state: RunsStatsState
) {
  const seqRegex = /e2e_run_(\d+)/g;
  const matches = seqRegex.exec(runId);
  if (!matches) {
    throw new Error("Failed to get match from run id: " + runId);
  }
  const seq = parseInt(matches[1]);
  const tests = parseTestResults(runId, fileContent);
  const runStat: RunStat = tests.reduce(
    (state, test) => {
      if (!test.passed) {
        if (!state.errorCount[test.browser]) {
          state.errorCount[test.browser] = 0;
        }
        state.errorCount[test.browser] += 1;
        state.failingTests.push({
          browser: test.browser,
          testPath: test.path,
        });
      }
      return state;
    },
    {
      runId,
      seq,
      errorCount: {},
      failingTests: [],
      errorLines: Object.values(
        parseErrorStats(runId, fileContent).reduce<{
          [filePath: string]: RunErrorStat;
        }>((state, error) => {
          if (!state[error.filepath]) {
            state[error.filepath] = {
              filepath: error.filepath,
              count: 0,
            };
          }
          state[error.filepath].count++;
          return state;
        }, {})
      ),
    } as RunStat
  );
  state[runId] = runStat;
}

function collectErrorStats(
  runId: string,
  fileContent: string,
  state: ErrorStatsState
) {
  const data = parseErrorStats(runId, fileContent);
  data.forEach((t) => addErrorStatToState(t, state));
}

function parseErrorStats(runId: string, fileContent: string): TestError[] {
  const testErrors: TestError[] = [];
  const extractMatcher = new RegExp("at (.+\\.ts:\\d+:\\d+\\))", "g");
  const matches = fileContent.match(extractMatcher);
  if (matches) {
    for (const match of matches) {
      const newMatcher = new RegExp(extractMatcher);
      const parsedContent = newMatcher.exec(match);
      if (parsedContent) {
        const data: TestError = {
          filepath: parsedContent[1],
          runId,
        };
        testErrors.push(data);
      } else {
        throw new Error("Failed to parse content: " + match);
      }
    }
  }
  return testErrors;
}

function addErrorStatToState(data: TestError, state: ErrorStatsState) {
  const key = testErrorAggKey(data);
  if (!state[key]) {
    state[key] = {
      filepath: data.filepath,
      count: 0,
      runs: {},
    };
  }
  if (!state[key].runs[data.runId]) {
    state[key].runs[data.runId] = {
      runId: data.runId,
      count: 0,
    };
  }
  state[key].count += 1;
  state[key].runs[data.runId].count += 1;
}

function testErrorAggKey(d: TestError) {
  return `${d.filepath}`;
}

function collectTestStats(
  runId: string,
  fileContent: string,
  state: TestStatsState
) {
  const tests = parseTestResults(runId, fileContent);
  tests.forEach((t) => addTestStatToState(t, state));
}

function parseTestResults(runId: string, fileContent: string) {
  const extractMatcher = new RegExp(
    "(PASS|FAIL) browser: (chromium|webkit) (.+) \\(([0-9\\.]+)s\\)",
    "g"
  );
  const matches = fileContent.match(extractMatcher);
  const results: Test[] = [];

  if (matches) {
    for (const match of matches) {
      const newMatcher = new RegExp(extractMatcher);
      const parsedContent = newMatcher.exec(match);
      if (parsedContent) {
        const data: Test = {
          runId,
          passed: parsedContent[1] == "PASS",
          browser: parsedContent[2],
          path: parsedContent[3],
          duration: parseFloat(parsedContent[4]) * 1000,
        };
        //assertions
        if (!isFinite(data.duration)) {
          throw new Error("Invalid duration detected: " + parsedContent[4]);
        }
        results.push(data);
      } else {
        throw new Error("Failed to parse: " + match);
      }
    }
  }
  return results;
}

export function addTestStatToState(test: Test, state: TestStatsState) {
  const aggKey = testAggKey(test);
  if (!state[aggKey]) {
    state[aggKey] = {
      browser: test.browser,
      path: test.path,
      count: {
        passed: 0,
        failed: 0,
        total: 0,
      },
      duration: {
        total: 0,
        average: 0,
      },
    };
  }

  //Update count
  const selectedCountGroup = test.passed ? "passed" : "failed";
  state[aggKey].count[selectedCountGroup] += 1;
  state[aggKey].count.total =
    state[aggKey].count.passed + state[aggKey].count.failed;

  //Update duration
  state[aggKey].duration.total += test.duration;
  state[aggKey].duration.average =
    state[aggKey].duration.total / state[aggKey].count.total;
}
export type StatsState = {
  test: TestStatsState;
  errors: ErrorStatsState;
  runs: RunsStatsState;
};

export type TestStatsState = { [key: string]: TestStat };
export type ErrorStatsState = { [key: string]: ErrorStat };
export type RunsStatsState = { [key: string]: RunStat };

export const testAggKey = (t: Test): string => `${t.browser}+${t.path}`;
