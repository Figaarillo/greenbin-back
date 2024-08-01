/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import { app } from '../../shared/test/test.setup'

let id: string

describe('Entity API', () => {
  it('should create a new entity', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/entity',
      body: {
        name: 'Test Entity',
        description: 'Test Entity description',
        password: 'Test123@#.',
        city: 'test city',
        province: 'test province'
      }
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body).toMatchObject({ message: 'Entity registered successfully' })
    expect(body.data.id).toBeTruthy()

    id = response.json().data.id
  })

  it('should get an entity', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/entity/${id}`
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({ message: 'Entity retrieved successfully' })
  })
})
