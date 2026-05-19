import { AgeGroup, PrismaClient } from '@prisma/client';

type DifficultyMap = Partial<Record<AgeGroup, number>>;

const prisma = new PrismaClient();

async function findDuplicateGroups() {
  const all = await prisma.exerciseDifficulty.findMany({
    select: { exerciseId: true, ageGroup: true },
  });
  const counts = new Map<string, number>();
  for (const r of all) {
    const key = `${r.exerciseId}|${r.ageGroup}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, c]) => c > 1)
    .map(([key, count]) => {
      const [exerciseId, ageGroup] = key.split('|');
      return { exerciseId, ageGroup: ageGroup as AgeGroup, count };
    });
}

async function replayHistory(exerciseId: string): Promise<DifficultyMap> {
  const history = await prisma.exerciseHistory.findMany({
    where: { exerciseId, field: 'difficulty' },
    orderBy: { createdAt: 'asc' },
  });

  const merged: DifficultyMap = {};
  for (const row of history) {
    let parsed: Record<string, number>;
    try {
      parsed = JSON.parse(row.newValue);
    } catch {
      console.warn(
        `[warn] exercise ${exerciseId}: history row ${row.id} newValue not JSON, skipping`,
      );
      continue;
    }
    for (const [ageGroup, value] of Object.entries(parsed)) {
      if (Number.isInteger(value)) {
        merged[ageGroup as AgeGroup] = value;
      }
    }
  }
  return merged;
}

type ExerciseResolution = {
  exerciseId: string;
  canonicalByAgeGroup: Map<AgeGroup, number>;
};

type ConflictReport = {
  exerciseId: string;
  hasAnyDifficultyHistory: boolean;
  conflicts: Array<{
    ageGroup: AgeGroup;
    distinctValues: number[];
    chosen: number;
  }>;
};

async function preflight(
  duplicates: Awaited<ReturnType<typeof findDuplicateGroups>>,
) {
  const byExercise = new Map<string, Set<AgeGroup>>();
  for (const group of duplicates) {
    const set = byExercise.get(group.exerciseId) ?? new Set<AgeGroup>();
    set.add(group.ageGroup);
    byExercise.set(group.exerciseId, set);
  }

  const resolved: ExerciseResolution[] = [];
  const conflictReports: ConflictReport[] = [];

  for (const [exerciseId, dupedAgeGroups] of byExercise) {
    const history = await replayHistory(exerciseId);
    const hasAnyDifficultyHistory = Object.keys(history).length > 0;

    const canonicalByAgeGroup = new Map<AgeGroup, number>();
    const conflicts: ConflictReport['conflicts'] = [];

    const existing = await prisma.exerciseDifficulty.findMany({
      where: { exerciseId },
    });

    for (const ageGroup of dupedAgeGroups) {
      const fromHistory = history[ageGroup];
      if (fromHistory !== undefined) {
        canonicalByAgeGroup.set(ageGroup, fromHistory);
        continue;
      }
      // No history for this ageGroup — check if all duplicate rows agree.
      const rows = existing.filter((r) => r.ageGroup === ageGroup);
      const distinctValues = [...new Set(rows.map((r) => r.difficulty))];
      if (distinctValues.length === 1) {
        canonicalByAgeGroup.set(ageGroup, distinctValues[0]);
      } else {
        // Conflicting values + no history. Pick max so the migration proceeds;
        // log for operator review.
        const chosen = Math.max(...distinctValues);
        canonicalByAgeGroup.set(ageGroup, chosen);
        conflicts.push({ ageGroup, distinctValues, chosen });
      }
    }

    if (conflicts.length > 0) {
      conflictReports.push({ exerciseId, hasAnyDifficultyHistory, conflicts });
    }
    resolved.push({ exerciseId, canonicalByAgeGroup });
  }

  return { byExercise, resolved, conflictReports };
}

async function main() {
  console.log('[dedupe] Phase A — pre-flight check');
  const duplicates = await findDuplicateGroups();
  console.log(
    `[dedupe] Found ${duplicates.length} duplicate (exerciseId, ageGroup) groups`,
  );

  if (duplicates.length === 0) {
    console.log('[dedupe] Nothing to do. Exiting.');
    return;
  }

  const { byExercise, resolved, conflictReports } = await preflight(duplicates);
  console.log(`[dedupe] Affected exercises: ${byExercise.size}`);

  if (conflictReports.length > 0) {
    console.warn(
      `[dedupe] REVIEW REQUIRED: ${conflictReports.length} exercise(s) have duplicate difficulty rows with conflicting values and no ExerciseHistory to disambiguate. Picking max value; please review manually after migration:`,
    );
    for (const r of conflictReports) {
      for (const c of r.conflicts) {
        console.warn(
          `  - exerciseId=${r.exerciseId} ageGroup=${
            c.ageGroup
          } distinctValues=[${c.distinctValues.join(',')}] chosen=${
            c.chosen
          } hasAnyDifficultyHistory=${r.hasAnyDifficultyHistory}`,
        );
      }
    }
  }

  console.log('[dedupe] Phase B — applying canonical values');

  let totalDeleted = 0;
  let totalInserted = 0;

  for (const { exerciseId, canonicalByAgeGroup } of resolved) {
    const existing = await prisma.exerciseDifficulty.findMany({
      where: { exerciseId },
    });
    const before = existing.length;

    const rowsToInsert: {
      exerciseId: string;
      ageGroup: AgeGroup;
      difficulty: number;
    }[] = [];
    const existingAgeGroups = new Set(existing.map((r) => r.ageGroup));
    for (const ageGroup of existingAgeGroups) {
      const fromCanonical = canonicalByAgeGroup.get(ageGroup);
      if (fromCanonical !== undefined) {
        rowsToInsert.push({ exerciseId, ageGroup, difficulty: fromCanonical });
        continue;
      }
      // ageGroup was never duplicated and not in canonical map — preserve current.
      const sample = existing.find((r) => r.ageGroup === ageGroup);
      if (sample) {
        rowsToInsert.push({
          exerciseId,
          ageGroup,
          difficulty: sample.difficulty,
        });
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.exerciseDifficulty.deleteMany({ where: { exerciseId } });
      await tx.exerciseDifficulty.createMany({ data: rowsToInsert });
    });

    totalDeleted += before;
    totalInserted += rowsToInsert.length;
    console.log(
      `[dedupe] exerciseId=${exerciseId} before=${before} after=${
        rowsToInsert.length
      } values=${JSON.stringify(
        rowsToInsert.reduce<DifficultyMap>((acc, r) => {
          acc[r.ageGroup] = r.difficulty;
          return acc;
        }, {}),
      )}`,
    );
  }

  console.log(
    `[dedupe] Done. exercises=${
      resolved.length
    } rowsDeleted=${totalDeleted} rowsInserted=${totalInserted} conflictsResolvedByMax=${conflictReports.reduce(
      (sum, r) => sum + r.conflicts.length,
      0,
    )}`,
  );

  if (conflictReports.length > 0) {
    console.warn(
      `[dedupe] ${conflictReports.length} exercise(s) had conflicting duplicate values resolved by max. See REVIEW REQUIRED section above and verify those exercises manually.`,
    );
  }
}

main()
  .catch((err) => {
    console.error('[dedupe] Fatal error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
