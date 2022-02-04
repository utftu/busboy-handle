export function skipStream(stream): Promise<void> {
  return new Promise((resolve) => {
    stream.on('end', resolve);
    stream.on('data', () => {
      stream.resume();
    });
  });
}

type Resolve<T> = {
  (prop: T): void;
};
type Reject<E> = {
  (props?: E): void;
};
export type ControlledPromise<T, E = void> = Promise<T> & {
  resolve: Resolve<T>;
  reject: Reject<E>;
};
export function createPromise<T = void, E = any>(
  callback: (resolve: Resolve<T>, reject: Reject<E>) => any
): ControlledPromise<T, E> {
  let promiseResolve: Resolve<T> = null;
  let promiseReject: Reject<E> = null;
  const promise = new Promise<T>((resolve, reject) => {
    promiseResolve = resolve;
    promiseReject = reject;
    callback(resolve, reject);
  }) as ControlledPromise<T, E>;
  // @ts-ignore
  promise.resolve = promiseResolve;
  // @ts-ignore
  promise.reject = promiseReject as Reject;
  return promise;
}

export const noop: any = () => {};
