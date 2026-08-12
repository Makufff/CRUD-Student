import type { Context } from "hono";
import { createDb } from "../db/schema";
import { StudentRepository } from "../repositories/student.repositories";
import { StudentService } from "../services/student.services";
import type { AppEnv } from "../types/env";
import { createStudentSchema, updateStudentSchema } from "../validators/student";

const getStudentService = (c: Context<AppEnv>) => {
  const db = c.env?.DB;

  if (!db) {
    throw new Error("D1 database is not configured");
  }

  const repository = new StudentRepository(createDb(db));
  return new StudentService(repository);
};

export const getStudents = async (c: Context<AppEnv>) => {
  try {
    const service = getStudentService(c);
    const students = await service.getAllStudents();

    return c.json({ success: true, data: students });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot fetch students",
      },
      500,
    );
  }
};

export const getStudentById = async (c: Context<AppEnv>) => {
  try {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: "Invalid student ID" }, 400);
    }

    const service = getStudentService(c);
    const student = await service.getStudentById(id);
    return c.json({ success: true, data: student });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot fetch student",
      },
      error instanceof Error && error.message.includes("ไม่พบ") ? 404 : 500,
    );
  }
};

export const getStudentByStudentId = async (c: Context<AppEnv>) => {
  try {
    const studentId = c.req.param("studentId");

    if (!studentId || studentId.trim().length === 0) {
      return c.json({ success: false, message: "Invalid student ID" }, 400);
    }

    const service = getStudentService(c);
    const student = await service.getStudentByStudentId(studentId);
    return c.json({ success: true, data: student });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot fetch student",
      },
      error instanceof Error && error.message.includes("ไม่พบ") ? 404 : 500,
    );
  }
};

export const createStudent = async (c: Context<AppEnv>) => {
  try {
    const body = await c.req.json().catch(() => null);
    const parsed = createStudentSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: "Invalid request body",
          errors: parsed.error.flatten(),
        },
        400,
      );
    }

    const service = getStudentService(c);
    const student = await service.create_student(parsed.data);

    return c.json({ success: true, data: student }, 201);
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot create student",
      },
      400,
    );
  }
};

export const updateStudent = async (c: Context<AppEnv>) => {
  try {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: "Invalid student ID" }, 400);
    }

    const body = await c.req.json().catch(() => null);
    const parsed = updateStudentSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: "Invalid request body",
          errors: parsed.error.flatten(),
        },
        400,
      );
    }

    const service = getStudentService(c);
    const student = await service.update_student(id, parsed.data);

    return c.json({ success: true, data: student });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot update student",
      },
      error instanceof Error && error.message.includes("ไม่พบ") ? 404 : 400,
    );
  }
};

export const deleteStudent = async (c: Context<AppEnv>) => {
  try {
    const id = Number(c.req.param("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return c.json({ success: false, message: "Invalid student ID" }, 400);
    }

    const service = getStudentService(c);
    const student = await service.delete_student(id);

    return c.json({ success: true, data: student });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Cannot delete student",
      },
      error instanceof Error && error.message.includes("ไม่พบ") ? 404 : 400,
    );
  }
};