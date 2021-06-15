import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import {
  dataFolder,
  TestStatsState,
  collectStats,
  formatTestStat,
  StatsState,
} from "./lib";
import { createTestStatsTable } from "./lib/presentation/testStats/table";
import { TestEnv } from "./lib/env";
import { compareTestStatsSort } from "./lib/presentation/testStats/sort";
import { createTestErrorStatsTable } from "./lib/presentation/errorStats/table";
import { compareErrorStatsSort } from "./lib/presentation/errorStats/sort";
(async function main() {
  const testEnv = TestEnv.Local;
  const mode = "override";
  const testRunPrefix = mode == "override" ? "" : new Date().getTime() + "_";
  //Create all folders required
  const outFolder = path.join(__dirname, "../out");
  const dirroot = path.join(__dirname, "../data", dataFolder(testEnv));
  await Promise.all([mkdirp(outFolder), mkdirp(dirroot)]);
  const outFile = path.join(
    outFolder,
    testRunPrefix + dataFolder(testEnv) + ".txt"
  );
  //Get files to be parsed
  const files = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(dirroot, { withFileTypes: true }, (err, files) => {
      err ? reject(err) : resolve(files.map((v) => v.name));
    });
  });
  const stats: StatsState = {
    test: {},
    errors: {},
  };
  for (const file of files) {
    const filepath = path.join(dirroot, file);
    await collectStats(filepath, stats);
  }

  //Format and write to file
  await new Promise<void>((resolve, reject) => {
    const testVals = Object.values(stats.test);
    const testStatsResults = testVals.sort(compareTestStatsSort);
    const topFails = testStatsResults.slice(0, 5);
    topFails.forEach((f) => console.log(formatTestStat(f)));
    let content = topFails.map((f) => formatTestStat(f)).join("\n");
    content += "\n";
    content += "\n";
    content += `Test Stats:\n`;
    content += createTestStatsTable(testStatsResults);

    content += "\n";
    content += "\n";
    content += `Error Stats:\n`;
    content += createTestErrorStatsTable(
      Object.values(stats.errors).sort(compareErrorStatsSort)
    );
    fs.writeFile(outFile, content, {}, (err) => {
      err ? reject(err) : resolve();
    });
  });
})();
