import { RunErrorStat } from "../../domain/entities/RunErrorStat";
import { RunStat } from "../../domain/entities/RunStat";
export function compareRunStatsSort(a: RunStat, b: RunStat) {
  if (a.seq > b.seq) {
    return 1;
  } else if (a.seq < b.seq) {
    return -1;
  }
  return 0;
}

export function compareRunErrorsSort(a: RunErrorStat, b: RunErrorStat) {
  if (a.count > b.count) {
    return -1;
  } else if (a.count < b.count) {
    return 1;
  } else {
    return 0;
  }
}
