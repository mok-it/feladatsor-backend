-- Custom migration to convert maxExercisesPerLevel from Int to Int[] while preserving data

-- Step 1: Add new array column with a temporary name
ALTER TABLE "ExerciseSheet" ADD COLUMN "maxExercisesPerLevel_new" INTEGER[];

-- Step 2: Populate the array column by replicating the current value numberOfLevels times
-- This creates an array like [10, 10, 10, 10] if numberOfLevels is 4 and maxExercisesPerLevel is 10
UPDATE "ExerciseSheet"
SET "maxExercisesPerLevel_new" = (
  SELECT array_agg(elem)
  FROM generate_series(1, "numberOfLevels") s,
  LATERAL (SELECT "maxExercisesPerLevel" as elem) x
);

-- Step 3: Drop the old column
ALTER TABLE "ExerciseSheet" DROP COLUMN "maxExercisesPerLevel";

-- Step 4: Rename the new column to the original name
ALTER TABLE "ExerciseSheet" RENAME COLUMN "maxExercisesPerLevel_new" TO "maxExercisesPerLevel";

-- Step 5: Set default value for the new column
ALTER TABLE "ExerciseSheet" ALTER COLUMN "maxExercisesPerLevel" SET DEFAULT ARRAY[10, 10, 10, 10];

-- Step 6: Set NOT NULL constraint
ALTER TABLE "ExerciseSheet" ALTER COLUMN "maxExercisesPerLevel" SET NOT NULL;
