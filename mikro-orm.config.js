Promise.resolve({
  useTsNode: true,
  type: 'postgresql',
  entities: ['dist/**/*.entity.js'],
  migrations: {
    path: 'dist/migrations',
    glob: '!(*.d).{js,ts}'
  },
  dbName: 'mikro-orm'
})
