import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createPracticeSession, createPracticeEnd, updatePracticeSession, updatePracticeEnd,
  deletePracticeSession, deletePracticeEnd, loadPracticeSessionById,
} from "../../lib/supabase/practice-data";

type Account = { client: SupabaseClient; id: string };
const accounts: Account[] = [];
const createdSessions: { client: SupabaseClient; id: string }[] = [];

function testClient() {
  return createClient(process.env.SUPABASE_TEST_URL!, process.env.SUPABASE_TEST_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

beforeAll(async () => {
  for (const name of ["A", "B"]) {
    const client = testClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: process.env[`TEST_USER_${name}_EMAIL`]!,
      password: process.env[`TEST_USER_${name}_PASSWORD`]!,
    });
    if (error || !data.user) throw new Error(`Cannot sign in test account ${name}. Check test credentials and email confirmation.`);
    accounts.push({ client, id: data.user.id });
  }
  expect(accounts[0].id).not.toBe(accounts[1].id);
});

afterAll(async () => {
  const failures: string[] = [];
  for (const entry of createdSessions) {
    const result = await entry.client.from("practice_sessions").delete().eq("id", entry.id);
    if (result.error) failures.push(`Could not clean up test session ${entry.id}`);
  }
  for (const account of accounts) await account.client.auth.signOut();
  if (failures.length) throw new Error(failures.join("\n"));
});

async function newSession(account: Account) {
  const result = await createPracticeSession(account.client, account.id, "2026-01-01");
  createdSessions.push({ client: account.client, id: result.id });
  return result;
}

describe("real database CRUD and RLS", () => {
  it("persists edits, deletes ends and cascades a deleted session", async () => {
    const owner = accounts[0];
    const session = await newSession(owner);
    const end = await createPracticeEnd(owner.client, owner.id, session.id, [true, false, true, false], "test");
    await updatePracticeSession(owner.client, session.id, { practiceDate: "2026-01-02", overallNote: "edited", finishedAt: "2026-01-02T12:00:00Z" });
    await updatePracticeEnd(owner.client, end.id, [false, true, true, true], "edited end");
    const loaded = await loadPracticeSessionById(owner.client, owner.id, session.id);
    expect(loaded).toMatchObject({ practiceDate: "2026-01-02", overallNote: "edited" });
    expect(new Date(loaded!.finishedAt!).toISOString()).toBe("2026-01-02T12:00:00.000Z");
    expect(loaded?.ends[0]).toMatchObject({ arrows: [false, true, true, true], note: "edited end" });
    await updatePracticeSession(owner.client, session.id, { finishedAt: null });
    expect((await loadPracticeSessionById(owner.client, owner.id, session.id))?.finishedAt).toBeNull();
    await deletePracticeEnd(owner.client, end.id);
    expect((await loadPracticeSessionById(owner.client, owner.id, session.id))?.ends).toEqual([]);
    const cascadeEnd = await createPracticeEnd(owner.client, owner.id, session.id, [false, false, false, false], "cascade");
    await deletePracticeSession(owner.client, session.id);
    expect(await loadPracticeSessionById(owner.client, owner.id, session.id)).toBeNull();
    const remaining = await owner.client.from("ends").select("id").eq("id", cascadeEnd.id);
    expect(remaining.error).toBeNull();
    expect(remaining.data).toEqual([]);
  });

  it.each([0, 1])("prevents the other account from accessing account %i data", async (ownerIndex) => {
    const owner = accounts[ownerIndex];
    const other = accounts[1 - ownerIndex];
    const session = await newSession(owner);
    const end = await createPracticeEnd(owner.client, owner.id, session.id, [true, false, true, false], "owner end");

    // Direct queries bypass application owner filters and exercise database RLS.
    for (const [table, id] of [["practice_sessions", session.id], ["ends", end.id], ["profiles", owner.id]]) {
      const read = await other.client.from(table).select("*").eq("id", id);
      expect(read.error).toBeNull();
      expect(read.data).toEqual([]);
    }
    const ownProfile = await owner.client.from("profiles").select("id").eq("id", owner.id).single();
    expect(ownProfile.error).toBeNull();
    expect(ownProfile.data?.id).toBe(owner.id);
    for (const [table, id, updates] of [
      ["profiles", owner.id, { email: "forbidden@example.test" }],
      ["practice_sessions", session.id, { overall_note: "forbidden" }],
      ["ends", end.id, { note: "forbidden" }],
    ] as const) {
      const edit = await other.client.from(table).update(updates).eq("id", id).select("id");
      expect(edit.error).toBeNull();
      expect(edit.data).toEqual([]);
    }
    for (const [table, id] of [["practice_sessions", session.id], ["ends", end.id]]) {
      const remove = await other.client.from(table).delete().eq("id", id).select("id");
      expect(remove.error).toBeNull();
      expect(remove.data).toEqual([]);
    }
    const unchanged = await loadPracticeSessionById(owner.client, owner.id, session.id);
    expect(unchanged?.overallNote).toBe("");
    expect(unchanged?.ends[0].note).toBe("owner end");

    const spoofSession = await other.client.from("practice_sessions").insert({ user_id: owner.id, practice_date: "2026-01-01" }).select("id");
    for (const row of spoofSession.data ?? []) createdSessions.push({ client: owner.client, id: row.id });
    expect(spoofSession.error?.code).toBe("42501");
    for (const userId of [owner.id, other.id]) {
      const attachEnd = await other.client.from("ends").insert({
        user_id: userId, session_id: session.id,
        arrow_1: true, arrow_2: false, arrow_3: true, arrow_4: false,
      });
      expect(attachEnd.error?.code).toBe("42501");
    }
    const otherSession = await newSession(other);
    const moveEnd = await owner.client.from("ends").update({ session_id: otherSession.id }).eq("id", end.id);
    expect(moveEnd.error?.code).toBe("42501");
    const transfer = await owner.client.from("practice_sessions").update({ user_id: other.id }).eq("id", session.id);
    expect(transfer.error?.code).toBe("42501");
    const transferEnd = await owner.client.from("ends").update({ user_id: other.id }).eq("id", end.id);
    expect(transferEnd.error?.code).toBe("42501");
  });

  it("blocks anonymous reads and session creation", async () => {
    const owner = accounts[0];
    const session = await newSession(owner);
    const end = await createPracticeEnd(owner.client, owner.id, session.id, [true, true, true, true], "anonymous check");
    const anonymous = testClient();
    for (const [table, id] of [["practice_sessions", session.id], ["ends", end.id], ["profiles", owner.id]]) {
      const read = await anonymous.from(table).select("id").eq("id", id);
      expect(read.error).toBeNull();
      expect(read.data).toEqual([]);
    }
    const insert = await anonymous.from("practice_sessions").insert({ user_id: owner.id, practice_date: "2026-01-01" }).select("id");
    for (const row of insert.data ?? []) createdSessions.push({ client: owner.client, id: row.id });
    expect(insert.error?.code).toBe("42501");
  });
});
