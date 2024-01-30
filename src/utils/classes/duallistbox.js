import {
  createOptGroup,
  getValuesFromElement,
  prepareAndMoveItems,
  processSublevels,
  updateMeetingName,
} from "../scripts/dataprocessutils.js";

/**
 * DualListBox class for managing a dual list interface.
 *
 * This class creates and manages a dual list, allowing users to move items
 * between an available list and a selected list. It's ideal for interfaces where
 * users need to select a subset of available options.
 */

export class DualListBox {
  static PATTERN_STRING = "Gobrunch";
  /**
   * Constructor of the DualListBox class.
   *
   * Initializes the dual list with specified elements and initial data.
   * Sets up event handlers for the buttons and lists.
   *
   * @param {Object} selectors - Objects containing CSS selectors for list elements.
   *                             Should include selectors for available and selected
   *                             lists, as well as add, remove, and save buttons.
   * @param {Array} initialData - Initial data for the list. Each data item
   *                              should be an object representing a group and its
   *                              options.
   * @throws {Error} Throws an error if selectors are invalid or elements
   *                 are not found in the DOM.
   */
  constructor(selectors, initialData) {
    this.availableList = document.querySelector(selectors.availableList);
    this.selectedList = document.querySelector(selectors.selectedList);
    this.btnAdd = document.querySelector(selectors.btnAdd);
    this.btnRemove = document.querySelector(selectors.btnRemove);
    this.btnSave = document.querySelector(selectors.btnSave);

    if (
      typeof selectors !== "object" ||
      !this.availableList ||
      !this.selectedList
    ) {
      throw new Error("Invalid selectors or elements not found in the DOM.");
    }

    this.data = this.formatData(initialData || []);
    this.attachEventHandlers();
  }

  /**
   * Formats raw data into the structure expected by the dual list.
   *
   * This method transforms raw data into a format that is more suitable for
   * rendering in the dual list. It ensures that each data item has a
   * 'level2' property which is an array of subitems.
   *
   * @param {Array} rawData - The raw data to be formatted.
   * @returns {Array} The formatted data.
   */
  formatData(rawData) {
    return rawData.map((item) => {
      var formattedItem = Object.assign({}, item);
      if (!Array.isArray(formattedItem.level2)) {
        formattedItem.level2 =
          formattedItem.Level2 || formattedItem.level2 || [];
        formattedItem.level2 = formattedItem.level2.map((level2Item) => {
          return {
            idlevel2: level2Item.idlevel2 || "",
            level2name: level2Item.level2name || "Name not found",
          };
        });
      }
      return formattedItem;
    });
  }

  /**
   * Attaches event handlers to the user interface elements.
   *
   * This function sets up event handlers for the add and remove buttons,
   * as well as for the available and selected lists. It allows items to be
   * moved between the lists and option groups to be selected or deselected.
   */
  attachEventHandlers() {
    this.btnAdd.onclick = () => {
      this.moveItems(this.availableList, this.selectedList);
    };
    this.btnRemove.onclick = () =>
      this.moveItems(this.selectedList, this.availableList);
    this.availableList.addEventListener("click", (event) =>
      this.toggleOptGroupSelection(event)
    );
    this.selectedList.addEventListener("click", (event) =>
      this.toggleOptGroupSelection(event)
    );
    this.btnSave.onclick = () => {
      console.log(this.getSelectedItems());
      // Após mover os itens, obtenha os valores de 'selectedEvents'
      const values = getValuesFromElement("selectedEvents", "value", "option");
      console.log(values); // Exibe os valores no console
    };
  }

  /**
   * Toggles the selection of an option group.
   *
   * This function is called when an option group (`<optgroup>`) is clicked.
   * It toggles the 'selected' class of the group, allowing the group to be
   * identified as selected or deselected.
   *
   * @param {Event} event - The click event that triggers the function.
   */
  toggleOptGroupSelection(event) {
    if (event.target.tagName === "OPTGROUP") {
      event.target.classList.toggle("selected");
    }
  }

