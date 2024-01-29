/**
 * Groups data by category.
 *
 * This function organizes a nested array of data into a structured object
 * grouped by category. Each category is identified by its unique ID, and
 * the function aggregates items under their respective categories.
 *
 * @param {Array} data - The nested array of data to be grouped.
 * @returns {Object} An object with keys as category IDs and values as objects containing
 *                   the category name and an array of items belonging to that category.
 */
export function groupByCategory(data) {
  const grouped = {};
  data.forEach((level1Array) => {
    level1Array.forEach((level2Array) => {
      level2Array.forEach((item) => {
        if (!grouped[item.idcategory]) {
          grouped[item.idcategory] = {
            categoryname: item.categoryname,
            items: [],
          };
        }
        grouped[item.idcategory].items.push(item);
      });
    });
  });
  return grouped;
}

/**
 * Updates the 'linkname' property of items based on specific conditions.
 *
 * This function iterates through a nested array of data and updates the 'linkname'
 * property of each item if certain conditions are met. Specifically, if an item
 * is marked as a meeting and has a meeting URL, its 'linkname' is set to a predefined pattern string.
 *
 * @param {Array} data - The nested array of data containing the items to be updated.
 */
export function updateMeetingName(data) {
  const PATTERN_STRING = "Gobrunch";

  data.forEach((item) => {
    if (item.ismeeting === 1 && item.HasMeetingURL === 1) {
      item.linkname = PATTERN_STRING;
    }
  });
}

/**
 * Prepares and moves items with a specific property from one list to another.
 *
 * This function checks each item in the provided data for a specific property ('inproduct').
 * If the property is set to a certain value (1), the corresponding item is moved from the
 * source list to the destination list using the provided move function.
 *
 * @param {HTMLElement} list - The source list element from which items will be moved.
 * @param {Array} data - The data containing items to be checked and potentially moved.
 * @param {Function} moveOptionFunc - The function used to move an item from the source to the destination list.
 * @param {HTMLElement} selectedList - The destination list element where items will be moved.
 */
export function prepareAndMoveItems(list, data, moveOptionFunc, selectedList) {
  function processItems(levelItems) {
    levelItems.forEach((item) => {
      if (item.level2 && Array.isArray(item.level2)) {
        item.level2.forEach((subItem) => {
          if (subItem.inproduct === 1) {
            const optionToMove = list.querySelector(
              `option[value="${subItem.idsession}"]`
            );
            if (optionToMove && !optionToMove.selected) {
              optionToMove.selected = true;
              moveOptionFunc(list, selectedList, optionToMove);
            }
          }
        });
      }
    });
  }

  processItems(data);
}

/**
 * Creates an optgroup HTML element with specified group name and ID.
 *
 * @param {string} groupName - The label for the optgroup.
 * @param {string} groupId - The ID for the optgroup.
 * @returns {HTMLElement} The created optgroup element.
 */
export function createOptGroup(groupName, groupId) {
  var optGroup = document.createElement("optgroup");
  optGroup.label = groupName || "Name not found";
  optGroup.id = groupId || "ID not found";
  return optGroup;
}

/**
 * Checks if PATTERN_STRING should be used based on the conditions of the subitems.
 *
 * @param {Array} subItems - Array of subitems to be checked.
 * @returns {boolean} Returns true if PATTERN_STRING should be used, false otherwise.
 */
function shouldUsePatternString(subItems) {
  return subItems.some(
    (subItem) => subItem.ismeeting === 1 && subItem.HasMeetingURL === 1
  );
}

/**
 * Creates and returns an 'option' element based on the properties of the subitem.
 *
 * @param {Object} subItem - The subitem to be processed.
 * @param {boolean} usePatternString - Indicates if PATTERN_STRING should be used as the text of the 'option'.
 * @param {string} PATTERN_STRING - The default string to be used if conditions are met.
 * @returns {HTMLElement} The created 'option' element.
 */
function createOptionElement(subItem, usePatternString, PATTERN_STRING) {
  let subItemName = subItem.linkname || "Item name not found";
  let subItemId = subItem.idsession || "Item ID not found";

  if (usePatternString) {
    subItemName = PATTERN_STRING;
  }

  var option = document.createElement("option");
  option.value = subItemId;
  option.textContent = subItemName;
  return option;
}

/**
 * Processes sublevel items and appends them as options to a parent element.
 *
 * This function iterates through an array of sublevel items, creating an 'option'
 * element for each item and appending it to the provided parent element. It handles
 * the naming and ID assignment for each option based on the item properties.
 *
 * @param {Array} subItems - The array of sublevel items to be processed.
 * @param {HTMLElement} parentElement - The parent element to which options will be appended.
 * @param {string} PATTERN_STRING - The default string to be used if conditions are met.
 * @param {boolean} alterGroupLabel - Flag to determine if the group label should be altered.
 */
export function processSublevels(
  subItems,
  parentElement,
  PATTERN_STRING,
  alterGroupLabel = false
) {
  const usePatternString = subItems.some(
    (subItem) => subItem.ismeeting === 1 && subItem.HasMeetingURL === 1
  );

  if (usePatternString && alterGroupLabel) {
    parentElement.label = PATTERN_STRING;
  }

  subItems.forEach((subItem) => {
    let subItemName = subItem.linkname || "Item name not found";
    let subItemId = subItem.idsession || "Item ID not found";

    if (usePatternString) {
      subItemName = PATTERN_STRING;
    }

    var option = document.createElement("option");
    option.value = subItemId;
    option.textContent = subItemName;
    parentElement.appendChild(option);
  });
}

/**
 * Marks items with a specific property in a list.
 *
 * This function iterates through the provided data and marks items in the list
 * with a specific property ('inproduct'). If the property is set to a certain value (1),
 * the corresponding option in the list is marked with a 'selected' class.
 *
 * @param {Array} data - The data containing items to be checked and potentially marked.
 * @param {HTMLElement} list - The list element containing options to be marked.
 */
export function markItemsWithInproduct(data, list) {
  data.forEach((item) => {
    if (item.level2 && Array.isArray(item.level2)) {
      item.level2.forEach((subItem) => {
        if (subItem.inproduct === 1) {
          const optionToMark = list.querySelector(
            `option[value="${subItem.idsession}"]`
          );
          if (optionToMark) {
            optionToMark.classList.add("selected");
          }
        }
      });
    }
  });
}
