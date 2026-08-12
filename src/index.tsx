import { Hono } from 'hono'
import { renderer } from './renderer'
import { studentRouter } from './routes/student.routes'
import type { AppEnv } from './types/env'

const app = new Hono<AppEnv>()

app.use(renderer)
app.route('/students', studentRouter)

app.get('/', (c) => {
  return c.render(
    <main>
      <h1>Student CRUD</h1>
      <p>Have fun!</p>
    </main>,
  )
})

export default app
