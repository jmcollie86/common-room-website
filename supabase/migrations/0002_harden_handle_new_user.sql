-- Hardens handle_new_user() so it can never abort a signup.
--
-- 0001 was applied to production with an unguarded body: the trigger runs
-- inside the auth.users INSERT transaction, so any error (notably a non-numeric
-- year_of_birth hitting `::int`) would roll back the whole signup. This replaces
-- the function with a version that (a) only casts year_of_birth when it is all
-- digits, and (b) catches any other error, logs a warning, and still returns NEW.
--
-- Run this against the live database (the trigger created in 0001 already points
-- at this function by name, so replacing the function is enough).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    insert into public.profiles (id, full_name, gender, year_of_birth, home_postcode)
    values (
      new.id,
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      nullif(new.raw_user_meta_data ->> 'gender', ''),
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
