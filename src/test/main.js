import { updateMeetingName } from "../utils/scripts/dataprocessutils.js";
import { DualListBox } from "../utils/classes/duallistbox.js";
import {
  validateSchema,
  compareDataWithSchema,
  createEmptyObjectFromSchema,
} from "../js/datamanipulation/manipulation.js";
import {
  populateObjectsFromData,
  populateDropdown,
} from "../js/datamanipulation/datapopulation/population.js";

var listBoxSelectors = {
  availableList: "#availableEvents",
  selectedList: "#selectedEvents",
  btnAdd: "#btnAdd",
  btnRemove: "#btnRemove",
  btnSave: "#btnSave",
};

const dadosDeEntrada = [
  [
    [
      {
        idevent: 338187,
        eventname: "marks space",
        idsession: 506281,
        linkname: "marks space",
        datesessionstart: "2023-12-23 14:51:00",
        HasMeetingURL: 0,
        currentevent: 0,
      },
    ],
    [
      {
        idevent: 338187,
        eventname: "marks space",
        idsession: 506282,
        linkname: "marks brunch",
        datesessionstart: "2023-12-23 14:22:20",
        HasMeetingURL: 0,
        currentevent: 0,
      },
    ],
    [
      {
        idevent: 338188,
        eventname: "how to use gobrunch",
        idsession: 506283,
        linkname: "gobrunch room",
        datesessionstart: "2023-12-23 12:22:22",
        HasMeetingURL: 0,
        currentevent: 0,
      },
    ],
  ],
  [
    [
      {
        idevent: 21512,
        idsession: 506283,
        datesessionstart: "2023-12-23 12:22:22",
        HasMeetingURL: 0,
      },
    ],
  ],
];

const dadosDeEntrada2 = [
  [
    [
      {
        idevent: 338187,
        eventname: "marks space",
        idsession: 506281,
        linkname: "marks space",
        datesessionstart: "2023-12-23 14:51:00",
        HasMeetingURL: 0,
        currentevent: 0,
        idcategory: 2121,
        categoryname: "coworking",
        inproduct: 0,
        ismeeting: 1,
      },
    ],
    [
      {
        idevent: 338187,
        eventname: "marks space",
        idsession: 506282,
        linkname: "marks brunch",
        datesessionstart: "2023-12-23 14:22:20",
        HasMeetingURL: 0,
        currentevent: 0,
        idcategory: 2121,
        categoryname: "coworking",
        inproduct: 0,
        ismeeting: 1,
      },
    ],
    [
      {
        idevent: 338188,
        eventname: "how to use gobrunch",
        idsession: 506283,
        linkname: "gobrunch room",
        datesessionstart: "2023-12-23 12:22:22",
        HasMeetingURL: 0,
        currentevent: 0,
        idcategory: 2121,
        categoryname: "coworking",
        inproduct: 0,
        ismeeting: 1,
      },
    ],
    [
      {
        idevent: 21512,
        idsession: 506285,
        datesessionstart: "2023-12-23 12:22:22",
        HasMeetingURL: 1,
        idcategory: 21521,
        categoryname: "meeting",
        ismeeting: 1,
        inproduct: 0,
      },
    ],
  ],
];

const jsonSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    idevent: {
      type: "number",
    },
    eventname: {
      type: "string",
    },
    level2: {
      type: "array",
      items: {
        type: "object",
        properties: {
          idsession: {
            type: "number",
          },
          linkname: {
            type: "string",
          },
          datesessionstart: {
            type: "string",
          },
          HasMeetingURL: {
            type: "number",
          },
          currentevent: {
            type: "number",
          },
          ismeeting: {
            type: "number",
          },
          inproduct: {
            type: "number",
          },
        },
        required: [
          "idsession",
          "linkname",
          "datesessionstart",
          "HasMeetingURL",
          "currentevent",
          "ismeeting",
          "inproduct",
        ],
      },
    },
  },
  required: ["idevent", "eventname", "level2"],
};
const jsonSchema2 = {
  $schema: "http://json-schema.org/draft-07/schema#",
  type: "object",
  properties: {
    idcategory: {
      type: "number",
    },
    categoryname: {
      type: "string",
    },
    level2: {
      type: "array",
      items: {
        type: "object",
        properties: {
          idsession: {
            type: "number",
          },
          linkname: {
            type: "string",
          },
          datesessionstart: {
            type: "string",
          },
          HasMeetingURL: {
            type: "number",
          },
          currentevent: {
            type: "number",
          },
          ismeeting: {
            type: "number",
          },
          inproduct: {
            type: "number",
          },
        },
        required: [
          "idsession",
          "linkname",
          "datesessionstart",
          "HasMeetingURL",
          "currentevent",
          "ismeeting",
          "inproduct",
        ],
      },
    },
  },
  required: ["idcategory", "categoryname", "level2"],
};

document.addEventListener("DOMContentLoaded", function () {
  const isValidSchema = validateSchema(jsonSchema);
  console.log("O schema é válido:", isValidSchema);

  const isValid = compareDataWithSchema(dadosDeEntrada2, jsonSchema);
  console.log("A estrutura do array corresponde ao schema:", isValid);

  const emptyObject = createEmptyObjectFromSchema(jsonSchema);
  console.log(emptyObject);

  const dropdown = document.getElementById("meuDropdown");

  // cria a variavel com dados populados

  // altera os valores do linkname
  // updateMeetingName(dadosDeEntrada2);
  const result = populateObjectsFromData(dadosDeEntrada2, jsonSchema);
  console.log(dadosDeEntrada2);

  populateDropdown(dropdown, dadosDeEntrada2, jsonSchema2);
  console.log(result);

  // Preenche o dropdown com os dados de teste

  if (result) {
    var dualListBox = new DualListBox(listBoxSelectors, result);
    dualListBox.render();
  }
});
