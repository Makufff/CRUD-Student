import { eq } from "drizzle-orm";
import { createDb } from "../db/schema";
import { students } from "../db/schema/student";

export class StudentRepository {
  constructor(private db: ReturnType<typeof createDb>) {}

  async findAll() {
    return this.db
    .select()
    .from(students)
    .orderBy(students.id);
  }

  async findById(id: number) {
    const res = await this.db
      .select()
      .from(students)
      .where(eq(students.id, id))
      .limit(1);

    return res[0] ?? null;
  }

  async findByStudentId(studentId: string) {
    const res = await this.db
      .select()
      .from(students)
      .where(eq(students.studentId, studentId))
      .limit(1);

    return res[0] ?? null;
  }

  async create_student(data: typeof students.$inferInsert) {
    const res = await this.db.insert(students).values(data).returning();
    
    return res[0] ?? null;
  }

  async update_student(id: number, data: Partial<typeof students.$inferInsert>) {
    const res = await this.db
      .update(students)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(students.id, id))
      .returning();

    return res[0] ?? null;
  }

  async delete_student(id: number) {
    const res = await this.db.delete(students).where(eq(students.id, id)).returning();
    
    return res[0] ?? null;
  }
}
