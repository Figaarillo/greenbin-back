/* eslint-disable no-console */
import initMikroORM from './db'
import runSeeders from './shared/database/seeders/database.seeder'
;(async () => {
  const db = await initMikroORM()

  try {
    await runSeeders(db.em)
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await db.orm.close()
  }
})()
