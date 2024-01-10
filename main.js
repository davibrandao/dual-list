import { translateToDualListBoxFormat } from './datatranslator.js';

function DualListBox(selectors, initialData) {
  this.availableList = document.querySelector(selectors.availableList);
  this.selectedList = document.querySelector(selectors.selectedList);
  this.btnAdd = document.querySelector(selectors.btnAdd);
  this.btnRemove = document.querySelector(selectors.btnRemove);
  this.btnSave = document.querySelector(selectors.btnSave);

  // Ajuste: Inicializa com dados passados como parâmetro
  this.data = this.formatData(initialData || []);
  this.attachEventHandlers();
}

DualListBox.prototype.updateData = function (newData) {
  this.data = this.formatData(newData);
  this.render();
};

DualListBox.prototype.formatData = function (rawData) {
  var groupedData = {};

  rawData.forEach(function (item) {
    if (!groupedData[item.idlevel1]) {
      groupedData[item.idlevel1] = {
        idlevel1: item.idlevel1,
        level1name: item.level1name,
        level2: [],  // Inicializa com 'level2' em minúsculas
      };
    }
    // Adiciona itens tanto de 'Level2' (como no seu objeto de dados) quanto de 'level2'
    var level2Items = item.Level2 || item.level2 || [];
    level2Items.forEach(function (level2Item) {
      if (level2Item.idlevel2 && level2Item.level2name) {
        groupedData[item.idlevel1].level2.push({
          idlevel2: level2Item.idlevel2,
          level2name: level2Item.level2name,
        });
      }
    });
  });

  return Object.values(groupedData);
};


DualListBox.prototype.attachEventHandlers = function () {
  this.btnAdd.onclick = () => {
    this.moveItems(this.availableList, this.selectedList);
    this.moveOptGroups(this.availableList, this.selectedList);
  };
  this.btnRemove.onclick = () => {
    this.moveItems(this.selectedList, this.availableList);
    this.moveOptGroups(this.selectedList, this.availableList);
  };

  // Adiciona evento de clique (não duplo clique) para selecionar/desselecionar optgroups
  this.availableList.addEventListener("click", (event) => {
    if (event.target.tagName === "OPTGROUP") {
      event.target.classList.toggle('selected');
    }
  });

  this.selectedList.addEventListener("click", (event) => {
    if (event.target.tagName === "OPTGROUP") {
      event.target.classList.toggle('selected');
    }
  });

  this.btnSave.onclick = () => console.log(this.getSelectedItems());
};

// Função para mover optgroups selecionados
DualListBox.prototype.moveOptGroups = function (source, destination) {
  Array.from(source.querySelectorAll('optgroup.selected')).forEach(optGroup => {
    this.moveOptGroup(source, destination, optGroup.id);
  });
};


DualListBox.prototype.moveItems = function (source, destination) {
  // Movendo optgroups selecionados
  Array.from(source.querySelectorAll('optgroup.selected')).forEach(optGroup => {
    this.moveOptGroup(source, destination, optGroup.id);
  });

  // Movendo options selecionados individualmente (Level2)
  Array.from(source.selectedOptions).forEach(option => {
    if (option.parentNode.tagName === 'OPTGROUP' && !option.parentNode.classList.contains('selected')) {
      this.moveOption(source, destination, option);
    }
  });

  // Removendo optgroups vazios após a movimentação
  this.removeEmptyOptGroups(destination);
};

DualListBox.prototype.moveOptGroup = function (source, destination, optGroupId) {
  var optGroup = source.querySelector('optgroup[id="' + optGroupId + '"]');
  if (optGroup) {
    var existingOptGroup = destination.querySelector('optgroup[id="' + optGroupId + '"]');
    if (existingOptGroup) {
      existingOptGroup.remove();
    }
    var clonedOptGroup = optGroup.cloneNode(true);
    destination.appendChild(clonedOptGroup);
    optGroup.remove();
  }
};

DualListBox.prototype.moveOption = function (source, destination, option) {
  var sourceOptGroup = option.parentNode;
  var targetOptGroup = destination.querySelector('optgroup[id="' + sourceOptGroup.id + '"]');

  if (!targetOptGroup) {
    targetOptGroup = document.createElement('optgroup');
    targetOptGroup.label = sourceOptGroup.label;
    targetOptGroup.id = sourceOptGroup.id;
    destination.appendChild(targetOptGroup);
  }

  var clonedOption = option.cloneNode(true);
  targetOptGroup.appendChild(clonedOption);
  option.remove();

  // Verifica se o optgroup de origem está vazio e remove se estiver
  if (sourceOptGroup.children.length === 0) {
    sourceOptGroup.remove();
  }

  // Verifica se o optgroup de destino está vazio após a movimentação e remove se estiver
  if (targetOptGroup.children.length === 0) {
    targetOptGroup.remove();
  }
};

