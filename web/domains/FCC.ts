export abstract class FCC<T> {
  constructor(readonly values: T[]) {}

  *[Symbol.iterator]() {
    for (let i = 0; i < this.values.length; i++) {
      yield this.values[i];
    }
  }

  find<S extends T>(predicate: (this: void, value: T, index: number, obj: T[]) => value is S, thisArg?: any): S | undefined;
  find(predicate: (value: T, index: number, obj: T[]) => unknown, thisArg?: any): T | undefined;
  find(predicate: any, thisArg?: any) {
    return this.values.find(predicate, thisArg);
  }
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[] {
    return this.values.map(callbackfn, thisArg);
  }

  filter<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S, thisArg?: any): S[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown, thisArg?: any): T[];
  filter(predicate: any, thisArg?: any) {
    return this.values.filter(predicate, thisArg);
  }

  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue: T): T;
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
  reduce(callbackfn: any, initialValue?: any) {
    return this.values.reduce(callbackfn, initialValue);
  }
}
