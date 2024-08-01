/* eslint-disable no-console */
import { describe, expect, it } from 'vitest'
import { app } from '../../shared/test/test.setup'

let entityId: string

describe('Entity API Integration Tests', () => {
  it('should create a new entity successfully', async () => {
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

    entityId = response.json().data.id
  })

  it('should get an entity', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/entity/${entityId}`
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({ message: 'Entity retrieved successfully' })
  })

  it('should update an description of an existing entity successfully', async () => {
    const response = await app.inject({
      method: 'PUT',
      url: `/api/entity/${entityId}`,
      body: { description: 'Updated description' }
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({ message: 'Entity updated successfully' })
  })

  it('should retrieve the description updated from an entity successfully', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/api/entity/${entityId}`
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body).toMatchObject({ message: 'Entity retrieved successfully' })
    expect(body.data.description).toBe('Updated description')
  })
})
