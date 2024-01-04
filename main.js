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
        Level2: [],
      };
    }
    groupedData[item.idlevel1].Level2.push({
      idlevel2: item.idlevel2,
      level2name: item.level2name,
    });
  });

  return Object.values(groupedData);
};

DualListBox.prototype.attachEventHandlers = function () {
  this.btnAdd.onclick = () =>
    this.moveItems(this.availableList, this.selectedList);
  this.btnRemove.onclick = () =>
    this.moveItems(this.selectedList, this.availableList);
  this.availableList.addEventListener("dblclick", (event) => {
    if (event.target.tagName === "OPTGROUP") {
      this.moveOptGroup(this.availableList, this.selectedList, event.target.id);
    }
  });
  this.selectedList.addEventListener("dblclick", (event) => {
    if (event.target.tagName === "OPTGROUP") {
      this.moveOptGroup(this.selectedList, this.availableList, event.target.id);
    }
  });
  this.btnSave.onclick = () => console.log(this.getSelectedItems());
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
    optGroup.label = level1.level1name;
    optGroup.id = level1.idlevel1;
    level1.Level2.forEach((level2) => {
      var option = document.createElement("option");
      option.value = level2.idlevel2;
      option.textContent = level2.level2name;
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

document.addEventListener('DOMContentLoaded', function () {
  var dualListBox = new DualListBox(listBoxSelectors, initialData);
  dualListBox.render();
  // Atualizar dados em algum momento posterior
  var newData = [
    // novos dados aqui
  ];
  dualListBox.updateData(newData);

});


document.addEventListener('DOMContentLoaded', function () {
  fetch('http://localhost:8080/data')
    .then(response => response.json())
    .then(data => {
      var dualListBox = new DualListBox(listBoxSelectors, data);
      dualListBox.render();
    })
    .catch(error => console.error('Error:', error));
});


