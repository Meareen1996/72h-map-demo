import _ from "lodash";

export const compareJsonArrays  = (arr1, arr2) => {
  // 先通过 _.sortBy 方法排序，然后用 _.isEqual 方法进行深度比较
  return _.isEqual(
    _.sortBy([...arr1], ['lat', 'lng']),
    _.sortBy([...arr2], ['lat', 'lng'])
  );
};
