import { getRepository } from "typeorm";
import ExampleEntity from "../entities/ExampleEntity";

async function getExample(id: number): Promise<ExampleEntity> {
    return getRepository(ExampleEntity).findOne(id);
};

async function saveExample(example: ExampleEntity): Promise<ExampleEntity> {
    return getRepository(ExampleEntity).save(example);
}

export default {
    getExample,
    saveExample,
}