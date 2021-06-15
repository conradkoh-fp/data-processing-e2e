import { table } from "table";
import { TestStat } from "../../domain/entities/TestStat";
import { formatDuration } from "./format";

export function createTestStatsTable(results: TestStat[]) {
  return table([
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
}
