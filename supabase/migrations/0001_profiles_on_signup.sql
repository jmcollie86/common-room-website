-- Create a `profiles` row automatically whenever a new auth user is created.
--
-- Registration data is passed into supabase.auth.signUp({ options: { data } }),
-- which Supabase stores in auth.users.raw_user_meta_data. This trigger copies
-- those fields into public.profiles the instant the auth user is inserted —
-- server-side, independent of RLS and of the browser ever completing the flow.
-- It's a belt-and-braces backup to the client-side ensureProfile() call.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- This runs inside the auth.users INSERT transaction. Any unhandled error
  -- here would roll back the signup, so the profile insert is wrapped in its
  -- own block: on failure we log a warning and still return NEW, so profile
  -- creation can never block a user from signing up.
  begin
    insert into public.profiles (id, full_name, gender, year_of_birth, home_postcode)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'gender', ''),
      -- Only cast when the value is all digits; a non-numeric value would
      -- otherwise raise "invalid input syntax for type integer".
      case
        when new.raw_user_meta_data ->> 'year_of_birth' ~ '^\d+$'
          then (new.raw_user_meta_data ->> 'year_of_birth')::int
        else null
      end,
      nullif(new.raw_user_meta_data ->> 'home_postcode', '')
    )
    on conflict (id) do nothing;
  exception
    when others then
      raise warning 'handle_new_user: could not create profile for %: %', new.id, sqlerrm;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- One-time backfill: give a profiles row to any existing auth user who never
-- got one (e.g. registered before this fix). Names are pulled from metadata
-- where present; users registered before metadata was captured get a row with
-- a null name so they at least appear in the admin list.
insert into public.profiles (id, full_name, gender, year_of_birth, home_postcode)
select
  u.id,
  nullif(u.raw_user_meta_data ->> 'full_name', ''),
  nullif(u.raw_user_meta_data ->> 'gender', ''),
  case
    when u.raw_user_meta_data ->> 'year_of_birth' ~ '^\d+$'
      then (u.raw_user_meta_data ->> 'year_of_birth')::int
    else null
  end,
  nullif(u.raw_user_meta_data ->> 'home_postcode', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
