alter type user_role add value if not exists 'FINANCE';

-- Optional: ensure manager candidates (MANAGER, ADMIN) quickly filterable
create index if not exists idx_users_role on users(role);
