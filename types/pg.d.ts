// Minimal ambient module declaration to satisfy TypeScript in production builds
declare module 'pg' {
  export class Pool {
    constructor(config?: any)
    query: (...args: any[]) => any
  }
  export type PoolClient = any
}
