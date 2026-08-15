import type { SupabaseClient } from "@supabase/supabase-js";
import type { PracticeEnd, PracticeSession } from "@/lib/types";

const sessionSelect = "id, practice_date, overall_note, finished_at, created_at";
const endSelect = "id, session_id, arrow_1, arrow_2, arrow_3, arrow_4, note, created_at";

type SessionRow = {
  id: string;
  practice_date: string;
  overall_note: string | null;
  finished_at: string | null;
  created_at: string;
};

type EndRow = {
  id: string;
  session_id: string;
  arrow_1: boolean;
  arrow_2: boolean;
  arrow_3: boolean;
  arrow_4: boolean;
  note: string | null;
  created_at: string;
};

function mapEnd(row: EndRow): PracticeEnd {
  return {
    id: row.id,
    sessionId: row.session_id,
    arrows: [row.arrow_1, row.arrow_2, row.arrow_3, row.arrow_4],
    note: row.note ?? "",
    createdAt: row.created_at,
  };
}

async function loadEnds(supabase: SupabaseClient, sessionId: string) {
  const { data, error } = await supabase
    .from("ends")
    .select(endSelect)
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data as EndRow[]).map(mapEnd);
}

async function mapSessionWithEnds(supabase: SupabaseClient, row: SessionRow): Promise<PracticeSession> {
  return {
    id: row.id,
    practiceDate: row.practice_date,
    overallNote: row.overall_note ?? "",
    ends: await loadEnds(supabase, row.id),
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  };
}

export async function loadLatestSessionForDate(supabase: SupabaseClient, userId: string, practiceDate: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(sessionSelect)
    .eq("user_id", userId)
    .eq("practice_date", practiceDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSessionWithEnds(supabase, data as SessionRow) : null;
}

export async function loadRecentPracticeSessions(supabase: SupabaseClient, userId: string, limit = 12) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(sessionSelect)
    .eq("user_id", userId)
    .order("practice_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return Promise.all((data as SessionRow[]).map((row) => mapSessionWithEnds(supabase, row)));
}

export async function loadAllPracticeSessions(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(sessionSelect)
    .eq("user_id", userId)
    .order("practice_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return Promise.all((data as SessionRow[]).map((row) => mapSessionWithEnds(supabase, row)));
}

export async function loadPracticeSessionsInRange(supabase: SupabaseClient, userId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(sessionSelect)
    .eq("user_id", userId)
    .gte("practice_date", startDate)
    .lte("practice_date", endDate)
    .order("practice_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return Promise.all((data as SessionRow[]).map((row) => mapSessionWithEnds(supabase, row)));
}

export async function loadPracticeSessionById(supabase: SupabaseClient, userId: string, sessionId: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select(sessionSelect)
    .eq("user_id", userId)
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapSessionWithEnds(supabase, data as SessionRow) : null;
}

export async function createPracticeSession(supabase: SupabaseClient, userId: string, practiceDate: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userId,
      practice_date: practiceDate,
      overall_note: "",
    })
    .select(sessionSelect)
    .single();

  if (error) {
    throw error;
  }

  const row = data as SessionRow;

  return {
    id: row.id,
    practiceDate: row.practice_date,
    overallNote: row.overall_note ?? "",
    ends: [],
    createdAt: row.created_at,
    finishedAt: row.finished_at,
  } satisfies PracticeSession;
}

export async function updatePracticeSession(
  supabase: SupabaseClient,
  sessionId: string,
  updates: { overallNote?: string; practiceDate?: string; finishedAt?: string | null },
) {
  const payload: Record<string, string | null> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.overallNote !== undefined) {
    payload.overall_note = updates.overallNote;
  }

  if (updates.practiceDate !== undefined) {
    payload.practice_date = updates.practiceDate;
  }

  if (updates.finishedAt !== undefined) {
    payload.finished_at = updates.finishedAt;
  }

  const { error } = await supabase.from("practice_sessions").update(payload).eq("id", sessionId);

  if (error) {
    throw error;
  }
}

export async function updatePracticeSessionNote(supabase: SupabaseClient, sessionId: string, overallNote: string) {
  return updatePracticeSession(supabase, sessionId, { overallNote });
}

export async function deletePracticeSession(supabase: SupabaseClient, sessionId: string) {
  const { error } = await supabase.from("practice_sessions").delete().eq("id", sessionId);

  if (error) {
    throw error;
  }
}

export async function createPracticeEnd(
  supabase: SupabaseClient,
  userId: string,
  sessionId: string,
  arrows: [boolean, boolean, boolean, boolean],
  note: string,
) {
  const { data, error } = await supabase
    .from("ends")
    .insert({
      session_id: sessionId,
      user_id: userId,
      arrow_1: arrows[0],
      arrow_2: arrows[1],
      arrow_3: arrows[2],
      arrow_4: arrows[3],
      note,
    })
    .select(endSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapEnd(data as EndRow);
}

export async function updatePracticeEnd(
  supabase: SupabaseClient,
  endId: string,
  arrows: [boolean, boolean, boolean, boolean],
  note: string,
) {
  const { data, error } = await supabase
    .from("ends")
    .update({
      arrow_1: arrows[0],
      arrow_2: arrows[1],
      arrow_3: arrows[2],
      arrow_4: arrows[3],
      note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", endId)
    .select(endSelect)
    .single();

  if (error) {
    throw error;
  }

  return mapEnd(data as EndRow);
}

export async function deletePracticeEnd(supabase: SupabaseClient, endId: string) {
  const { error } = await supabase.from("ends").delete().eq("id", endId);

  if (error) {
    throw error;
  }
}
