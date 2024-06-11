export function uniqWith<T>(arr: T[], fn: (a: T, b: T) => boolean) {
  return arr.filter(
    (element, index) => arr.findIndex((step) => fn(element, step)) === index,
  );
}
