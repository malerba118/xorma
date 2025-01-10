export const dereference = <T>(data: T) => {
  return JSON.parse(JSON.stringify(data));
};

// Helper function for deep equality comparison
export const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;
  if (obj1 === null || obj2 === null) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!isDeepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
};

export function mapValues<T, U>(
  obj: { [K in keyof T]: T[K] },
  mapper: (value: T[keyof T], key: keyof T) => U
): { [K in keyof T]: U } {
  const result: Partial<{ [K in keyof T]: U }> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = mapper(obj[key], key);
    }
  }
  return result as { [K in keyof T]: U };
}
