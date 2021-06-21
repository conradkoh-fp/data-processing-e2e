import fs from "fs";
import path from "path";
import { collectStats, formatTestStat, StatsState } from "./lib";
import { createTestStatsTable } from "./lib/presentation/testStats/table";
import { compareTestStatsSort } from "./lib/presentation/testStats/sort";
import { createTestErrorStatsTable } from "./lib/presentation/errorStats/table";
import { compareErrorStatsSort } from "./lib/presentation/errorStats/sort";
import { createRunStatsTable } from "./lib/presentation/runStats/table";
import { compareRunStatsSort } from "./lib/presentation/runStats/sort";
import { Mode } from "./Mode";
import { setup } from "./setup";

(async function main() {
  let { sourceFolder, outFile } = await setup({
    mode: Mode.Archive,
    options: {
      runName: "e2e_local", //Override for when reprocessing
    },
  });
  //Get files to be parsed
  const files = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(sourceFolder, { withFileTypes: true }, (err, files) => {
      err ? reject(err) : resolve(files.map((v) => v.name));
    });
  });
  const stats: StatsState = {
    test: {},
    errors: {},
    runs: {},
  };
  for (const file of files) {
    const filepath = path.join(sourceFolder, file);
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

    content += "\n";
    content += "\n";
    content += `Run Stats:\n`;
    content += createRunStatsTable(
      Object.values(stats.runs).sort(compareRunStatsSort)
    );
    fs.writeFile(outFile, content, {}, (err) => {
      err ? reject(err) : resolve();
    });
  });
})();
