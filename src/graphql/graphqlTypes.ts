
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

export enum Role {
    ADMIN = "ADMIN",
    USER = "USER"
}

export interface ExerciseCheckInput {
    exerciseId: string;
    type: ExerciseCheckType;
}

export interface ExerciseSearchQuery {
    skip: number;
    take: number;
    queryStr?: Nullable<string>;
    difficulty?: Nullable<ExerciseDifficultyRange[]>;
    tags?: Nullable<string[]>;
    excludeTags?: Nullable<string[]>;
}

export interface ExerciseDifficultyRange {
    ageGroup: ExerciseAgeGroup;
    min?: Nullable<number>;
    max?: Nullable<number>;
}

export interface ExerciseInput {
    tags: Nullable<string>[];
    status: ExerciseStatus;
    description: string;
    exerciseImage?: Nullable<string>;
    solution: string;
    solutionImage?: Nullable<string>;
    solveIdea?: Nullable<string>;
    solveIdeaImage?: Nullable<string>;
    helpingQuestions: string[];
    solutionOptions: string[];
    source?: Nullable<string>;
    difficulty: ExerciseDifficultyInput[];
    alternativeDifficultyParent?: Nullable<string>;
    sameLogicParent?: Nullable<string>;
    isCompetitionFinal?: Nullable<boolean>;
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

export interface UserUpdateInput {
    id: string;
    email?: Nullable<string>;
    password?: Nullable<string>;
    name?: Nullable<string>;
    customAvatarId?: Nullable<string>;
}

export interface IMutation {
    login(name: string, password: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    loginWithGoogle(googleToken: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    createExerciseCheck(data: ExerciseCheckInput): ExerciseCheck | Promise<ExerciseCheck>;
    createExerciseComment(exerciseId: string, comment: string): ExerciseComment | Promise<ExerciseComment>;
    updateExerciseComment(id: string, comment: string): ExerciseComment | Promise<ExerciseComment>;
    deleteExerciseComment(id: string): ExerciseComment | Promise<ExerciseComment>;
    createExerciseTag(name: string, parentId?: Nullable<string>): ExerciseTag | Promise<ExerciseTag>;
    updateExerciseTag(id: string, name: string): ExerciseTag | Promise<ExerciseTag>;
    deleteExerciseTag(id: string): boolean | Promise<boolean>;
    createExercise(input: ExerciseInput): Exercise | Promise<Exercise>;
    updateExercise(id: string, input: ExerciseInput): Exercise | Promise<Exercise>;
    register(data: UserRegisterInput): User | Promise<User>;
    changePermissions(userId: string, permissions: Role[]): User | Promise<User>;
    updateUser(data: UserUpdateInput): User | Promise<User>;
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
    exerciseComment(id: string): Nullable<ExerciseComment> | Promise<Nullable<ExerciseComment>>;
    commentsByExercise(id: string): ExerciseComment[] | Promise<ExerciseComment[]>;
    exerciseTags(): ExerciseTag[] | Promise<ExerciseTag[]>;
    exerciseTag(id: string): Nullable<ExerciseTag> | Promise<Nullable<ExerciseTag>>;
    searchExercises(query?: Nullable<ExerciseSearchQuery>): ExerciseSearchResult | Promise<ExerciseSearchResult>;
    exercises(take: number, skip: number): Exercise[] | Promise<Exercise[]>;
    exercisesCount(): number | Promise<number>;
    exercise(id: string): Nullable<Exercise> | Promise<Nullable<Exercise>>;
    users(): User[] | Promise<User[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export interface ExerciseComment {
    id: string;
    createdBy: User;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user: User;
}

export interface ExerciseTag {
    id: string;
    name: string;
    parent?: Nullable<ExerciseTag>;
    children: ExerciseTag[];
}

export interface ExerciseSearchResult {
    exercises: Exercise[];
    totalCount: number;
}

export interface Exercise {
    id: string;
    tags: Tag[];
    status: ExerciseStatus;
    description: string;
    exerciseImage?: Nullable<Image>;
    solution: string;
    solutionImage?: Nullable<Image>;
    solveIdea?: Nullable<string>;
    solveIdeaImage?: Nullable<Image>;
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

export interface Image {
    id: string;
    url: string;
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
    roles: Role[];
}

type Nullable<T> = T | null;
