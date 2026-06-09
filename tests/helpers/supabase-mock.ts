import { vi } from "vitest";

type Row = Record<string, unknown>;

type TableFilter = {
  column: string;
  value: unknown;
};

type QueryResult = { data: unknown; error: unknown };

function matchesFilters(row: Row, filters: TableFilter[]): boolean {
  return filters.every((f) => row[f.column] === f.value);
}

function createQueryBuilder(
  rows: Row[],
  onInsert?: (row: Row) => void,
): Record<string, unknown> {
  const filters: TableFilter[] = [];
  let selectColumns: string[] | null = null;
  let orderAsc = true;
  let limitCount: number | null = null;

  const exec = async (): Promise<QueryResult> => {
    let result = rows.filter((row) => matchesFilters(row, filters));

    if (limitCount !== null) {
      result = orderAsc ? result.slice(0, limitCount) : result.slice(-limitCount);
    }

    if (selectColumns) {
      result = result.map((row) => {
        const picked: Row = {};
        for (const col of selectColumns!) {
          if (col in row) picked[col] = row[col];
        }
        return picked;
      });
    }

    if (limitCount === 1) {
      return { data: result[0] ?? null, error: null };
    }

    return { data: result, error: null };
  };

  const builder: Record<string, unknown> = {};

  builder.select = vi.fn((cols?: string) => {
    if (cols) {
      selectColumns = cols.split(",").map((c) => c.trim().split("(")[0]!.trim());
    }
    return builder;
  });
  builder.eq = vi.fn((column: string, value: unknown) => {
    filters.push({ column, value });
    return builder;
  });
  builder.or = vi.fn(() => builder);
  builder.order = vi.fn((_column: string, opts?: { ascending?: boolean }) => {
    orderAsc = opts?.ascending !== false;
    return builder;
  });
  builder.limit = vi.fn((n: number) => {
    limitCount = n;
    return builder;
  });
  builder.maybeSingle = vi.fn(async () => {
    const result = await exec();
    if (Array.isArray(result.data)) {
      return { data: result.data[0] ?? null, error: null };
    }
    return result;
  });
  builder.single = vi.fn(async () => {
    const result = await exec();
    if (Array.isArray(result.data)) {
      const row = result.data[0];
      if (!row) {
        return { data: null, error: { message: "not found" } };
      }
      return { data: row, error: null };
    }
    return result;
  });
  builder.insert = vi.fn(async (payload: Row | Row[]) => {
    const items = Array.isArray(payload) ? payload : [payload];
    for (const item of items) {
      const row = { id: `generated-${rows.length + 1}`, ...item };
      rows.push(row);
      onInsert?.(row);
    }
    return { error: null };
  });
  builder.upsert = vi.fn(async () => ({ error: null }));

  // Supabase query builderek thenable-ek: await chain.order(...) működjön
  builder.then = (
    onFulfilled: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => exec().then(onFulfilled, onRejected);

  return builder;
}

export type MockSupabaseState = {
  tables?: Record<string, Row[]>;
  rpc?: Record<string, QueryResult | (() => QueryResult | Promise<QueryResult>)>;
  onInsert?: Record<string, (row: Row) => void>;
};

export function createMockSupabaseClient(state: MockSupabaseState = {}) {
  const tables: Record<string, Row[]> = {};

  for (const [name, rows] of Object.entries(state.tables ?? {})) {
    tables[name] = [...rows];
  }

  const getTable = (name: string): Row[] => {
    if (!tables[name]) tables[name] = [];
    return tables[name];
  };

  return {
    from: vi.fn((table: string) =>
      createQueryBuilder(getTable(table), state.onInsert?.[table]),
    ),
    rpc: vi.fn(async (name: string) => {
      const handler = state.rpc?.[name];
      if (!handler) return { data: null, error: null };
      if (typeof handler === "function") return handler();
      return handler;
    }),
    /** Tesztekhez: aktuális táblasorok */
    getRows: (table: string) => [...getTable(table)],
    setRows: (table: string, rows: Row[]) => {
      tables[table] = [...rows];
    },
    updateBidStatus: (jobId: string, craftsmanId: string, status: string) => {
      const bid = getTable("job_bids").find(
        (b) => b.job_id === jobId && b.craftsman_id === craftsmanId,
      );
      if (bid) bid.status = status;
    },
  };
}
