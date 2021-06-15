import fs from "fs";
import { ErrorStat } from "./domain/entities/ErrorStat";
import { Test } from "./domain/entities/Test";
import { TestError } from "./domain/entities/TestError";
import { TestStat } from "./domain/entities/TestStat";
import { TestEnv } from "./env";
import { formatDuration } from "./presentation/testStats/format";

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
  collectTestStats(fileContent, state.test);
  collectErrorStats(fileContent, state.errors);
}

function collectErrorStats(fileContent: string, state: ErrorStatsState) {
  const extractMatcher = new RegExp("at (.+\\.ts:\\d+:\\d+)", "g");
  const matches = fileContent.match(extractMatcher);
  if (matches) {
    for (const match of matches) {
      const newMatcher = new RegExp(extractMatcher);
      const parsedContent = newMatcher.exec(match);
      if (parsedContent) {
        const data: TestError = {
          filepath: parsedContent[1],
        };
        addErrorStatToState(data, state);
      } else {
        throw new Error("Failed to parse content: " + match);
      }
    }
  }
}

function addErrorStatToState(data: TestError, state: ErrorStatsState) {
  const key = testErrorAggKey(data);
  if (!state[key]) {
    state[key] = {
      filepath: data.filepath,
      count: 0,
    };
  }
  state[key].count += 1;
}

function testErrorAggKey(d: TestError) {
  return `${d.filepath}`;
}

function collectTestStats(fileContent: string, state: TestStatsState) {
  const extractMatcher = new RegExp(
    "(PASS|FAIL) browser: (chromium|webkit) (.+) \\(([0-9\\.]+)s\\)",
    "g"
  );
  const matches = fileContent.match(extractMatcher);

  if (matches) {
    for (const match of matches) {
      const newMatcher = new RegExp(extractMatcher);
      const parsedContent = newMatcher.exec(match);
      if (parsedContent) {
        const data = {
          passed: parsedContent[1] == "PASS",
          browser: parsedContent[2],
          path: parsedContent[3],
          duration: parseFloat(parsedContent[4]) * 1000,
        };
        //assertions
        if (!isFinite(data.duration)) {
          throw new Error("Invalid duration detected: " + parsedContent[4]);
        }
        addTestStatToState(data, state);
      } else {
        throw new Error("Failed to parse: " + match);
      }
    }
  }
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
};

export type TestStatsState = { [key: string]: TestStat };
export type ErrorStatsState = { [key: string]: ErrorStat };

export const testAggKey = (t: Test): string => `${t.browser}+${t.path}`;
