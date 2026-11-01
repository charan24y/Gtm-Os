declare module "@tiny-fish/sdk" {
  export class TinyFish {
    constructor(options: { apiKey: string });
    fetch: {
      getContents(params: { urls: string[] }): Promise<{
        results?: Array<{
          title?: string;
          description?: string;
          text?: string;
          markdown?: string;
          latency_ms?: number;
          url?: string;
          final_url?: string;
        }>;
      }>;
    };
    search: {
      query(params: { query: string }): Promise<{
        results?: Array<{
          title: string;
          url: string;
          snippet: string;
          position?: number;
          site_name?: string;
          date?: string;
        }>;
      }>;
    };
    agent: {
      run(params: { url: string; goal: string }): Promise<{
        streaming_url?: string;
        result?: unknown;
      }>;
    };
    research: {
      run(params: unknown): Promise<unknown>;
    };
  }
}
