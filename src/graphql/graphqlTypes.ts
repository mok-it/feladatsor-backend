
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ExerciseCheckType {
    GOOD = "GOOD",
    CHANGE_REQUIRED = "CHANGE_REQUIRED",
    TO_DELETE = "TO_DELETE"
}

export enum ExerciseCheckRole {
    EXAMINER = "EXAMINER",
    PROFESSIONAL = "PROFESSIONAL",
    LECTOR = "LECTOR"
}

export enum ExerciseStatus {
    DRAFT = "DRAFT",
    CREATED = "CREATED",
    APPROVED = "APPROVED",
    DELETED = "DELETED"
}

export enum ExerciseAgeGroup {
    KOALA = "KOALA",
    MEDVEBOCS = "MEDVEBOCS",
    KISMEDVE = "KISMEDVE",
    NAGYMEDVE = "NAGYMEDVE",
    JEGESMEDVE = "JEGESMEDVE"
}

export interface ExerciseCheckInput {
    exerciseId: string;
    type: ExerciseCheckType;
}

export interface ExerciseSearchQuery {
    queryStr?: Nullable<string>;
}

export interface ExerciseInput {
    id?: Nullable<string>;
    tags: Nullable<string>[];
    status: ExerciseStatus;
    description: string;
    exerciseImage?: Nullable<string>;
    solution: string;
    solveIdea?: Nullable<string>;
    elaboration?: Nullable<string>;
    elaborationImage?: Nullable<string>;
    helpingQuestions: string[];
    solutionOptions: string[];
    source?: Nullable<string>;
    difficulty: ExerciseDifficultyInput[];
    alternativeDifficultyParent?: Nullable<string>;
    sameLogicParent?: Nullable<string>;
    isCompetitionFinal?: Nullable<boolean>;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseDifficultyInput {
    ageGroup: ExerciseAgeGroup;
    difficulty: number;
}

export interface UserRegisterInput {
    email: string;
    password: string;
    name: string;
    userName: string;
}

export interface IMutation {
    login(name: string, password: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    loginWithGoogle(googleToken: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    createExerciseCheck(data: ExerciseCheckInput): ExerciseCheck | Promise<ExerciseCheck>;
    createExercise(input: ExerciseInput): Exercise | Promise<Exercise>;
    register(data: UserRegisterInput): User | Promise<User>;
}

export interface ExerciseCheck {
    id: string;
    role: ExerciseCheckRole;
    exercise: Exercise;
    user: User;
    type: ExerciseCheckType;
    createdAt: string;
    updatedAt: string;
}

export interface IQuery {
    searchExercises(query?: Nullable<ExerciseSearchQuery>): Exercise[] | Promise<Exercise[]>;
    exercises(take: number, skip: number): Exercise[] | Promise<Exercise[]>;
    exercisesCount(): number | Promise<number>;
    exercise(id: string): Nullable<Exercise> | Promise<Nullable<Exercise>>;
    users(): User[] | Promise<User[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export interface Exercise {
    id: string;
    tags: Tag[];
    status: ExerciseStatus;
    description: string;
    exerciseImage?: Nullable<string>;
    solution: string;
    solveIdea?: Nullable<string>;
    elaboration?: Nullable<string>;
    elaborationImage?: Nullable<string>;
    helpingQuestions: string[];
    solutionOptions: string[];
    source?: Nullable<string>;
    difficulty: ExerciseDifficulty[];
    history: ExerciseHistory[];
    alternativeDifficultyExercises: Exercise[];
    sameLogicExercises: Exercise[];
    checks: ExerciseCheck[];
    comments: ExerciseComment[];
    isCompetitionFinal?: Nullable<boolean>;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseComment {
    id: string;
    user: User;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface Tag {
    id: string;
    parent?: Nullable<Tag>;
    children: Tag[];
    exercises: Exercise[];
    name: string;
}

export interface ExerciseDifficulty {
    ageGroup: ExerciseAgeGroup;
    difficulty: number;
}

export interface ExerciseHistory {
    id: string;
    exercise: Exercise;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    email: string;
    name: string;
    userName: string;
    createdAt: string;
    updatedAt: string;
    exercises: Exercise[];
}

type Nullable<T> = T | null;
