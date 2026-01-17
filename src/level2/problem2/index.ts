export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  /**
   * [
        [[new Date('2020-01-01T00:00:00Z'), new Date('2020-01-01T01:00:00Z')], [new Date('2020-01-02T05:00:00Z'), new Date('2020-01-02T05:30:00Z')]],
        [[new Date('2020-01-01T17:00:00Z'), new Date('2020-01-01T17:45:00Z')]],
      ]
      this is the input from the test from the island, we need to first put them
      into a single array to sort them by flattening all logs. of course, if its empty
      return an empty.
   */

  const allLogs = args.flat();

  /**
   *
   * after flattening, simple doing :
   * allLogs.sort((a, b) => a[0].getTime() - b[0].getTime());
   * return allLogs;
   * would pass the first test, but in the overlap tests, we will see the following:
   *
   * [new Date('2020-01-02T05:00:00Z'), new Date('2020-01-02T05:30:00Z')]]
   * [new Date('2020-01-02T05:20:00Z'), new Date('2020-01-02T06:10:00Z')]]
   *
   * it should return [new Date('2020-01-02T05:00:00Z'), new Date('2020-01-02T06:10:00Z')]
   * but sorting them would return two tuples. so we need to create two variables,
   * the container for the merged logs and two reassignable variables to merge them
   */

  allLogs.sort((a, b) => a[0].getTime() - b[0].getTime());
  const merged: DowntimeLogs = [];
  let [currentStart, currentEnd] = allLogs[0];

  /**
   * so since we already sorted it out, we can easily find overlaps
   * by comparing the current start and end to the next start and end.
   * if the next start if earlier or same time as the current end of downtime,
   * it makes sense to merge them together. iterate alllogs with a for loop
   * and if it doesnt overlap, just push the current tuple into the merged list
   * and update the current start and end to handle the next overlaps.
   */


  for (let i = 1; i < allLogs.length; i++) {
    const [nextStart, nextEnd] = allLogs[i];
    if (nextStart.getTime() <= currentEnd.getTime()) {
      currentEnd = nextEnd;
    } else {
      merged.push([currentStart, currentEnd]);
      [currentStart, currentEnd] = [nextStart, nextEnd];
    }
  }
  // since we started at index 1 because we already assigned
  // the ones at index0 by declaring of current end and start,
  // we have a leftover so we push them
  merged.push([currentStart, currentEnd]);

  return merged;
}
