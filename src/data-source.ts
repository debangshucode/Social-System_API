import 'reflect-metadata';
import * as dotenv from 'dotenv'
import { DataSource } from 'typeorm';

dotenv.config()

export const AppDataSource = new DataSource({
    type:'postgres',

    url:process.env.DATABASE_URL || undefined,

    host: process.env.DATABASE_URL ? undefined : process.env.DB_HOST,
    port: process.env.DATABASE_URL ? undefined : Number(process.env.DB_PORT),
    username: process.env.DATABASE_URL ? undefined : process.env.DB_USERNAME,
    password: process.env.DATABASE_URL ? undefined : process.env.DB_PASSWORD,
    database: process.env.DATABASE_URL ? undefined : process.env.DB_NAME,

    ssl: process.env.DATABASE_URL ?
    {rejectUnauthorized:false} :false,

    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../db/migrations/*{.ts,.js}'],

    synchronize:false

})