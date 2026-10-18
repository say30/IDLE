-- À coller une seule fois dans Supabase : SQL Editor > New query > Run.
-- Les tables ont la sécurité RLS activée SANS règle publique :
-- seule la clé "service_role" (gardée sur le serveur Vercel) peut lire ou écrire.

create table if not exists profiles (
  id text primary key,
  name text not null,
  avatar text,
  coins integer not null default 0,
  coins_day text not null,
  xp integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key,
  owner text not null,
  name text not null,
  template text not null,
  files jsonb not null default '[]',
  messages jsonb not null default '[]',
  version integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on projects (owner, updated_at desc);

create table if not exists plugin_links (
  id uuid primary key,
  project_id uuid not null references projects (id) on delete cascade,
  owner text not null,
  code text unique,
  code_expires_at timestamptz,
  token_hash text unique,
  delivered_version integer not null default 0,
  last_seen timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists plugin_links_project_idx on plugin_links (project_id);

alter table profiles enable row level security;
alter table projects enable row level security;
alter table plugin_links enable row level security;
