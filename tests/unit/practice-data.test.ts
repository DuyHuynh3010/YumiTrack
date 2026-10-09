import { createClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  createPracticeSession, createPracticeEnd, updatePracticeSession, updatePracticeEnd,
  deletePracticeSession, deletePracticeEnd, loadPracticeSessionById, loadPracticeSessionsInRange,
} from "../../lib/supabase/practice-data";

const sessionRow = {
  id: "session-a", practice_date: "2026-01-01", overall_note: null,
  finished_at: null, created_at: "2026-01-01T12:00:00Z",
};
const endRow = {
  id: "end-a", session_id: "session-a", arrow_1: true, arrow_2: false,
  arrow_3: true, arrow_4: false, note: null, created_at: "2026-01-01T12:00:00Z",
};

function clientWithResponses(...responses: Array<{ data?: unknown; status?: number }>) {
  const requests: { url: URL; method: string; body: unknown }[] = [];
  const fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({
      url: new URL(String(input)), method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(String(init.body)) : undefined,
    });
    const response = responses.shift();
    if (!response) throw new Error("Unexpected Supabase request");
    const status = response.status ?? 200;
    return new Response(status === 204 ? null : JSON.stringify(response.data), {
      status, headers: { "Content-Type": "application/json" },
    });
  });
  const client = createClient("https://test.supabase.co", "test-publishable-key", {
    auth: { persistSession: false, autoRefreshToken: false }, global: { fetch },
  });
  return { client, requests, fetch };
}

describe("Supabase practice requests", () => {
  it("creates a session for the owner and maps nullable columns", async () => {
    const { client, requests } = clientWithResponses({ data: sessionRow });
    const result = await createPracticeSession(client, "user-a", "2026-01-01");
    expect(requests[0]).toMatchObject({ method: "POST", body: {
      user_id: "user-a", practice_date: "2026-01-01", overall_note: "",
    } });
    expect(result).toMatchObject({ id: "session-a", practiceDate: "2026-01-01", overallNote: "", ends: [], finishedAt: null });
  });
  it("creates an end without changing arrow order", async () => {
    const { client, requests } = clientWithResponses({ data: endRow });
    const result = await createPracticeEnd(client, "user-a", "session-a", [true, false, true, false], "focus");
    expect(requests[0].body).toEqual({
      user_id: "user-a", session_id: "session-a", arrow_1: true, arrow_2: false,
      arrow_3: true, arrow_4: false, note: "focus",
    });
    expect(result).toMatchObject({ arrows: [true, false, true, false], note: "", sessionId: "session-a" });
  });
  it("updates the selected session and allows clearing notes and reopening", async () => {
    const { client, requests } = clientWithResponses({ status: 204 });
    await updatePracticeSession(client, "session-a", { overallNote: "", finishedAt: null });
    expect(requests[0].method).toBe("PATCH");
    expect(requests[0].url.searchParams.get("id")).toBe("eq.session-a");
    expect(requests[0].body).toEqual({ overall_note: "", finished_at: null, updated_at: expect.any(String) });
  });
  it("persists date changes and finished status", async () => {
    const { client, requests } = clientWithResponses({ status: 204 });
    await updatePracticeSession(client, "session-a", { practiceDate: "2026-02-02", finishedAt: "2026-02-02T12:00:00Z" });
    expect(requests[0].body).toMatchObject({ practice_date: "2026-02-02", finished_at: "2026-02-02T12:00:00Z" });
    expect(requests[0].body).not.toHaveProperty("overall_note");
  });
  it("updates an end and maps the returned result", async () => {
    const { client, requests } = clientWithResponses({ data: { ...endRow, arrow_1: false, arrow_4: true, note: "updated" } });
    const result = await updatePracticeEnd(client, "end-a", [false, false, true, true], "updated");
    expect(requests[0].url.searchParams.get("id")).toBe("eq.end-a");
    expect(requests[0]).toMatchObject({ method: "PATCH", body: { arrow_1: false, arrow_4: true, note: "updated" } });
    expect(result).toMatchObject({ arrows: [false, false, true, true], note: "updated" });
  });
  it.each([
    ["practice_sessions", "session-a", deletePracticeSession],
    ["ends", "end-a", deletePracticeEnd],
  ] as const)("deletes only the requested %s record", async (table, id, remove) => {
    const { client, requests } = clientWithResponses({ status: 204 });
    await remove(client, id);
    expect(requests[0].method).toBe("DELETE");
    expect(requests[0].url.pathname).toBe(`/rest/v1/${table}`);
    expect(requests[0].url.searchParams.get("id")).toBe(`eq.${id}`);
  });
  it("loads session ends and scopes the session query to the user", async () => {
    const { client, requests } = clientWithResponses({ data: sessionRow }, { data: [endRow] });
    const result = await loadPracticeSessionById(client, "user-a", "session-a");
    expect(requests[0].url.searchParams.get("user_id")).toBe("eq.user-a");
    expect(requests[1].url.searchParams.get("session_id")).toBe("eq.session-a");
    expect(result?.ends[0].arrows).toEqual([true, false, true, false]);
  });
  it("returns null without loading ends for an unavailable session", async () => {
    const { client, fetch } = clientWithResponses({ data: null });
    expect(await loadPracticeSessionById(client, "user-a", "missing")).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it("uses inclusive date bounds and the owner filter", async () => {
    const { client, requests } = clientWithResponses({ data: [] });
    expect(await loadPracticeSessionsInRange(client, "user-a", "2026-01-01", "2026-01-31")).toEqual([]);
    expect(requests[0].url.searchParams.getAll("practice_date")).toEqual(["gte.2026-01-01", "lte.2026-01-31"]);
    expect(requests[0].url.searchParams.get("user_id")).toBe("eq.user-a");
  });
  it.each(["create session", "create end", "update session", "update end", "delete session", "delete end", "load session"])(
    "propagates database errors for %s", async (operation) => {
      const { client } = clientWithResponses({ status: 403, data: { code: "42501", message: "permission denied" } });
      const operations: Record<string, () => Promise<unknown>> = {
        "create session": () => createPracticeSession(client, "user-a", "2026-01-01"),
        "create end": () => createPracticeEnd(client, "user-a", "session-a", [true, false, true, false], ""),
        "update session": () => updatePracticeSession(client, "session-a", { overallNote: "test" }),
        "update end": () => updatePracticeEnd(client, "end-a", [true, false, true, false], ""),
        "delete session": () => deletePracticeSession(client, "session-a"),
        "delete end": () => deletePracticeEnd(client, "end-a"),
        "load session": () => loadPracticeSessionById(client, "user-a", "session-a"),
      };
      await expect(operations[operation]()).rejects.toMatchObject({ code: "42501" });
    },
  );
});
