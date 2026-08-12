import { Hono } from "hono";
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../controllers/student.controller";
import type { AppEnv } from "../types/env";

export const studentRouter = new Hono<AppEnv>();

studentRouter.get("/", getStudents);
studentRouter.get("/:id", getStudentById);
studentRouter.post("/", createStudent);
studentRouter.put("/:id", updateStudent);
studentRouter.delete("/:id", deleteStudent);
