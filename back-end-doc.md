# HR Backend — API Documentation

Base URL: `http://localhost:8000/api`

---

## Table of Contents

1. [Authentication Rules](#1-authentication-rules)
2. [Auth Endpoints](#2-auth-endpoints)
   - [Register Applicant](#21-register-applicant)
   - [Login](#22-login)
   - [Logout](#23-logout)
   - [My Profile](#24-my-profile)
   - [Password Reset Request](#25-password-reset-request)
   - [Password Reset Confirm](#26-password-reset-confirm)
3. [HR — Positions](#3-hr--positions)
4. [HR — Employees](#4-hr--employees)
5. [HR — Time Off Requests](#5-hr--time-off-requests)
6. [HR — Performance Reviews](#6-hr--performance-reviews)
7. [Recruitment — Applicants](#7-recruitment--applicants)
8. [Recruitment — Work Experience](#8-recruitment--work-experience)
9. [Recruitment — Jobs](#9-recruitment--jobs)
10. [Recruitment — Job Applications](#10-recruitment--job-applications)
11. [Recruitment — Interviews](#11-recruitment--interviews)
12. [Common Behaviors](#12-common-behaviors)

---

## 1. Authentication Rules

All endpoints except the ones listed below require a valid token in the `Authorization` header.

```
Authorization: Token <your_token>
```

**Public endpoints (no token required):**

| Endpoint | Description |
|----------|-------------|
| `POST /api/register/` | Create applicant account |
| `POST /api/api-token-auth/` | Login |
| `POST /api/password-reset/` | Request password reset |
| `POST /api/password-reset/confirm/` | Apply new password |

**Permission model:**

Beyond authentication, every endpoint also enforces Django model permissions based on the user's group:

| HTTP Method | Required permission |
|-------------|---------------------|
| GET | `view_<model>` |
| POST | `add_<model>` |
| PUT / PATCH | `change_<model>` |
| DELETE | `delete_<model>` |

Superusers bypass all permission checks.

---

## 2. Auth Endpoints

### 2.1 Register Applicant

Creates a Django `User` account and an `Applicant` profile in a single step. Sends a welcome email via AWS SES. Returns a token for immediate use — no second login required.

```
POST /api/register/
```

**Auth required:** No

**Request body:**

```json
{
    "username":         "jdoe",
    "password":         "securepass123",
    "password_confirm": "securepass123",
    "first_name":       "Jane",
    "last_name":        "Doe",
    "email":            "jane.doe@example.com",
    "phone":            "+1 555 000 0000"
}
```

| Field | Required | Rules |
|-------|----------|-------|
| `username` | Yes | Must be unique across all users |
| `password` | Yes | Minimum 8 characters |
| `password_confirm` | Yes | Must match `password` |
| `first_name` | Yes | — |
| `last_name` | Yes | — |
| `email` | Yes | Must be unique across users and applicants |
| `phone` | No | — |

**Response 201:**

```json
{
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
    "applicant": {
        "id": "a3f8c2d1-...",
        "user": 5,
        "user_username": "jdoe",
        "first_name": "Jane",
        "last_name": "Doe",
        "full_name": "Jane Doe",
        "email": "jane.doe@example.com",
        ...
    }
}
```

**Error responses:**

| Status | Cause |
|--------|-------|
| 400 | Username already taken |
| 400 | Email already registered |
| 400 | Passwords do not match |
| 400 | Password shorter than 8 characters |

---

### 2.2 Login

Returns an auth token for an existing user.

```
POST /api/api-token-auth/
```

**Auth required:** No

**Request body:**

```json
{
    "username": "jdoe",
    "password": "securepass123"
}
```

**Response 200:**

```json
{
    "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
}
```

**Rules:**
- Tokens expire after `AUTH_TOKEN_MAX_AGE_HOURS` (default: 24 hours)
- After expiration the token is deleted and the user must log in again

---

### 2.3 Logout

Deletes the current token, invalidating the session.

```
POST /api/logout/
```

**Auth required:** Yes

**Response 200:**

```json
{
    "detail": "Successfully logged out."
}
```

---

### 2.4 My Profile

Returns the authenticated user's profile, groups, and permissions.

```
GET /api/me/
```

**Auth required:** Yes

**Response 200:**

```json
{
    "id": 5,
    "username": "jdoe",
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "is_staff": false,
    "groups": ["Recruiters"],
    "permissions": ["app.view_job", "app.add_jobapplication", ...]
}
```

---

### 2.5 Password Reset Request

Sends a password reset email with a one-time link. Always returns `200` regardless of whether the email exists — this prevents email enumeration attacks.

```
POST /api/password-reset/
```

**Auth required:** No

**Request body:**

```json
{
    "email": "jane.doe@example.com"
}
```

**Response 200:**

```json
{
    "detail": "If that email is registered, a reset link has been sent."
}
```

**Rules:**
- The reset link is sent to the email via AWS SES
- The link format is: `{FRONTEND_URL}/reset-password?uid=<uid>&token=<token>`
- The token is HMAC-based (Django `PasswordResetTokenGenerator`) and expires in **1 hour**
- Only active user accounts receive the email

---

### 2.6 Password Reset Confirm

Validates the reset token and applies the new password. On success, all existing tokens are invalidated — every active session is forced to log in again.

```
POST /api/password-reset/confirm/
```

**Auth required:** No

**Request body:**

```json
{
    "uid":                  "<base64 user id from email link>",
    "token":                "<reset token from email link>",
    "new_password":         "newSecurePass123",
    "new_password_confirm": "newSecurePass123"
}
```

**Response 200:**

```json
{
    "detail": "Password updated successfully. Please log in with your new password."
}
```

**Error responses:**

| Status | Cause |
|--------|-------|
| 400 | Invalid or expired token |
| 400 | Passwords do not match |
| 400 | Password shorter than 8 characters |

---

## 3. HR — Positions

Manages job titles within the company.

**Base URL:** `/api/positions/`

**Auth required:** Yes — `view/add/change/delete_position`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/positions/` | List all active positions |
| POST | `/api/positions/` | Create a position |
| GET | `/api/positions/<id>/` | Retrieve a position |
| PUT | `/api/positions/<id>/` | Full update |
| PATCH | `/api/positions/<id>/` | Partial update |
| DELETE | `/api/positions/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Auto-generated |
| `title` | string | Required |
| `description` | string | Optional |
| `min_salary` | decimal | Optional |
| `max_salary` | decimal | Optional |
| `is_active` | boolean | Default: true |

### Filters & Search

```
GET /api/positions/?is_active=true
GET /api/positions/?search=engineer
GET /api/positions/?ordering=title
```

---

## 4. HR — Employees

Core employee records. Created manually or automatically when a hired applicant is converted.

**Base URL:** `/api/employees/`

**Auth required:** Yes — `view/add/change/delete_employee`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/employees/` | List all active employees |
| POST | `/api/employees/` | Create an employee |
| GET | `/api/employees/<id>/` | Retrieve an employee |
| PUT | `/api/employees/<id>/` | Full update |
| PATCH | `/api/employees/<id>/` | Partial update |
| DELETE | `/api/employees/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Auto-generated |
| `employee_code` | string | Unique human-readable code (e.g. `EMP-001`). Used in legal documents |
| `first_name` | string | Required |
| `last_name` | string | Required |
| `email` | string | Required, unique |
| `phone` | string | Optional |
| `position` | UUID | FK → Position |
| `position_title` | string | Read-only display |
| `manager` | UUID | FK → Employee (self) |
| `manager_name` | string | Read-only display |
| `status` | choice | `active`, `inactive`, `on_leave`, `terminated` |
| `employment_type` | choice | `full_time`, `part_time`, `contractor`, `intern` |
| `hire_date` | date | Required |
| `termination_date` | date | Optional |
| `salary` | decimal | Optional |
| `address`, `city`, `state`, `zip_code`, `country` | string | Optional |
| `notes` | string | Optional |

### Filters & Search

```
GET /api/employees/?status=active
GET /api/employees/?employment_type=full_time
GET /api/employees/?position=<uuid>
GET /api/employees/?manager=<uuid>
GET /api/employees/?search=jane
GET /api/employees/?ordering=hire_date
```

---

## 5. HR — Time Off Requests

Leave requests submitted by or on behalf of employees.

**Base URL:** `/api/time-off-requests/`

**Auth required:** Yes — `view/add/change/delete_timeoffrequest`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/time-off-requests/` | List all requests |
| POST | `/api/time-off-requests/` | Create a request |
| GET | `/api/time-off-requests/<id>/` | Retrieve |
| PUT | `/api/time-off-requests/<id>/` | Full update |
| PATCH | `/api/time-off-requests/<id>/` | Partial update |
| DELETE | `/api/time-off-requests/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `employee` | UUID | FK → Employee |
| `employee_name` | string | Read-only display |
| `leave_type` | choice | `vacation`, `sick`, `personal`, `maternity`, `paternity`, `bereavement`, `unpaid`, `other` |
| `start_date` | date | Required |
| `end_date` | date | Required |
| `total_days` | decimal | Required |
| `status` | choice | `pending`, `approved`, `rejected`, `cancelled` |
| `reason` | string | Optional |
| `reviewer_notes` | string | Optional |
| `reviewed_by` | string | Username of reviewer |
| `reviewed_at` | datetime | Optional |

### Filters & Search

```
GET /api/time-off-requests/?employee=<uuid>
GET /api/time-off-requests/?status=pending
GET /api/time-off-requests/?leave_type=vacation
GET /api/time-off-requests/?search=jane
```

---

## 6. HR — Performance Reviews

Periodic employee evaluations.

**Base URL:** `/api/performance-reviews/`

**Auth required:** Yes — `view/add/change/delete_performancereview`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/performance-reviews/` | List all reviews |
| POST | `/api/performance-reviews/` | Create a review |
| GET | `/api/performance-reviews/<id>/` | Retrieve |
| PUT | `/api/performance-reviews/<id>/` | Full update |
| PATCH | `/api/performance-reviews/<id>/` | Partial update |
| DELETE | `/api/performance-reviews/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `employee` | UUID | FK → Employee |
| `employee_name` | string | Read-only display |
| `reviewer` | UUID | FK → Employee |
| `reviewer_name` | string | Read-only display |
| `review_type` | choice | `annual`, `mid_year`, `quarterly`, `probationary`, `pip` |
| `review_period_start` | date | Required |
| `review_period_end` | date | Required |
| `review_date` | date | Required |
| `overall_rating` | choice | `1` (Unsatisfactory) → `5` (Exceptional) |
| `job_knowledge`, `quality_of_work`, `productivity`, `communication`, `teamwork`, `initiative`, `attendance` | integer | Score 1–5, optional |
| `strengths`, `areas_for_improvement`, `goals_next_period` | string | Optional |
| `employee_comments`, `manager_comments` | string | Optional |
| `is_acknowledged` | boolean | Employee confirmed receipt |
| `acknowledged_at` | datetime | Optional |

### Filters & Search

```
GET /api/performance-reviews/?employee=<uuid>
GET /api/performance-reviews/?review_type=annual
GET /api/performance-reviews/?overall_rating=5
GET /api/performance-reviews/?is_acknowledged=false
```

---

## 7. Recruitment — Applicants

External candidates who register on the portal. Each applicant is linked to a Django User account.

**Base URL:** `/api/applicants/`

**Auth required:** Yes — `view/add/change/delete_applicant`

> To create an applicant account use `POST /api/register/` instead.

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/applicants/` | List applicants (compact) |
| POST | `/api/applicants/` | Create applicant (admin use) |
| GET | `/api/applicants/<id>/` | Retrieve full profile + work experience |
| PUT | `/api/applicants/<id>/` | Full update |
| PATCH | `/api/applicants/<id>/` | Partial update |
| DELETE | `/api/applicants/<id>/` | Soft delete |
| POST | `/api/applicants/<id>/upload-photo/` | Upload profile photo to S3 |
| POST | `/api/applicants/<id>/upload-cv/` | Upload CV/resume to S3 |
| GET | `/api/applicants/<id>/cv-download/` | Get pre-signed S3 URL to download CV |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Auto-generated |
| `user` | integer | FK → Django User (read-only after creation) |
| `user_username` | string | Read-only display |
| `first_name`, `last_name` | string | Required |
| `full_name` | string | Read-only computed field |
| `email` | string | Required, unique |
| `phone` | string | Optional |
| `headline` | string | e.g. "Senior Engineer with 8 years experience" |
| `summary` | string | Bio / professional summary |
| `linkedin_url`, `portfolio_url` | URL | Optional |
| `city`, `state`, `country` | string | Optional |
| `photo_url` | URL | Read-only — set via `upload-photo` |
| `cv_url` | URL | Read-only — set via `upload-cv` |
| `cv_filename` | string | Read-only |
| `has_cv`, `has_photo` | boolean | Read-only computed |
| `work_experiences` | array | Nested — all work history entries |

### Upload Photo

```
POST /api/applicants/<id>/upload-photo/
Content-Type: multipart/form-data
field: photo

Allowed types: image/jpeg, image/png, image/webp
```

**Response 200:**
```json
{ "photo_url": "https://bucket.s3.amazonaws.com/applicants/<id>/photo/filename.jpg" }
```

### Upload CV

```
POST /api/applicants/<id>/upload-cv/
Content-Type: multipart/form-data
field: cv

Allowed types: PDF, DOC, DOCX
```

**Response 200:**
```json
{ "cv_url": "https://bucket.s3.amazonaws.com/applicants/<id>/cv/resume.pdf" }
```

### CV Download

```
GET /api/applicants/<id>/cv-download/
```

**Response 200:**
```json
{
    "download_url": "https://bucket.s3.amazonaws.com/...?X-Amz-Expires=3600...",
    "expires_in": 3600
}
```

**Rules:**
- Pre-signed URL is valid for **1 hour**
- Returns 404 if no CV has been uploaded

### Filters & Search

```
GET /api/applicants/?search=jane
GET /api/applicants/?country=US
GET /api/applicants/?ordering=-created_at
```

---

## 8. Recruitment — Work Experience

Work history entries belonging to an applicant. Returned nested inside `GET /api/applicants/<id>/` as well.

**Base URL:** `/api/work-experiences/`

**Auth required:** Yes — `view/add/change/delete_workexperience`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/work-experiences/` | List all entries |
| POST | `/api/work-experiences/` | Create an entry |
| GET | `/api/work-experiences/<id>/` | Retrieve |
| PUT | `/api/work-experiences/<id>/` | Full update |
| PATCH | `/api/work-experiences/<id>/` | Partial update |
| DELETE | `/api/work-experiences/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `applicant` | UUID | FK → Applicant — required |
| `applicant_name` | string | Read-only display |
| `company` | string | Required |
| `title` | string | Required |
| `location` | string | Optional |
| `start_date` | date | Required |
| `end_date` | date | Null if `is_current=true` |
| `is_current` | boolean | Default: false |
| `description` | string | Optional |

### Filters & Search

```
GET /api/work-experiences/?applicant=<uuid>
GET /api/work-experiences/?is_current=true
GET /api/work-experiences/?search=google
```

---

## 9. Recruitment — Jobs

Job openings. Can be internal (our company) or external (posted for another company).

**Base URL:** `/api/jobs/`

**Auth required:** Yes — `view/add/change/delete_job`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/jobs/` | List all jobs |
| POST | `/api/jobs/` | Create a job |
| GET | `/api/jobs/<id>/` | Retrieve |
| PUT | `/api/jobs/<id>/` | Full update |
| PATCH | `/api/jobs/<id>/` | Partial update |
| DELETE | `/api/jobs/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Auto-generated |
| `title` | string | Required |
| `description`, `requirements`, `responsibilities`, `benefits` | string | Optional |
| `is_internal` | boolean | `true` = our company, `false` = external |
| `position_ref` | string | **Internal:** UUID of a Position record. **External:** plain position name (e.g. "Senior React Developer") |
| `position_display` | string | Read-only — resolved at DB level via CASE/subquery. Always returns the human-readable name |
| `company_name` | string | Only for external jobs |
| `company_logo_url` | URL | Only for external jobs |
| `display_company` | string | Read-only — "CodeX Academy" for internal, `company_name` for external |
| `job_type` | choice | `full_time`, `part_time`, `contract`, `intern`, `temporary` |
| `location` | string | Optional |
| `is_remote` | boolean | Default: false |
| `salary_min`, `salary_max` | decimal | Optional |
| `salary_currency` | string | Default: USD |
| `headcount` | integer | Number of openings. Default: 1 |
| `status` | choice | `draft`, `open`, `paused`, `filled`, `cancelled` |
| `posted_date`, `closing_date` | date | Optional |
| `application_count` | integer | Read-only — total active applications |

### position_ref rules

```
Internal job  →  position_ref = "a3f8c2d1-4b5e-..."   (UUID from /api/positions/)
External job  →  position_ref = "Senior React Developer"  (free text)

position_display is resolved in the DB:
  CASE
    WHEN is_internal AND position_ref is a valid UUID
    THEN SELECT title FROM hr_positions WHERE id = position_ref::uuid
    ELSE position_ref
  END
```

### Filters & Search

```
GET /api/jobs/?status=open
GET /api/jobs/?is_internal=true
GET /api/jobs/?job_type=full_time
GET /api/jobs/?is_remote=true
GET /api/jobs/?search=react
GET /api/jobs/?ordering=-posted_date
```

---

## 10. Recruitment — Job Applications

Links an applicant to a job opening. Tracks the full hiring pipeline from application to hire or rejection.

**Base URL:** `/api/job-applications/`

**Auth required:** Yes — `view/add/change/delete_jobapplication`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/job-applications/` | List all applications |
| POST | `/api/job-applications/` | Create an application |
| GET | `/api/job-applications/<id>/` | Retrieve |
| PUT | `/api/job-applications/<id>/` | Full update |
| PATCH | `/api/job-applications/<id>/` | Partial update |
| DELETE | `/api/job-applications/<id>/` | Soft delete |
| POST | `/api/job-applications/<id>/advance-stage/` | Move to next pipeline stage |
| POST | `/api/job-applications/<id>/convert-to-employee/` | Convert hired applicant to Employee |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `applicant` | UUID | FK → Applicant |
| `applicant_name`, `applicant_email`, `applicant_photo_url` | string | Read-only display |
| `job` | UUID | FK → Job |
| `job_title`, `job_company` | string | Read-only display |
| `stage` | choice | See pipeline below |
| `stage_updated_at` | datetime | Read-only |
| `stage_updated_by` | string | Read-only |
| `cover_letter` | string | Optional |
| `offered_salary` | decimal | Optional — fill when `stage=offer_sent` |
| `offer_date`, `offer_expiry_date` | date | Optional |
| `rejection_reason` | string | Optional |
| `hire_date` | date | Optional — fill when `stage=hired` |
| `internal_notes` | string | HR-only notes |
| `is_closed` | boolean | Read-only — true when stage is `hired`, `rejected`, or `withdrawn` |
| `converted_employee_id` | UUID | Read-only — set after `convert-to-employee` |

**Constraint:** One applicant can only apply once per job (`unique_together: applicant + job`).

### Pipeline Stages

```
applied → screening → phone_interview → interview → technical_test
       → background_check → offer_sent → hired  ✓
                                        → rejected ✗
                                        → withdrawn ✗
```

Terminal stages (`hired`, `rejected`, `withdrawn`) cannot be changed further.

### Advance Stage

```
POST /api/job-applications/<id>/advance-stage/
```

**Request body:**
```json
{
    "stage": "interview",
    "notes": "Strong technical background, moving forward."
}
```

**Rules:**
- `stage` must be a valid choice
- Cannot transition from a terminal stage (`hired`, `rejected`, `withdrawn`)
- Notes are appended to `internal_notes` with timestamp and username

**Response 200:** Full application object with updated stage.

### Convert to Employee

```
POST /api/job-applications/<id>/convert-to-employee/
```

**Rules:**
- Application must be in `hired` stage
- Job must be `is_internal=true`
- Cannot convert the same application twice

**This also happens automatically via signal** when the stage is set to `hired` on an internal job. Use this endpoint only if the automatic conversion failed.

**Response 201:**
```json
{
    "detail": "Applicant successfully converted to Employee.",
    "employee_id": "a3f8c2d1-...",
    "employee_code": "EMP-A3F8C2D1"
}
```

### Filters & Search

```
GET /api/job-applications/?applicant=<uuid>
GET /api/job-applications/?job=<uuid>
GET /api/job-applications/?stage=interview
GET /api/job-applications/?search=jane
GET /api/job-applications/?ordering=-created_at
```

---

## 11. Recruitment — Interviews

Individual interview sessions. Can be linked to a job application or stand alone.

**Base URL:** `/api/interviews/`

**Auth required:** Yes — `view/add/change/delete_interview`

### Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/interviews/` | List all interviews |
| POST | `/api/interviews/` | Schedule an interview |
| GET | `/api/interviews/<id>/` | Retrieve |
| PUT | `/api/interviews/<id>/` | Full update |
| PATCH | `/api/interviews/<id>/` | Partial update |
| DELETE | `/api/interviews/<id>/` | Soft delete |

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `application` | UUID | FK → JobApplication — **optional** (null allowed) |
| `applicant_name` | string | Read-only display — null if no application linked |
| `job_title` | string | Read-only display — null if no application linked |
| `interviewer` | UUID | FK → Employee — optional |
| `interviewer_name` | string | Read-only display |
| `interview_type` | choice | `phone_screen`, `video`, `technical`, `panel`, `on_site`, `final` |
| `scheduled_at` | datetime | Required |
| `duration_minutes` | integer | Optional |
| `outcome` | choice | `pending`, `passed`, `failed`, `no_show`, `rescheduled` — default: `pending` |
| `comments` | string | Interviewer comments |
| `results` | string | Evaluation results text |
| `recording_url` | URL | Link to the recorded video session |

### Filters & Search

```
GET /api/interviews/?application=<uuid>
GET /api/interviews/?interviewer=<uuid>
GET /api/interviews/?interview_type=technical
GET /api/interviews/?outcome=pending
GET /api/interviews/?search=jane
GET /api/interviews/?ordering=scheduled_at
```

---

## 12. Common Behaviors

### Pagination

All list endpoints are paginated. Default page size: **100 records**.

```
GET /api/employees/?page=2
```

**Response structure:**
```json
{
    "count": 250,
    "next": "http://localhost:8000/api/employees/?page=3",
    "previous": "http://localhost:8000/api/employees/?page=1",
    "results": [...]
}
```

### Soft Delete

No record is ever permanently deleted. A `DELETE` request sets `is_deleted=true` and records `deleted_at` and `deleted_by`. Soft-deleted records are excluded from all list and retrieve responses. Use `Model.all_objects` at the ORM level to access them if needed.

### Audit Trail

Every record automatically tracks:

| Field | Description |
|-------|-------------|
| `created_at` | Timestamp of creation — never changes |
| `updated_at` | Timestamp of last update |
| `created_by` | Username who created the record |
| `updated_by` | Username who last modified the record |
| `deleted_at` | Timestamp of soft delete |
| `deleted_by` | Username who soft-deleted the record |

Additionally, `django-auditlog` writes a full diff of every change to the `auditlog_logentry` table, viewable at `/admin/auditlog/logentry/`.

### Rate Limiting

| User type | Limit |
|-----------|-------|
| Unauthenticated | 20 requests / minute |
| Authenticated | 300 requests / minute |

### Error Response Format

```json
{
    "field_name": ["Error message for this field."],
    "non_field_errors": ["General error message."],
    "detail": "Single error string (used by auth errors)."
}
```

### Token Expiration

Tokens expire after `AUTH_TOKEN_MAX_AGE_HOURS` hours (default: 24). An expired token returns:

```json
HTTP 401
{ "detail": "Token has expired. Please log in again." }
```
