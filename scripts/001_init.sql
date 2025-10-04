-- Companies
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country_code text not null,
  base_currency text not null,
  created_at timestamptz not null default now()
);

-- Users
create type user_role as enum ('ADMIN','MANAGER','EMPLOYEE');

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'EMPLOYEE',
  manager_id uuid null references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_company on users(company_id);
create index if not exists idx_users_manager on users(manager_id);

-- Approval rules
create type rule_type as enum ('PERCENTAGE','SPECIFIC','HYBRID');

create table if not exists approval_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  rule_type rule_type not null,
  percentage int null check (percentage between 1 and 100),
  specific_approver_user_id uuid null references users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_rules_company_unique on approval_rules(company_id);

-- Expenses
create type expense_status as enum ('PENDING','APPROVED','REJECTED');

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  amount numeric(12,2) not null,
  currency text not null,
  amount_base numeric(12,2) not null,
  category text not null,
  description text,
  expense_date date not null,
  merchant text,
  receipt_url text,
  status expense_status not null default 'PENDING',
  current_step int not null default 1,
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_company on expenses(company_id);
create index if not exists idx_expenses_user on expenses(user_id);
create index if not exists idx_expenses_status on expenses(status);

-- Expense Approvals
create type approval_status as enum ('PENDING','APPROVED','REJECTED');

create table if not exists expense_approvals (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  approver_id uuid not null references users(id) on delete cascade,
  step int not null,
  status approval_status not null default 'PENDING',
  comment text,
  acted_at timestamptz
);

create index if not exists idx_approvals_expense on expense_approvals(expense_id);
create index if not exists idx_approvals_approver on expense_approvals(approver_id);

-- Notifications (simple inbox)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  data jsonb not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on notifications(user_id);
