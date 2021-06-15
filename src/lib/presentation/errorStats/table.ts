import { table } from "table";
import { ErrorStat } from "../../domain/entities/ErrorStat";

export function createTestErrorStatsTable(results: ErrorStat[]) {
  return table([
    ["Path", "Count"],
    ...results.map((s) => [s.filepath, s.count]),
  ]);
}
