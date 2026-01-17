export class ExecutionCache<TInputs extends Array<unknown>, TOutput> {
  private promiseCache = new Map<string, Promise<TOutput>>();
  constructor(
    private readonly handler: (...args: TInputs) => Promise<TOutput>
  ) {}

  async fire(key: string, ...args: TInputs): Promise<TOutput> {
    /**
     * Im creating now a private cache above the constructor
     * to hold the string as the unique key for an execution
     * and the promise. Now we first check if an execution is
     * already being fired.
     */
    const existing = this.promiseCache.get(key);
    if (existing){
       return existing;
    }

     /**
     * If it goes here, then this should be the first execution
     * we then the handler will process ...args, and while we wait
     * for the promise to finish, we add it first to the cache to avoid
     * multiple handler(...args) for same execution key due to the time
     * needed to finish the result
     */

    const promise = this.handler(...args);
    this.promiseCache.set(key, promise);
    // we then return the result for each key
    return await promise;

  }
}
