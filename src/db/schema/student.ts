import {
    sqliteTable,
    integer,
    text,
} from 'drizzle-orm/sqlite-core';

export const students = sqliteTable('students', {

    id : integer('id').primaryKey({ autoIncrement: true }),

    firstName : text('first_name').notNull(),

    lastName : text('last_name').notNull(),

    studentId : text('student_id').notNull(),

    birthDate : text('birth_date').notNull(),

    gender : text('gender', {
        enum: ['male', 'female', 'other'],
    }).notNull(),

    createdAt : text('created_at')
    .notNull()
    .$default(() => new Date().toISOString()),

    updatedAt : text('updated_at')
    .notNull()
    .$default(() => new Date().toISOString())

});

export const schema = { students };