/** Process-local cache: collapse concurrent misses, bound stale fallback and retry load. */
export class RequestCache<T> {
  private entry: { data: T; timestamp: number } | null = null;
  private pending: Promise<{ data: T; timestamp: number; stale: boolean }> | null = null;
  private retryAfter = 0;

  private ttl: number;
  private maxAge: number;
  private load: () => Promise<T>;

  constructor(ttl: number, maxAge: number, load: () => Promise<T>) {
    this.ttl = ttl; this.maxAge = maxAge; this.load = load;
  }

  async get(): Promise<{ data: T; timestamp: number; stale: boolean }> {
    const age = this.entry ? Date.now() - this.entry.timestamp : Infinity;
    if (this.entry && age < this.ttl) return { ...this.entry, stale: false };
    if (this.entry && age < this.maxAge && Date.now() < this.retryAfter) return { ...this.entry, stale: true };
    if (this.pending) return this.pending;
    this.pending = this.load().then(data => {
      this.entry = { data, timestamp: Date.now() };
      this.retryAfter = 0;
      return { ...this.entry, stale: false };
    }).catch(error => {
      this.retryAfter = Date.now() + 5000;
      if (this.entry && Date.now() - this.entry.timestamp < this.maxAge) return { ...this.entry, stale: true };
      throw error;
    }).finally(() => { this.pending = null; });
    return this.pending;
  }
}
