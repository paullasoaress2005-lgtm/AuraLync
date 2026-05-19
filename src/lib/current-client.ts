import { cookies } from "next/headers";

export type CurrentClient = {
  id: string;
  name: string;
  email: string;
  evolutionInstance: string;
  specialty: string;
  profileName: string;
  role: string;
};

type ProfileClientRow = {
  name: string;
  role: string;
  clients: {
    id: string;
    name: string;
    email: string;
    evolution_instance: string;
    specialty: string;
  } | null;
};

function supabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment is not configured.");
  }

  return { url, key };
}

async function supabaseFetch<T>(path: string): Promise<T> {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCurrentUserId() {
  const cookieStore = await cookies();
  return cookieStore.get("al_user_id")?.value ?? null;
}

export async function getCurrentClient(): Promise<CurrentClient | null> {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  const userId = await getCurrentUserId();
  if (!userId) return null;

  const rows = await supabaseFetch<ProfileClientRow[]>(
    `profiles?select=name,role,clients(id,name,email,evolution_instance,specialty)&id=eq.${encodeURIComponent(userId)}&limit=1`,
  );
  const profile = rows[0];
  const client = profile?.clients;

  if (!profile || !client) return null;

  return {
    id: client.id,
    name: client.name,
    email: client.email,
    evolutionInstance: client.evolution_instance,
    specialty: client.specialty,
    profileName: profile.name,
    role: profile.role,
  };
}

