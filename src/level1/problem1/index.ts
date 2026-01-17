export type Value =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Buffer
  | Map<unknown, unknown>
  | Set<unknown>
  | Array<Value>
  | { [key: string]: Value };

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {
  /**
   * Simply by returning the value itself, the scalars section would pass
   * but not the built-in objects and the nested objects
   * so we just return the value if its not an object
   * also take note that type of null would return as object
   */

  if (value === null || typeof value !== "object") {
    return value;
  }
  /**
   * Expected: {"__t": "Map", "__v": [["one", 1], ["two", 2]]}
   * the test is expecting an object but simple returning it will be
   * Map {"one" => 1, "two" => 2}
   * so return an object structured according to what the test expects.
   * for the key of __v we need the items inside the map in the form of
   * arrays inside an array, so we use Array.from
   */
  if (value instanceof Map) {
    return { __t: "Map", __v: Array.from(value.entries()) };
  }

  //return an object for the others
  //  Expected: {"__t": "Set", "__v": ["one", "two", "three"]}
  //  Received: Set {"one", "two", "three"}
  if (value instanceof Set){
    return { __t: "Set", __v: Array.from(value) };
  }

  // Expected: {"__t": "Date", "__v": 1671942469988}
  // Received: 2022-12-25T04:27:49.988Z
  if (value instanceof Date){
    return { __t: "Date", __v: value.getTime() }
  }
  // for the buffer, only the value of __v is wrong, which is receiving "data": Array [90,115,109,187,242,216,94,110,]
  if (value instanceof Buffer){
    return { __t: "Buffer", __v: Array.from(value)}
  }
  //serialize for every item in array
  if (Array.isArray(value)){
    return value.map(item => serialize(item));
  }
  /**
   * if it hits this code, the object has passed the if statements
   * for deep nesting, we need to create a new object to hold the data
   * use a for loop to iterate over keys and serialize the data inside
   */
  const result: Record<string, any> = {};
  for (const key in value) {
  result[key] = serialize((value as any)[key]);
  }

  return result;

}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  /**
   * In the scalars, we just return them
   * in the build in objects, we take the
   * __t and compare it between the types
   * and  make the __v as a new instance of
   * these objects and return them.
   * for the arrays we just use map to input each
   * array item inside deserialize function again
   * for nested objects, use the same approach as
   * earlier but we also need to destructure it
   */
  if(value === null || typeof value !== "object"){
    return value as T;
  }
  const deObjects = value as {__t: string; __v: any};
  switch (deObjects.__t){
    case "Map":
      return new Map(deObjects.__v) as T;
    case "Set":
      return new Set(deObjects.__v) as T;
    case "Date":
      return new Date(deObjects.__v) as T;
    case "Buffer":
      return Buffer.from(deObjects.__v) as T;
  }
  if (Array.isArray(value)){
    return value.map(item => deserialize(item)) as T;
  }

  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(value)){
    result[key] = deserialize(val);
  }
  return result as T;
}
