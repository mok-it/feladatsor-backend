# Fronted requirements for authorization

The JWT token contains a list of roles the logged-in user has.

We should use these roles to restrict the usage of the page. Do not even show the given menu to the user if she/he doesn't have the proper access rights.

Preferably, this should be done with a custom hook and/or component that could be easily used across different levels of the application.

We want to restrict the usage of specific routes at the Router level.
We want to restrict the usage/rendering of specific components at the component level.

```react
<ProtectedComponent roles=['ROLE-1']>
   [..Will be hidden if you don't have the given role...]
</ProtectedComponent>
```

The type of roles should be used from GraphQL


# ACCESS CONTROL

This document outlines all access control rules in the Medve Matek backend application for frontend developers.

## Authentication Overview

The application uses JWT tokens with Firebase authentication and role-based access control (RBAC). All endpoints require authentication unless explicitly marked as public.

### Authentication Flow

1. **Login Methods**:
   - Username/Password: `login(name: String!, password: String!)`
   - Google OAuth: `loginWithGoogle(googleToken: String!)`
   - Both return JWT token and user object

2. **Token Usage**:
   - Include in `Authorization: Bearer <token>` header
   - Default expiration: 60 seconds
   - Handle 401 responses by redirecting to login

## Role System

### Available Roles

```typescript
enum Role {
  USER                     // Submit new exercises, list own exercises
  LIST_EXERCISES          // List all exercises
  CHECK_EXERCISE          // Check/review exercises
  CLONE_EXERCISE          // Clone exercises
  FINALIZE_EXERCISE       // Change exercise status to DELETED or APPROVED
  EXERCISE_SHEET          // View and manipulate exercise sheets
  PROOFREAD_EXERCISE_SHEET // Add comments to exercise sheets
  ADMIN                   // Bypass all role checks, can do anything
}
```

### Admin Override

Users with `ADMIN` role can access **any endpoint** regardless of other role requirements.

## Public Endpoints (No Authentication Required)

### Authentication
- `mutation login(name: String!, password: String!)`
- `mutation loginWithGoogle(googleToken: String!)`
- `mutation register(data: UserRegisterInput!)`

### Health Checks
- `GET /health/liveness`
- `GET /health/readiness`

### Special Public Endpoints
- `query funkyPool()`
- `mutation voteOnDeveloper(id: String!)`

## Protected Endpoints by Role

### USER Role Required
- `mutation createExercise(input: ExerciseInput!)`
- `mutation updateExercise(id: String!, input: ExerciseUpdateInput!)`
  - *Note: Cannot set status to `APPROVED` or `DELETED` without `FINALIZE_EXERCISE` role*
- `mutation createExerciseComment(exerciseId: String!, comment: String!)`
- `mutation updateExerciseComment(id: String!, comment: String!)`
- `mutation deleteExerciseComment(id: String!)`
- `query users()` - List all users

### LIST_EXERCISES Role Required
- `query exercises(take: Int!, skip: Int!)`
- `query exercisesCount()`

### CHECK_EXERCISE Role Required
- `mutation createExerciseCheck(data: ExerciseCheckInput!)`

### CLONE_EXERCISE Role Required
- `mutation cloneExerciseToNew(id: String!, contributors: [String!]!)`

### EXERCISE_SHEET Role Required
- `query exerciseSheets()`
- `query exerciseSheet(id: String!)`
- `mutation createExerciseSheet(sheetData: ExerciseSheetInput!)`
- `mutation updateExerciseSheet(id: String!, sheetData: UpdateExerciseSheetInput!)`

### PROOFREAD_EXERCISE_SHEET Role Required
- `mutation deleteExerciseSheet(id: String!)`

### ADMIN Role Required
- `mutation changePermissions(userId: String!, permissions: [Role!]!)`
- `mutation exportExcel()`
- `query listExcelExports()`
- `mutation deleteExcelExport(exportId: String!)`
- `POST /load-old-excel/load` (file upload endpoint)

## Special Authorization Rules

### Exercise Access Control

1. **Individual Exercise Access** (`query exercise(id: String!)`):
   - Users with `USER` role or higher: Can access any exercise
   - Users without `USER` role: Can only access exercises they created or contributed to

2. **Exercise Search** (`query searchExercises(query: ExerciseSearchQuery!)`):
   - Users with `USER` or `LIST_EXERCISES` roles: Can search all exercises
   - Users without these roles: Can only search exercises they created

3. **User Profile Updates** (`mutation updateUser`):
   - Users can update their own profile
   - Only `ADMIN` users can update other users' profiles

### Authenticated-Only Endpoints (No Specific Role Required)

These require valid JWT token but no specific roles:
- `query user(id: String!)`
- `query me()`
- `query exerciseComment(id: String!)`
- `query commentsByExercise(id: String!)`
- `POST /image/upload` - File upload endpoint

## Frontend Implementation Guidelines

### Role-Based UI Components

```typescript
// Example role checking functions
function canAccessExercises(userRoles: Role[]): boolean {
  return userRoles.includes('LIST_EXERCISES') || userRoles.includes('ADMIN');
}

function canCheckExercises(userRoles: Role[]): boolean {
  return userRoles.includes('CHECK_EXERCISE') || userRoles.includes('ADMIN');
}

function canManageExerciseSheets(userRoles: Role[]): boolean {
  return userRoles.includes('EXERCISE_SHEET') || userRoles.includes('ADMIN');
}

function canFinalizeExercises(userRoles: Role[]): boolean {
  return userRoles.includes('FINALIZE_EXERCISE') || userRoles.includes('ADMIN');
}

function isAdmin(userRoles: Role[]): boolean {
  return userRoles.includes('ADMIN');
}
```

### Error Handling

- **401 Unauthorized**: Invalid or missing token → Redirect to login
- **403 Forbidden**: Valid token but insufficient permissions → Show access denied message

### UI Visibility Guidelines

Based on user roles, show/hide UI elements:

- **Navigation**: Only show exercise listing if user has `LIST_EXERCISES` or `ADMIN`
- **Exercise Actions**: Only show clone button if user has `CLONE_EXERCISE` or `ADMIN`
- **Exercise Status**: Only show approve/delete options if user has `FINALIZE_EXERCISE` or `ADMIN`
  -  *Note: Gray out `APPROVED` and `DELETED` options if the user don't have access*
- **Admin Panel**: Only show if user has `ADMIN` role
- **Exercise Sheets**: Only show if user has `EXERCISE_SHEET` or `ADMIN`

### Development Mode

When `DISABLE_JWT_VALIDATION=true` environment variable is set:
- All authentication and authorization checks are bypassed
- Should only be used in development environments

## Summary

The access control system is hierarchical with `ADMIN` having universal access. Most operations require at least `USER` role, with specific roles required for advanced operations like checking exercises, managing sheets, and administrative functions.
