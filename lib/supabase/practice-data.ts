import type { SupabaseClient } from "@supabase/supabase-js";
import type { PracticeEnd, PracticeSession } from "@/lib/types";

type SessionRow = {
  id: string;
  practice_date: string;
  overall_note: string | null;
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
    .select("id, session_id, arrow_1, arrow_2, arrow_3, arrow_4, note, created_at")
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
  };
}

export async function loadLatestSessionForDate(supabase: SupabaseClient, userId: string, practiceDate: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("id, practice_date, overall_note, created_at")
    .eq("user_id", userId)
    .eq("practice_date", practiceDate)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as SessionRow;

  return mapSessionWithEnds(supabase, row);
}

export async function loadRecentPracticeSessions(supabase: SupabaseClient, userId: string, limit = 12) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("id, practice_date, overall_note, created_at")
    .eq("user_id", userId)
    .order("practice_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return Promise.all((data as SessionRow[]).map((row) => mapSessionWithEnds(supabase, row)));
}

export async function loadPracticeSessionById(supabase: SupabaseClient, userId: string, sessionId: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .select("id, practice_date, overall_note, created_at")
    .eq("user_id", userId)
    .eq("id", sessionId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return mapSessionWithEnds(supabase, data as SessionRow);
}

export async function createPracticeSession(supabase: SupabaseClient, userId: string, practiceDate: string) {
  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userId,
      practice_date: practiceDate,
      overall_note: "",
    })
    .select("id, practice_date, overall_note, created_at")
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
  } satisfies PracticeSession;
}

export async function updatePracticeSessionNote(supabase: SupabaseClient, sessionId: string, overallNote: string) {
  const { error } = await supabase
    .from("practice_sessions")
    .update({
      overall_note: overallNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

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
    .select("id, session_id, arrow_1, arrow_2, arrow_3, arrow_4, note, created_at")
    .single();

  if (error) {
    throw error;
  }

  return mapEnd(data as EndRow);
}
