type ExtendPayload<T extends object> = T & { id: string }

export default ExtendPayload
