/**
 * Validates a JSON schema against a set of rules.
 * Checks if the schema is a valid object, if each property has a defined type,
 * and if properties of type 'object' or 'array' also have valid schemas.
 *
 * @param {object} schema - The JSON schema to be validated.
 * @returns {boolean} Returns true if the schema is valid, false otherwise.
 */
export function validateSchema(schema) {
  if (typeof schema !== "object" || schema === null) {
    console.error("Provided schema is not a valid object.");
    return false;
  }

  if (schema.type !== "object" || typeof schema.properties !== "object") {
    console.error("Expected object schema with defined properties.");
    return false;
  }

  for (const key in schema.properties) {
    const property = schema.properties[key];

    if (typeof property !== "object" || typeof property.type !== "string") {
      console.error(`Property '${key}' in schema is not set correctly.`);
      return false;
    }

    //Recursive validation for properties of type 'object' and 'array'
    if (
      (property.type === "object" &&
        property.properties &&
        !validateSchema(property)) ||
      (property.type === "array" &&
        (!property.items ||
          typeof property.items !== "object" ||
          !validateSchema(property.items)))
    ) {
      return false;
    }
  }

  return true;
}

export function compareDataWithSchema(array, schema) {
  function transformObject(obj, schemaProperties) {
    const transformed = {};
    for (const key in schemaProperties) {
      const property = schemaProperties[key];

      if (
        property.type === "array" &&
        property.items &&
        property.items.properties
      ) {
        // Creates an array for array-type properties
        transformed[key] = [transformObject(obj, property.items.properties)];
      } else if (typeof obj[key] !== "undefined") {
        //Copy the value if it exists in the object
        transformed[key] = obj[key];
      }
    }
    return transformed;
  }

  for (const nestedArray of array) {
    for (const subArray of nestedArray) {
      for (const obj of subArray) {
        const transformedObj = transformObject(obj, schema.properties);
        if (!compareObjectWithSchema(transformedObj, schema.properties)) {
          return false;
        }
      }
    }
  }
  return true;
}

export function compareObjectWithSchema(obj, schemaProperties) {
  for (const key in schemaProperties) {
    if (typeof obj[key] === "undefined") {
      console.log(`Missing property: ${key}`);
      return false;
    }
    const property = schemaProperties[key];
    if (property.type === "array") {
      if (!Array.isArray(obj[key])) {
        console.log(
          `Expected array, found: ${typeof obj[key]} for the property: ${key}`
        );
        return false;
      }
      if (property.items && property.items.properties) {
        for (const item of obj[key]) {
          if (!compareObjectWithSchema(item, property.items.properties)) {
            return false;
          }
        }
      }
    } else if (typeof obj[key] !== property.type) {
      console.log(
        `Incorrect type for ${key}: expected ${
          property.type
        }, founded: ${typeof obj[key]}`
      );
      return false;
    }
  }
  return true;
}

export function createEmptyObjectFromSchema(schema) {
  function createObject(schemaProperties) {
    const resultObj = {};

    for (const key in schemaProperties) {
      const property = schemaProperties[key];
      if (property.type === "array") {
        if (property.items && property.items.properties) {
          // Creates an object structure for each item in the array
          resultObj[key] = [createObject(property.items.properties)];
        } else {
          // If there are no additional properties defined, initialize an empty array
          resultObj[key] = [];
        }
      } else {
        // Initializes to null for simple properties
        resultObj[key] = null;
      }
    }

    return resultObj;
  }

  return createObject(schema.properties);
}
