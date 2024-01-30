import { validateSchema } from "../manipulation.js";
// import { PATTERN_STRING } from "../../../utils/classes/duallistbox.js";

import {
  groupByCategory,
  processSublevels,
  createOptGroup,
  markItemsWithInproduct,
  prepareAndMoveItems,
  updateMeetingName,
} from "../../../utils/scripts/dataprocessutils.js";
import { DualListBox } from "../../../utils/classes/duallistbox.js";
/**
 * Processes input data based on a JSON schema and grouping properties.
 * Groups data based on specified properties and processes each nesting level.
 *
 * @param {array} inputData - Input data to be processed.
 * @param {object} jsonSchema - The JSON schema used for processing the data.
 * @param {array} groupingProperties - Properties used for grouping the data.
 */
export function populateObjectsFromData(inputData, jsonSchema) {
  try {
    if (!Array.isArray(inputData) || typeof jsonSchema !== "object") {
      throw new Error("Invalid input data or JSON schema.");
    }

    //Validates JSON schema
    if (!validateSchema(jsonSchema)) {
      throw new Error("Invalid JSON Schema.");
    }

    // Identifica automaticamente ID e Nome
    const [idKey, nameKey] = identifyIdAndNameKeys(inputData, jsonSchema);

    // Groups data based on identified ID and Name
    const groupedData = groupBySpecifiedProperties(inputData.flat(2), [
      idKey,
      nameKey,
    ]);
    return createTopLevelObjects(groupedData, [idKey, nameKey]);
  } catch (error) {
    console.error(`Error processing data: ${error.message}`);
    return []; //Returns an empty array in case of error
  }
}
/**
 * Identifies ID and Name keys in the provided JSON schema.
 *
 * The function iterates through the properties of the JSON schema and identifies:
 * - The first property of type 'number' as the ID key.
 * - The first property of type 'string' as the Name key.
 *
 * If an ID key is not found, the function throws an error.
 * If a Name key is not found, the ID key is used as Name.
 *
 * @param {Object} schema The JSON schema in which the keys will be identified.
 * @returns {Array} An array containing the ID key and the Name key.
 * @throws {Error} If an ID key is not found in the schema.
 */
export function identifyIdAndNameKeys(data, schema) {
  let idKey = null;
  let nameKey = null;

  for (const key in schema.properties) {
    if (schema.properties[key].type === "number" && !idKey) {
      idKey = key;
    } else if (schema.properties[key].type === "string" && !nameKey) {
      nameKey = key;
    }

    if (idKey && nameKey) break;
  }

  if (!idKey) {
    throw new Error("ID not found in data.");
  }

  if (!nameKey) {
    nameKey = idKey; // Use ID as Name if a Name is not found
  }

  return [idKey, nameKey];
}

/**
 * Groups data based on specified properties.
 *
 * This function organizes data into groups based on the values of specified properties.
 * It creates a unique key for each group by concatenating the values of the specified properties.
 *
 * @param {Array} data - The array of data to be grouped.
 * @param {Array} properties - The properties used to group the data.
 * @returns {Object} An object with keys representing the group identifiers and values as arrays of grouped items.
 */
export function groupBySpecifiedProperties(data, properties) {
  const groupedData = {};
  data.forEach((item) => {
    const key = properties.map((prop) => item[prop]).join("_");
    groupedData[key] = groupedData[key] || [];
    groupedData[key].push(item);
  });
  return groupedData;
}

/**
 * Creates top-level objects based on grouped data.
 *
 * This function transforms grouped data into an array of top-level objects.
 * Each top-level object represents a group and contains an array of level 2 objects.
 *
 * @param {Object} groupedData - The grouped data to be transformed.
 * @param {Array} groupingProperties - The properties used for grouping the data.
 * @returns {Array} An array of top-level objects, each containing a group of level 2 objects.
 */
export function createTopLevelObjects(groupedData, groupingProperties) {
  return Object.values(groupedData).map((group) => {
    let topLevelObject = createInitialTopLevelObject(
      group[0],
      groupingProperties
    );

    group.forEach((item) => {
      const level2Object = createLevel2Object(item, groupingProperties);
      topLevelObject.level2.push(level2Object);
    });

    return topLevelObject;
  });
}

/**
 * Creates an initial top-level object based on the first item in a group.
 *
 * This function initializes a top-level object using the properties of the first item in a group.
 * The properties used for grouping are set on this top-level object.
 *
 * @param {Object} item - The first item in the group.
 * @param {Array} groupingProperties - The properties used for grouping.
 * @returns {Object} A top-level object initialized with grouping properties.
 */
export function createInitialTopLevelObject(item, groupingProperties) {
  let topLevelObject = {};
  groupingProperties.forEach((prop) => {
    topLevelObject[prop] = item[prop]; // Sets each grouping property on the top-level object
  });
  topLevelObject.level2 = []; // Initialize the array for level 2 objects
  return topLevelObject;
}

/**
 * Creates a level 2 object based on the current item.
 *
 * This function constructs a level 2 object by including all properties of the current item
 * that are not used for grouping. This object represents a sub-item within a group.
 *
 * @param {Object} item - The current item being processed.
 * @param {Array} groupingProperties - The properties used for grouping.
 * @returns {Object} A level 2 object containing properties of the current item.
 */
export function createLevel2Object(item, groupingProperties) {
  let level2Object = {};
  Object.keys(item).forEach((key) => {
    //Includes all non-grouping properties in the level 2 object
    if (!groupingProperties.includes(key)) {
      level2Object[key] = item[key];
    }
  });
  return level2Object;
}
