export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-TW');
}

export function formatName(firstName: string, lastName: string): string {
  return `${capitalize(firstName)} ${capitalize(lastName)}`;
}

// Array utilities
export function isEmpty<T>(array: T[]): boolean {
  return array.length === 0;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

// Object utilities
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function sayGoodbye(name: string): string {
  return `Goodbye ${name}`;
}

// String utilities
export function sayHello(name: string): string {
  return `Hello ${name}`;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}
