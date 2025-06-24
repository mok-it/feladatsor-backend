
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

export enum ExerciseHistoryFieldType {
    TEXT = "TEXT",
    ARRAY = "ARRAY",
    BOOLEAN = "BOOLEAN",
    JSON = "JSON",
    IMAGE = "IMAGE",
    ENUM = "ENUM"
}

export enum ExerciseCheckFilter {
    NEEDS_TO_BE_CHECKED = "NEEDS_TO_BE_CHECKED",
    GOOD = "GOOD",
    CHANGE_REQUIRED = "CHANGE_REQUIRED",
    TO_DELETE = "TO_DELETE"
}

export enum OrderDirection {
    ASC = "ASC",
    DESC = "DESC"
}

export enum ExerciseStatus {
    DRAFT = "DRAFT",
    CREATED = "CREATED",
    APPROVED = "APPROVED",
    DELETED = "DELETED"
}

export enum AlertSeverity {
    SUCCESS = "SUCCESS",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
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
    comment?: Nullable<string>;
    contributors?: Nullable<string[]>;
}

export interface ExerciseSheetInput {
    name: string;
    sheetItems?: Nullable<ExerciseSheetItemInput[]>;
}

export interface UpdateExerciseSheetInput {
    name?: Nullable<string>;
    sheetItems?: Nullable<ExerciseSheetItemInput[]>;
    talonItems?: Nullable<OrderedExerciseInput[]>;
}

export interface ExerciseSheetItemInput {
    ageGroup: ExerciseAgeGroup;
    level: number;
    exercises: OrderedExerciseInput[];
}

export interface OrderedExerciseInput {
    exerciseID: string;
    order: number;
}

export interface SameLogicExerciseGroupInput {
    description?: Nullable<string>;
}

export interface ExerciseSearchQuery {
    skip: number;
    take: number;
    queryStr?: Nullable<string>;
    isCompetitionFinal?: Nullable<boolean>;
    difficulty?: Nullable<ExerciseDifficultyRange[]>;
    exerciseCheck?: Nullable<ExerciseCheckFilter>;
    orderBy?: Nullable<string>;
    orderDirection?: Nullable<OrderDirection>;
    includeTags?: Nullable<string[]>;
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
    alert?: Nullable<ExerciseAlertInput>;
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
    contributors?: Nullable<string[]>;
    sameLogicGroup?: Nullable<string>;
    isCompetitionFinal?: Nullable<boolean>;
}

export interface ExerciseUpdateInput {
    tags?: Nullable<string[]>;
    status?: Nullable<ExerciseStatus>;
    alert?: Nullable<ExerciseAlertInput>;
    description?: Nullable<string>;
    exerciseImage?: Nullable<string>;
    solution?: Nullable<string>;
    solutionImage?: Nullable<string>;
    solveIdea?: Nullable<string>;
    solveIdeaImage?: Nullable<string>;
    helpingQuestions?: Nullable<string[]>;
    solutionOptions?: Nullable<string[]>;
    source?: Nullable<string>;
    difficulty?: Nullable<ExerciseDifficultyInput[]>;
    contributors?: Nullable<string[]>;
    sameLogicGroup?: Nullable<string>;
    isCompetitionFinal?: Nullable<boolean>;
    comment?: Nullable<string>;
}

export interface ExerciseAlertInput {
    severity: AlertSeverity;
    description: string;
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
    email?: Nullable<string>;
    password?: Nullable<string>;
    name?: Nullable<string>;
    userName?: Nullable<string>;
    customAvatarId?: Nullable<string>;
}

