import { StudentRepository } from "../repositories/student.repositories";
import type { CreateStudentInput, UpdateStudentInput } from "../validators/student";

export class StudentService {
  constructor(private repository: StudentRepository) {}

  async getAllStudents() {
    return this.repository.findAll();
  }

  async getStudentById(id: number) {
    const student = await this.repository.findById(id);

    if (!student) {
      throw new Error("ไม่พบข้อมูลนักเรียน ID :" + id);
    }

    return student;
  }

  async getStudentByStudentId(studentId: string) {
    const student = await this.repository.findByStudentId(studentId);

    if (!student) {
      throw new Error("ไม่พบข้อมูลนักเรียน รหัสนักเรียน :" + studentId);
    }

    return student;
  }

  async create_student(data: CreateStudentInput) {
    const existingStudent = await this.repository.findByStudentId(data.studentId);

    if (existingStudent) {
      throw new Error("มีรหัสนักเรียน " + data.studentId + " นี้อยู่แล้ว");
    }

    return this.repository.create_student(data);
  }

  async update_student(id: number, data: UpdateStudentInput) {
    const existingStudent = await this.repository.findById(id);

    if (!existingStudent) {
      throw new Error("ไม่พบข้อมูลนักเรียน ID :" + id);
    }

    return this.repository.update_student(id, data);
  }

  async delete_student(id: number) {
    const existingStudent = await this.repository.findById(id);

    if (!existingStudent) {
      throw new Error("ไม่พบข้อมูลนักเรียน ID :" + id);
    }

    return this.repository.delete_student(id);
  }
}
