export async function testD1Connection(env: { DB: { prepare: (query: string) => { first<T = unknown>(): Promise<T | null>; }; }; }) {
  try {
    await env.DB.prepare('SELECT 1').first();
    return true;
  }
  catch {
    return false;
  }
}
