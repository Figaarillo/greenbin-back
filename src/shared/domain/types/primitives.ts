/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/ban-types */
type Methods<Entity> = {
  [Primitive in keyof Entity]: Entity[Primitive] extends Function ? Primitive : never
}[keyof Entity]

type MethodsAndProperties<Entity> = {
  [key in keyof Entity]: Entity[key]
}

type Properties<Entity> = Omit<MethodsAndProperties<Entity>, Methods<Entity>>

type PrimitiveTypes = string | number | boolean | Date | undefined | null

type ValueObjectValue<Entity> = Entity extends PrimitiveTypes
  ? Entity
  : Entity extends { value: infer value }
    ? value
    : Entity extends Array<{ value: infer value }>
      ? value[]
      : Entity extends Array<infer value>
        ? Array<ValueObjectValue<value>>
        : Entity extends { [key in keyof Properties<Entity>]: infer value }
          ? { [key in keyof Properties<Entity>]: ValueObjectValue<value> }
          : never

export type Primitives<Entity> = {
  [key in keyof Properties<Entity>]: ValueObjectValue<Entity[key]>
}
