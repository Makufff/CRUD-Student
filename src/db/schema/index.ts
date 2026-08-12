import { drizzle } from "drizzle-orm/d1"
import * as schema from "./student"

export const createDb = (DB: any) => {
  return drizzle(DB, { schema })
}