export interface IMutation {
    login(name: string, password: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    loginWithGoogle(googleToken: string): Nullable<LoginResponse> | Promise<Nullable<LoginResponse>>;
    exportExcel(): Nullable<ExportResult> | Promise<Nullable<ExportResult>>;
    createExerciseCheck(data: ExerciseCheckInput): ExerciseCheck | Promise<ExerciseCheck>;
    createExerciseComment(exerciseId: string, comment: string, contributors?: Nullable<string[]>): ExerciseComment | Promise<ExerciseComment>;
    updateExerciseComment(id: string, comment: string, contributors?: Nullable<string[]>): ExerciseComment | Promise<ExerciseComment>;
    deleteExerciseComment(id: string): ExerciseComment | Promise<ExerciseComment>;
    createExerciseSheet(sheetData: ExerciseSheetInput): ExerciseSheet | Promise<ExerciseSheet>;
    updateExerciseSheet(id: string, sheetData: UpdateExerciseSheetInput): ExerciseSheet | Promise<ExerciseSheet>;
    deleteExerciseSheet(id: string): boolean | Promise<boolean>;
    createSameLogicExerciseGroup(data?: Nullable<SameLogicExerciseGroupInput>): SameLogicExerciseGroup | Promise<SameLogicExerciseGroup>;
    createExerciseTag(name: string, parentId?: Nullable<string>): ExerciseTag | Promise<ExerciseTag>;
    updateExerciseTag(id: string, name: string): ExerciseTag | Promise<ExerciseTag>;
    deleteExerciseTag(id: string): boolean | Promise<boolean>;
    createExercise(input: ExerciseInput): Exercise | Promise<Exercise>;
    cloneExerciseToNew(id: string): Exercise | Promise<Exercise>;
    updateExercise(id: string, input: ExerciseUpdateInput): Exercise | Promise<Exercise>;
    voteOnDeveloper(id: string): Nullable<Developer> | Promise<Nullable<Developer>>;
    register(data: UserRegisterInput): User | Promise<User>;
    changePermissions(userId: string, permissions: Role[]): User | Promise<User>;
    updateUser(data: UserUpdateInput, id?: Nullable<string>): User | Promise<User>;
}

export interface ExportResult {
    url: string;
}

export interface ExerciseCheck {
    id: string;
    role: ExerciseCheckRole;
    exercise: Exercise;
    user: User;
    contributors: User[];
    type: ExerciseCheckType;
    createdAt: string;
    updatedAt: string;
}

export interface IQuery {
    exerciseComment(id: string): Nullable<ExerciseComment> | Promise<Nullable<ExerciseComment>>;
    commentsByExercise(id: string): ExerciseComment[] | Promise<ExerciseComment[]>;
    exerciseSheets(): ExerciseSheet[] | Promise<ExerciseSheet[]>;
    exerciseSheet(id: string): Nullable<ExerciseSheet> | Promise<Nullable<ExerciseSheet>>;
    sameLogicExerciseGroups(): SameLogicExerciseGroup[] | Promise<SameLogicExerciseGroup[]>;
    exerciseHistoryByExercise(id: string): ExerciseHistory[] | Promise<ExerciseHistory[]>;
    exerciseHistoryByField(exerciseId: string, field: string): ExerciseHistory[] | Promise<ExerciseHistory[]>;
    exerciseTags(): ExerciseTag[] | Promise<ExerciseTag[]>;
    exerciseTag(id: string): Nullable<ExerciseTag> | Promise<Nullable<ExerciseTag>>;
    flatExerciseTags(): ExerciseTag[] | Promise<ExerciseTag[]>;
    searchExercises(query?: Nullable<ExerciseSearchQuery>): ExerciseSearchResult | Promise<ExerciseSearchResult>;
    exercises(take: number, skip: number): Exercise[] | Promise<Exercise[]>;
    exercisesCount(): number | Promise<number>;
    exercise(id: string): Nullable<Exercise> | Promise<Nullable<Exercise>>;
    funkyPool(): Developer[] | Promise<Developer[]>;
    globalStats(): Nullable<GlobalStats> | Promise<Nullable<GlobalStats>>;
    users(): User[] | Promise<User[]>;
    user(id: string): Nullable<User> | Promise<Nullable<User>>;
}

export interface ExerciseComment {
    id: string;
    createdBy: User;
    contributors: User[];
    comment: string;
    createdAt: string;
    updatedAt: string;
    user: User;
}

export interface ExerciseSheet {
    id: string;
    name: string;
    sheetItems: ExerciseSheetItem[];
    talonItems: OrderedExercise[];
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseSheetItem {
    id: string;
    ageGroup: ExerciseAgeGroup;
    level: number;
    exercises: OrderedExercise[];
}

export interface OrderedExercise {
    order: number;
    exercise: Exercise;
}

export interface SameLogicExerciseGroup {
    id: string;
    exercises: Exercise[];
    description?: Nullable<string>;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface HistoryStringValue {
    value: string;
}

export interface ExerciseHistory {
    id: string;
    exercise: Exercise;
    field: string;
    oldValue?: Nullable<HistoryValue>;
    newValue?: Nullable<HistoryValue>;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
    fieldType: ExerciseHistoryFieldType;
}

export interface ExerciseTag {
    id: string;
    name: string;
    parent?: Nullable<ExerciseTag>;
    children: ExerciseTag[];
    exerciseCount: number;
}

export interface ExerciseSearchResult {
    exercises: Exercise[];
    totalCount: number;
}

export interface Exercise {
    id: string;
    tags: Tag[];
    status: ExerciseStatus;
    alert?: Nullable<ExerciseAlert>;
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
    sameLogicExerciseGroup?: Nullable<SameLogicExerciseGroup>;
    checks: ExerciseCheck[];
    comments: ExerciseComment[];
    isCompetitionFinal?: Nullable<boolean>;
    createdBy: User;
    contributors: User[];
    createdAt: string;
    updatedAt: string;
}

export interface ExerciseAlert {
    severity: AlertSeverity;
    description: string;
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

export interface Developer {
    id: string;
    name: string;
    count: number;
}

export interface Image {
    id: string;
    url: string;
}

export interface GlobalStats {
    userLeaderboard: LeaderBoardUser[];
    exerciseHourlyCount: ExerciseHourlyGroup[];
    totalExerciseCount: number;
    checkedExerciseCount: number;
    contributionCalendar: ContributionCalendar;
}

export interface ContributionCalendar {
    fromDate: string;
    toDate: string;
    data: ContributionCalendarDay[];
}

export interface ContributionCalendarDay {
    date: string;
    count: number;
    level: number;
}

export interface ExerciseHourlyGroup {
    hour: string;
    count: number;
}

export interface LeaderBoardUser {
    user: User;
    rank: number;
    submittedExerciseCount: number;
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
    stats: UserStats;
    comments: ExerciseComment[];
    avatarUrl?: Nullable<string>;
}

export interface UserStats {
    totalExerciseCount: number;
    checkedExerciseCount: number;
    contributionCalendar: ContributionCalendar;
}

export type HistoryValue = Image | HistoryStringValue;
type Nullable<T> = T | null;