  /**
   * Moves selected items between two lists.
   *
   * This function moves all selected option groups and individual options
   * from a source list to a destination list. It uses the `moveOptGroup` and `moveOption`
   * functions to perform the movement.
   *
   * @param {HTMLElement} source - The source list of the items.
   * @param {HTMLElement} destination - The destination list where the items will be moved.
   */
  moveItems(source, destination) {
    Array.from(source.querySelectorAll("optgroup.selected")).forEach(
      (optGroup) => {
        this.moveOptGroup(source, destination, optGroup.id);
      }
    );
    Array.from(source.selectedOptions).forEach((option) => {
      if (
        option.parentNode.tagName === "OPTGROUP" &&
        !option.parentNode.classList.contains("selected")
      ) {
        this.moveOption(source, destination, option);
      }
    });
    this.removeEmptyOptGroups(destination);
  }

  /**
   * Moves an entire option group from one list to another.
   *
   * This function moves an option group (`<optgroup>`) and all its options
   * from a source list to a destination list. If the group already exists in
   * the destination list, the options are merged.
   *
   * @param {HTMLElement} source - The source list of the option group.
   * @param {HTMLElement} destination - The destination list where the group will be moved.
   * @param {string} optGroupId - The ID of the option group to be moved.
   * @throws {Error} Throws an error if the option group with the specified ID is not found.
   */
  moveOptGroup(source, destination, optGroupId) {
    try {
      var optGroup = source.querySelector(`optgroup[id="${optGroupId}"]`);
      if (!optGroup) {
        throw new Error(`Optgroup with ID '${optGroupId}' not found.`);
      }

      var existingOptGroup = destination.querySelector(
        `optgroup[id="${optGroupId}"]`
      );
      if (existingOptGroup) {
        Array.from(optGroup.children).forEach((option) => {
          if (
            !existingOptGroup.querySelector(`option[value="${option.value}"]`)
          ) {
            var clonedOption = option.cloneNode(true);
            existingOptGroup.appendChild(clonedOption);
          }
        });
      } else {
        var clonedOptGroup = optGroup.cloneNode(true);
        destination.appendChild(clonedOptGroup);
      }

      optGroup.remove();
    } catch (error) {
      console.error(`Error moving optgroup: ${error.message}`);
    }
  }

  processDataForList(data) {
    const PATTERN_STRING = "Gobrunch";

    data.forEach((item) => {
      let usePatternStringForGroup = false;

      // Verifica se algum subitem atende às condições para usar o PATTERN_STRING
      if (item.level2 && Array.isArray(item.level2)) {
        usePatternStringForGroup = item.level2.some(
          (subItem) => subItem.ismeeting === 1 && subItem.HasMeetingURL === 1
        );
      }

      if (usePatternStringForGroup) {
        // Altera o nome do grupo para PATTERN_STRING
        item.groupName = PATTERN_STRING;
      }
    });

    return data;
  }
  /**
   * Populates a list with provided data.
   *
   * This function creates groups (optgroups) and options (options) based on the provided data
   * and adds them to a specified list element. Each item in the data is used to
   * create a group, and the sublevels of each item are processed to create options within
   * those groups. Additionally, items with the property 'inproduct' equal to 1 are
   * prepared to be moved to a list of selected items.
   *
   * @param {HTMLElement} list - The list element (e.g., a <select> element)
   *                             where the groups and options will be added.
   * @param {Array} data - The data used to create the groups and options. It is expected that
   *                       each item in the array has a 'level2' property which is an
   *                       array of subitems.
   *
   * @throws {Error} If 'list' is not an element or 'data' is not an array, an exception
   *                 is thrown indicating "List not defined or invalid data."
   */
  populateList(list, data) {
    try {
      if (!list || !Array.isArray(data)) {
        throw new Error("List not defined or invalid data.");
      }

      list.innerHTML = "";

      // Create a document fragment
      const fragment = document.createDocumentFragment();

      data.forEach((item) => {
        let groupName = "";
        let groupId = "";

        for (let key in item) {
          if (typeof item[key] === "string" && !groupName) {
            groupName = item[key];
          } else if (typeof item[key] === "number" && !groupId) {
            groupId = item[key];
          }
        }

        let useGroupIdAsName = !groupName;
        groupName = groupName || groupId;

        var optGroup = createOptGroup(groupName, groupId);

        // Recursive function to process sublevels
        processSublevels(
          item.level2 || [],
          optGroup,
          DualListBox.PATTERN_STRING,
          true
        );

        // Append the optGroup to the fragment
        fragment.appendChild(optGroup);
      });

      // Append the fragment to the list
      list.appendChild(fragment);

      prepareAndMoveItems(
        list,
        data,
        this.moveOption.bind(this),
        this.selectedList
      );

      this.moveItems(list, this.selectedList);
      this.removeEmptyOptGroups(list);
    } catch (error) {
      console.error(`Error populating list: ${error.message}`);
    }
  }

