import {PrismaService} from "../PrismaService";
import {Prisma} from "@prisma/client";
import {faker} from "@faker-js/faker";

export async function seedTags(prisma: PrismaService) {

    const tagCount = 100;

    const tags: Prisma.ExerciseTagCreateManyInput[] = Array.from({length: Math.floor(tagCount / 2)}).map((_, i) => ({
        name: faker.word.adjective() + i
    }))

    await prisma.exerciseTag.createMany({data: tags})
    const createdTags = await prisma.exerciseTag.findMany({})

    const tagsWithParents: Prisma.ExerciseTagCreateManyInput[] = Array.from({length: Math.floor(tagCount / 2)}).map((_, i) => ({
        name: faker.word.adjective() + (i + Math.floor(tagCount / 2)),
        parentExerciseTagId: faker.helpers.arrayElement(createdTags).id
    }))

    await prisma.exerciseTag.createMany({data: tagsWithParents})
}