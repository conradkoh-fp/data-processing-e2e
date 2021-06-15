import { TestStat } from "../../domain/entities/TestStat";

export function compareTestStatsSort(a: TestStat, b: TestStat) {
  const rules = [compareTestStatsFailCount, compareTestStatsAvgDuration];
  return rules.reduce((state, rule) => {
    //Sort not found yet
    if (state == 0) {
      //Set the sorting based on the newest rule
      state = rule(a, b);
    }
    return state;
  }, 0);
}

export function compareTestStatsAvgDuration(a: TestStat, b: TestStat) {
  if (a.duration.average > b.duration.average) {
    return -1;
  } else if (a.duration.average < b.duration.average) {
    return 1;
  } else {
    return 0;
  }
}

export function compareTestStatsFailCount(a: TestStat, b: TestStat) {
  if (a.count.failed > b.count.failed) {
    return -1;
  } else if (a.count.failed < b.count.failed) {
    return 1;
  } else {
    return 0;
  }
}
