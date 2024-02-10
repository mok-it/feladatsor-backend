
/*
 * -------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
/* eslint-disable */

export enum ExerciseAgeGroup {
    KOALA = "KOALA",
    MEDVEBOCS = "MEDVEBOCS",
    KISMEDVE = "KISMEDVE",
    NAGYMEDVE = "NAGYMEDVE",
    JEGESMEDVE = "JEGESMEDVE"
}

export enum ExerciseCheckType {
    GOOD = "GOOD",
    CHANGE_REQUIRED = "CHANGE_REQUIRED",
    TO_DELETE = "TO_DELETE"
}

export interface CreateDuckInput {
    exampleField?: Nullable<number>;
}

export interface UpdateDuckInput {
    id: number;
}

export interface ExerciseInput {
    name: string;
    description: string;
    exerciseImage?: Nullable<string>;
    solution: string;
    elaboration?: Nullable<string>;
    elaborationImage?: Nullable<string>;
    helpingQuestions: string[];
    source?: Nullable<string>;
}

export interface ExerciseCheckInput {
    exerciseId: string;
    type: ExerciseCheckType;
}

export interface UserRegisterInput {
    email: string;
    password: string;
    name: string;
    userName: string;
}

export interface IMutation {
    login(name: string, password: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    createDuck(createDuckInput: CreateDuckInput): Duck | Promise<Duck>;
    updateDuck(updateDuckInput: UpdateDuckInput): Duck | Promise<Duck>;
    removeDuck(id: number): Nullable<Duck> | Promise<Nullable<Duck>>;
    createExercise(input: ExerciseInput): Exercise | Promise<Exercise>;
    createExerciseCheck(data: ExerciseCheckInput): ExerciseCheck | Promise<ExerciseCheck>;
    register(data: UserRegisterInput): User | Promise<User>;
}

export interface Duck {
    exampleField?: Nullable<number>;
}

export interface IQuery {
    ducks(): Nullable<Duck>[] | Promise<Nullable<Duck>[]>;
    duck(id: number): Nullable<Duck> | Promise<Nullable<Duck>>;
    exercises(take: number, skip: number): Exercise[] | Promise<Exercise[]>;
    exercisesCount(): number | Promise<number>;
    exercise(id: string): Nullable<Exercise> | Promise<Nullable<Exercise>>;
    users(): User[] | Promise<User[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export interface Exercise {
    id: string;
    name: string;
    description: string;
    exerciseImage?: Nullable<string>;
    solution: string;
    elaboration?: Nullable<string>;
    elaborationImage?: Nullable<string>;
    helpingQuestions: string[];
    source?: Nullable<string>;
    difficulty: ExerciseDifficulty[];
    history: ExerciseHistory[];
    similarExercises: Exercise[];
    checks: ExerciseCheck[];
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseDifficulty {
    ageGroup: ExerciseAgeGroup;
    difficulty: number;
}

export interface ExerciseHistory {
    id: string;
    exercise: Exercise;
}

export interface ExerciseCheck {
    id: string;
    exercise: Exercise;
    user: User;
    type: ExerciseCheckType;
    createdAt: string;
    updatedAt: string;
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