DualListBox.prototype.removeEmptyOptGroups = function (list) {
  var optGroups = list.querySelectorAll('optgroup');
  optGroups.forEach(optGroup => {
    if (optGroup.children.length === 0) {
      optGroup.remove();
    }
  });
};

DualListBox.prototype.getSelectedItems = function () {
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
};

DualListBox.prototype.render = function () {
  this.populateList(this.availableList, this.data);
};

DualListBox.prototype.populateList = function (list, data) {
  list.innerHTML = "";

  data.forEach((level1) => {
    var optGroup = document.createElement("optgroup");
    optGroup.label = level1.level1name || "Nome não encontrado";
    optGroup.id = level1.idlevel1 || "ID não encontrado";

    level1.level2.forEach((level2) => {
      var option = document.createElement("option");
      option.value = level2.idlevel2 || "ID não encontrado";
      option.textContent = level2.level2name || "Nome não encontrado";
      optGroup.appendChild(option);
    });

    list.appendChild(optGroup);
  });
};




var listBoxSelectors = {
  availableList: "#availableEvents",
  selectedList: "#selectedEvents",
  btnAdd: "#btnAdd",
  btnRemove: "#btnRemove",
  btnSave: "#btnSave",
};
// Dados iniciais - podem vir de uma fonte externa
var initialData = [
  // {

  //   idlevel1: "338187",
  //   level1name: "mark's space",
  //   idlevel2: "506281",
  //   level2name: "mark's space",

  // },
  // {
  //   idlevel1: "5406",
  //   level1name:
  //     "How to Use GoBrunch for Webinars and Meetings: Live Tutorial with Q&A",
  //   idlevel2: "8175",
  //   level2name: "Using GoBrunch: Best Practices, Tips and Tricks",

  // },
  // {
  //   idlevel1: "5406",
  //   idlevel2: "817512",
  //   level2name:
  //     "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam ea dolore tenetur rerum. Expedita, iure! Quod perspiciatis quisquam asperiores sed.",

  // },
];



// Supondo que someObject seja o objeto que você deseja traduzir
// var someObject = {
//   idlevel1: "123",
//   level1name: "Grupo 1",
//   idlevel2: "456",
//   level2name: "Subgrupo 1"
// };

// var translatedObject = translateToDualListBoxFormat(someObject);

// if (translatedObject) {
//   // Colocando translatedObject em um array
//   var dualListBox = new DualListBox(listBoxSelectors, [translatedObject]);
//   dualListBox.render();
//   console.log(translatedObject); // ou
// }



// Exemplo de uso
const someObject = {
  idLevel1: "214",
  level1Name: "GoBrunch Events",
  level2: [
    {
      idLevel2: "456",
      level2Name: "Gobrunch Rooms 1"
    },
    {
      idLevel2: "457",
      level2Name: "Gobrunch Rooms 2"
    },
    {
      idLevel2: "123",
      level2Name: "Gobrunch Rooms 3"
    }
  ],
};


const keyMapping = {
  idlevel1: "idLevel1",
  level1name: "level1Name",
  levels2: "level2",
  idlevel2: "idLevel2",   // Mapeia para a chave de id no nível 2
  level2name: "level2Name" // Mapeia para a chave de nome no nível 2
};




const translatedObject = translateToDualListBoxFormat(someObject, keyMapping);
if (translatedObject) {
  // Colocando translatedObject em um array
  var dualListBox = new DualListBox(listBoxSelectors, [translatedObject]);
  dualListBox.render();
  console.log(translatedObject); // ou
}



// document.addEventListener('DOMContentLoaded', function () {
//   var dualListBox = new DualListBox(listBoxSelectors, initialData);
//   dualListBox.render();
//   // Atualizar dados em algum momento posterior
//   var newData = [
//     // novos dados aqui
//   ];
//   dualListBox.updateData(newData);

// });


// document.addEventListener('DOMContentLoaded', function () {
//   fetch('http://localhost:8080/data')
//     .then(response => response.json())
//     .then(data => {
//       var dualListBox = new DualListBox(listBoxSelectors, data);
//       dualListBox.render();
//       console.log(data); // para os dados da API

//     })
//     .catch(error => console.error('Error:', error));

// });


