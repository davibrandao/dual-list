import { validateSchema, transformAndCompareWithSchema, buildObjectFromSchema, createEmptyObjectFromSchema, fillObjectWithData, populateObjectsFromData } from './datatranslator.js';
import { DualListBox } from './duallistbox.js';

var listBoxSelectors = {
  availableList: "#availableEvents",
  selectedList: "#selectedEvents",
  btnAdd: "#btnAdd",
  btnRemove: "#btnRemove",
  btnSave: "#btnSave",
};

const dadosDeEntrada = [
  [
    [{ idevent: 338187, eventname: 'marks space', idsession: 506281, linkname: 'marks space', datesessionstart: '2023-12-23 14:51:00', HasMeetingURL: 0, currentevent: 0 }],
    [{ idevent: 338187, eventname: 'marks space', idsession: 506282, linkname: 'marks brunch', datesessionstart: '2023-12-23 14:22:20', HasMeetingURL: 0, currentevent: 0 }],
    [{ idevent: 338188, eventname: 'how to use gobrunch', idsession: 506283, linkname: 'gobrunch room', datesessionstart: '2023-12-23 12:22:22', HasMeetingURL: 0, currentevent: 0 }],
  ],
  [
    [{
      idevent: 21512, idsession: 506283, datesessionstart: '2023-12-23 12:22:22', HasMeetingURL: 0
    }]
  ]
];


const jsonSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "idevent": {
      "type": "number"
    },
    "eventname": {
      "type": "string"
    },
    "level2": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "idsession": {
            "type": "number"
          },
          "linkname": {
            "type": "string"
          },
          "datesessionstart": {
            "type": "string",
          },
          "HasMeetingURL": {
            "type": "number"
          },
          "currentevent": {
            "type": "number"
          }
        },
        "required": ["idsession", "linkname", "datesessionstart", "HasMeetingURL", "currentevent"]
      }
    }
  },
  "required": ["idevent", "eventname", "level2"]
};

const isValidSchema = validateSchema(jsonSchema);
console.log('O schema é válido:', isValidSchema);

const isValid = transformAndCompareWithSchema(dadosDeEntrada, jsonSchema);
console.log('A estrutura do array corresponde ao schema:', isValid);

const builtObject = buildObjectFromSchema(dadosDeEntrada, jsonSchema);
console.log(builtObject);

const emptyObject = createEmptyObjectFromSchema(jsonSchema);
console.log(emptyObject);

const filledObject = fillObjectWithData(emptyObject, dadosDeEntrada, jsonSchema);
console.log(filledObject);


const groupingProperties = ['idevent', 'eventname'];

const result = populateObjectsFromData(dadosDeEntrada, jsonSchema, groupingProperties);
console.log(result);

if (result) {
  var dualListBox = new DualListBox(listBoxSelectors, result);
  dualListBox.render();
}