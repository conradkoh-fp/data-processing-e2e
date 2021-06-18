import { table } from "table";
import { RunStat } from "../../domain/entities/RunStat";
import { compareRunErrorsSort } from "./sort";

export function createRunStatsTable(results: RunStat[]) {
  return table([
    [
      "Run ID",
      "Sequence",
      "Error Count\n(webkit)",
      "Error Count\n(chromium)",
      "Failing Tests",
      "Error Lines",
    ],
    ...results.map((f) => [
      f.runId,
      f.seq,
      f.errorCount["webkit"] || 0,
      f.errorCount["chromium"] || 0,
      f.failingTests.map((t) => `${t.browser} - ${t.testPath}`).join("\n"),
      [...f.errorLines]
        .sort(compareRunErrorsSort)
        .map((e) => `${e.filepath} (${e.count} occurrences)`)
        .join("\n"),
    ]),
  ]);
}
