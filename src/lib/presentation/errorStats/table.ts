import { table } from "table";
import { ErrorStat } from "../../domain/entities/ErrorStat";

export function createTestErrorStatsTable(results: ErrorStat[]) {
  return table([
    ["Path", "Count", "Occurred in Runs"],
    ...results.map((s) => [
      s.filepath,
      s.count,
      Object.values(s.runs)
        .map((r) => `${r.runId} (${r.count})`)
        .join("\n"),
    ]),
  ]);
}
