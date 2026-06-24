create extension if not exists pgcrypto;

create table if not exists users (
  id text primary key,
  name text not null,
  normalized_name text not null,
  phone text not null,
  normalized_phone text not null unique,
  role text not null default 'USER',
  language text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz
);

create table if not exists matches (
  id text primary key,
  external_id text unique,
  provider text,
  home_team text not null,
  away_team text not null,
  home_team_code text,
  away_team_code text,
  kickoff_at timestamptz not null,
  stage text,
  group_name text,
  status text not null default 'SCHEDULED',
  home_score integer,
  away_score integer,
  result_source text,
  result_synced_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists predictions (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  match_id text not null references matches(id) on delete cascade,
  predicted_home_score integer not null,
  predicted_away_score integer not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_before_lock boolean not null default true,
  points integer default 0,
  exact_score boolean default false,
  correct_winner boolean default false,
  raw jsonb not null default '{}'::jsonb,
  unique(user_id, match_id)
);

create table if not exists payments (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  match_id text references matches(id) on delete set null,
  prediction_id text references predictions(id) on delete set null,
  currency text not null check (currency in ('COP', 'USD')),
  amount numeric not null,
  status text not null default 'PENDING',
  user_comment text,
  admin_notes text,
  base_pot_contribution_cop numeric not null default 0,
  exchange_rate_source text,
  exchange_rate_date date,
  exchange_rate_usd_cop numeric,
  actual_cop_received numeric,
  exchange_excess numeric not null default 0,
  rate_locked_at timestamptz,
  verified_by text references users(id),
  verified_at timestamptz,
  rejected_by text references users(id),
  rejected_at timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists exchange_rates (
  id text primary key default gen_random_uuid()::text,
  pair text not null default 'USD_COP',
  rate numeric,
  source text not null,
  rate_date date,
  fetched_at timestamptz not null default now(),
  is_valid boolean not null default true,
  raw_value text,
  rejected_reason text,
  raw jsonb not null default '{}'::jsonb
);

create table if not exists audit_logs (
  id text primary key,
  actor_user_id text references users(id),
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists prediction_corrections (
  id text primary key,
  prediction_id text not null references predictions(id) on delete cascade,
  match_id text not null references matches(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  corrected_by_admin_id text references users(id),
  previous_home_score integer,
  previous_away_score integer,
  new_home_score integer not null,
  new_away_score integer not null,
  reason text not null,
  corrected_at timestamptz not null default now()
);

create table if not exists payouts (
  id text primary key,
  user_id text not null references users(id) on delete cascade,
  prize_type text not null,
  amount_cop numeric not null default 0,
  amount_usd numeric,
  source text,
  status text not null default 'calculated',
  admin_notes text,
  calculated_at timestamptz not null default now(),
  approved_by text references users(id),
  approved_at timestamptz,
  paid_by text references users(id),
  paid_at timestamptz
);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists sync_logs (
  id text primary key default gen_random_uuid()::text,
  sync_type text not null,
  provider text,
  status text not null,
  message text,
  records_checked integer default 0,
  records_updated integer default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists exports (
  id text primary key default gen_random_uuid()::text,
  export_type text not null,
  created_by text references users(id),
  file_name text,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_normalized_name on users(normalized_name);
create index if not exists idx_users_normalized_phone on users(normalized_phone);
create index if not exists idx_matches_kickoff_at on matches(kickoff_at);
create index if not exists idx_matches_status on matches(status);
create index if not exists idx_predictions_user_id on predictions(user_id);
create index if not exists idx_predictions_match_id on predictions(match_id);
create index if not exists idx_payments_user_id on payments(user_id);
create index if not exists idx_payments_status on payments(status);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at);
create index if not exists idx_audit_logs_entity on audit_logs(entity_type, entity_id);

alter table users enable row level security;
alter table matches enable row level security;
alter table predictions enable row level security;
alter table payments enable row level security;
alter table exchange_rates enable row level security;
alter table audit_logs enable row level security;
alter table prediction_corrections enable row level security;
alter table payouts enable row level security;
alter table app_settings enable row level security;
alter table sync_logs enable row level security;
alter table exports enable row level security;