  /**
   * Renders the list based on the current data.
   *
   * This function is responsible for rendering the elements of the available and selected list.
   * It calls `populateList` to add groups and options to the available list element.
   *
   * @throws {Error} Throws an error if the list elements are not defined.
   */
  render() {
    try {
      if (!this.availableList || !this.selectedList) {
        throw new Error("Elementos da lista não definidos.");
      }
      this.populateList(this.availableList, this.data);
    } catch (error) {
      console.error(`Error rendering list: ${error.message}`);
    }
  }

  /**
   * Retrieves the selected items from the list.
   *
   * This function returns an array of objects representing the selected groups and options.
   * Each object contains the ID and name of the group, as well as an array of objects representing
   * the selected options within that group.
   *
   * @returns {Array} An array of objects with the selected items.
   * @throws {Error} Throws an error if there is a problem retrieving the selected items.
   */
  getSelectedItems() {
    try {
      return Array.from(this.selectedList.querySelectorAll("optgroup")).map(
        (group) => ({
          idlevel1: group.id,
          level1name: group.label,
          Level2: Array.from(group.querySelectorAll("option")).map((opt) => ({
            idlevel2: opt.value,
            level2name: opt.textContent,
          })),
        })
      );
    } catch (error) {
      console.error(`Error getting selected items: ${error.message}`);
      return [];
    }
  }

  /**
   * Moves an option from one list to another.
   *
   * This function moves a specific option from a source group to a target group.
   * If the target group does not exist, it is created. The function also manages the removal
   * of empty groups after moving the option.
   *
   * @param {HTMLElement} source - The source list element.
   * @param {HTMLElement} destination - The destination list element.
   * @param {HTMLElement} option - The option to be moved.
   * @throws {Error} Throws an error if there is a problem moving the option.
   */
  moveOption(source, destination, option) {
    try {
      var sourceOptGroup = option.parentNode;
      var targetOptGroup = destination.querySelector(
        `optgroup[id="${sourceOptGroup.id}"]`
      );
      if (!targetOptGroup) {
        targetOptGroup = document.createElement("optgroup");
        targetOptGroup.label = sourceOptGroup.label;
        targetOptGroup.id = sourceOptGroup.id;
        destination.appendChild(targetOptGroup);
      }

      var clonedOption = option.cloneNode(true);
      targetOptGroup.appendChild(clonedOption);
      option.remove();

      if (sourceOptGroup.children.length === 0) {
        sourceOptGroup.remove();
      }

      if (targetOptGroup.children.length === 0) {
        targetOptGroup.remove();
      }
    } catch (error) {
      console.error(`Error when moving option: ${error.message}`);
    }
  }

  /**
   * Removes empty option groups from a list.
   *
   * This function iterates through all groups (`<optgroup>`) in a list and removes those
   * that contain no options.
   *
   * @param {HTMLElement} list - The list element from which empty groups will be removed.
   * @throws {Error} Throws an error if there is a problem removing the empty groups.
   */

  removeEmptyOptGroups(list) {
    try {
      var optGroups = list.querySelectorAll("optgroup");
      optGroups.forEach((optGroup) => {
        if (optGroup.children.length === 0) {
          optGroup.remove();
        }
      });
    } catch (error) {
      console.error(`Error removing empty optgroups: ${error.message}`);
    }
  }
}
