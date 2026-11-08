-- v76: no message/context storage. Run once in the SQL editor before deploying sidbot.
create table if not exists public.sidbot_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  n integer not null default 0 check (n>=0),
  last_at timestamptz,
  primary key (user_id,day)
);
alter table public.sidbot_usage enable row level security;
revoke all on public.sidbot_usage from public,anon,authenticated;
grant select,insert,update,delete on public.sidbot_usage to service_role;
-- Invoker: service_role only. DB clock and row lock serialize competing requests.
create or replace function public.sidbot_take(p_user uuid,p_limit integer default 20)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  d date := (now() at time zone 'UTC')::date;
  lim integer := greatest(1,least(40,p_limit));
  rec public.sidbot_usage%rowtype;
  reset_at timestamptz;
begin
  reset_at := (d+1)::timestamp at time zone 'UTC';
  insert into public.sidbot_usage(user_id,day) values(p_user,d) on conflict do nothing;
  select * into rec from public.sidbot_usage where user_id=p_user and day=d for update;
  if rec.n>=lim then
    return jsonb_build_object('error','quota','retry_after',ceil(extract(epoch from reset_at-now())));
  end if;
  if rec.last_at is not null and rec.last_at>now()-interval '5 seconds' then
    return jsonb_build_object('error','rate','retry_after',5);
  end if;
  update public.sidbot_usage set n=n+1,last_at=now() where user_id=p_user and day=d;
  -- Count attempts, including provider/network failures, to prevent retry amplification.
  delete from public.sidbot_usage where user_id=p_user and day<d-7;
  return jsonb_build_object('used',rec.n+1,'limit',lim,'reset',to_char(reset_at at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS"Z"'));
end $$;
revoke all on function public.sidbot_take(uuid,integer) from public,anon,authenticated;
grant execute on function public.sidbot_take(uuid,integer) to service_role;
