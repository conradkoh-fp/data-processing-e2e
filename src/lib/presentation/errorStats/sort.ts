import { ErrorStat } from "../../domain/entities/ErrorStat";

export function compareErrorStatsSort(a: ErrorStat, b: ErrorStat) {
  const rules = [compareErrorStatsCount];
  return rules.reduce((state, rule) => {
    //Sort not found yet
    if (state == 0) {
      //Set the sorting based on the newest rule
      state = rule(a, b);
    }
    return state;
  }, 0);
}

export function compareErrorStatsCount(a: ErrorStat, b: ErrorStat) {
  if (a.count > b.count) {
    return -1;
  } else if (a.count < b.count) {
    return 1;
  } else {
    return 0;
  }
}
