import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import { table } from "table";
(async function main() {
  const testEnv = TestEnv.Local;
  const mode = "override";
  const testRunPrefix = mode == "override" ? "" : new Date().getTime() + "";
  //Create all folders required
  const outFolder = path.join(__dirname, "../out");
  const dirroot = path.join(__dirname, "../data", dataFolder(testEnv));
  await Promise.all([mkdirp(outFolder), mkdirp(dirroot)]);
  const outFile = path.join(
    outFolder,
    testRunPrefix + "_" + dataFolder(testEnv) + ".txt"
  );
  //Get files to be parsed
  const files = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(dirroot, { withFileTypes: true }, (err, files) => {
      err ? reject(err) : resolve(files.map((v) => v.name));
    });
  });
  const stats: StatsState = {};
  for (const file of files) {
    const filepath = path.join(dirroot, file);
    await collectStats(filepath, stats);
  }
  const vals = Object.values(stats);
  const results = vals.sort(compareStatsSort);
  const topFails = results.slice(0, 5);
  topFails.forEach((f) => console.log(formatTestStat(f)));

  //Format and write to file
  await new Promise<void>((resolve, reject) => {
    let content = topFails.map((f) => formatTestStat(f)).join("\n");
    content += "\n";
    content += "\n";
    content += table([
      [
        "Browser",
        "Path",
        "Duration (avg)",
        "Duration (total)",
        "Count (passed)",
        "Count (failed)",
        "Count (total)",
      ],
      ...results.map((f) => [
        f.browser,
        f.path + "",
        formatDuration(f.duration.average),
        formatDuration(f.duration.total),
        f.count.passed,
        f.count.failed,
        f.count.total,
      ]),
    ]);
    fs.writeFile(outFile, content, {}, (err) => {
      err ? reject(err) : resolve();
    });
  });
})();

function compareStatsSort(a: TestStat, b: TestStat) {
  const rules = [compareStatsFailCount, compareStatsAvgDuration];
  return rules.reduce((state, rule) => {
    //Sort not found yet
    if (state == 0) {
      //Set the sorting based on the newest rule
      state = rule(a, b);
    }
    return state;
  }, 0);
}
function compareStatsAvgDuration(a: TestStat, b: TestStat) {
  if (a.duration.average > b.duration.average) {
    return -1;
  } else if (a.duration.average < b.duration.average) {
    return 1;
  } else {
    return 0;
  }
}

function compareStatsFailCount(a: TestStat, b: TestStat) {
  if (a.count.failed > b.count.failed) {
    return -1;
  } else if (a.count.failed < b.count.failed) {
    return 1;
  } else {
    return 0;
  }
}

enum TestEnv {
  Local = "local",
  Staging = "staging",
}

function dataFolder(e: TestEnv) {
  return e === TestEnv.Local ? "e2e_local" : "e2e_staging";
}

function formatTestStat(t: TestStat): string {
  return `[${t.browser}] ${t.path} | Duration: Avg (${formatDuration(
    t.duration.average
  )}), Total (${formatDuration(t.duration.total)}) | Count: Passed (${
    t.count.passed
  }, Failed (${t.count.failed}), Total (${t.count.total}))`;
}

function formatDuration(t: number) {
  return (t / 1000).toFixed(2) + "s";
}

async function collectStats(filePath: string, state: StatsState) {
  const fileContent = await new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
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
        addStat(data, state);
      } else {
        console.log({ match, parsedContent });
        throw new Error("Failed to parse: " + match);
      }
    }
  }
}

function addStat(test: Test, state: StatsState) {
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

type StatsState = { [key: string]: TestStat };
interface Test {
  passed: boolean;
  browser: string;
  path: string;
  duration: number;
}
const testAggKey = (t: Test): string => `${t.browser}+${t.path}`;
interface TestStat {
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
