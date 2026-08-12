import { Hono } from "hono";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudentByStudentId,
  getStudents,
  updateStudent,
} from "../controllers/student.controller";
import type { AppEnv } from "../types/env";

export const studentRouter = new Hono<AppEnv>();

studentRouter.get("/", getStudents);
studentRouter.get("/student/:studentId", getStudentByStudentId);
studentRouter.get("/:id", getStudentById);
studentRouter.post("/", createStudent);
studentRouter.put("/:id", updateStudent);
studentRouter.delete("/:id", deleteStudent);
