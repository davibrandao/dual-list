# DualListBox Project

## Overview

The DualListBox project is a JavaScript-based solution for creating a dual list box interface. It allows users to move items between two lists: an available list and a selected list. This is particularly useful for interfaces where users need to select a subset of options from a larger pool.

## Features

- **Dynamic List Management:** Users can easily move items between the available and selected lists.
- **Customizable Options:** The lists can be populated with custom data structures, accommodating various use cases.
- **Robust Data Handling:** Includes functions for processing and validating data against a JSON schema.
- **Meeting Name Update:** Special handling for items marked as meetings, updating their display names based on specific conditions.

## Installation

To use this project, clone the repository to your local machine or download the source files directly.

```bash
git clone https://github.com/your-username/dual-listbox-project.git
```

## Usage

### Set Up HTML Structure:

Create two `<select>` elements in your HTML for the available and selected lists, and add buttons for adding, removing, and saving selections.

### Initialize DualListBox:

In your JavaScript file, import the `DualListBox` class and initialize it with selectors pointing to your list elements and buttons.

```javascript
import { DualListBox } from "./path/to/duallistbox.js";

const listBoxSelectors = {
  availableList: "#availableListSelector",
  selectedList: "#selectedListSelector",
  btnAdd: "#addButtonSelector",
  btnRemove: "#removeButtonSelector",
  btnSave: "#saveButtonSelector",
};

const dualListBox = new DualListBox(listBoxSelectors, initialData);
dualListBox.render();
```

## Data Processing:

Use the provided functions in datatranslator.js to process and validate your data according to your needs.

### Customization:

Modify the styles and functionality as needed to fit the design and behavior of your application.

### Contributing

Contributions to this project are welcome. Please fork the repository and submit a pull request with your changes.
