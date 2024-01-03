function DualListBox(selectors) {
  this.availableList = document.querySelector(selectors.availableList);
  this.selectedList = document.querySelector(selectors.selectedList);
  this.btnAdd = document.querySelector(selectors.btnAdd);
  this.btnRemove = document.querySelector(selectors.btnRemove);
  this.btnSave = document.querySelector(selectors.btnSave);

  this.data = this.formatData([
    {
      IDLevel1: "338187",
      Level1Name: "mark's space",
      IDLevel2: "506281",
      Level2Name: "mark's space",
      dateofsessionstart: "2023-12-23 14:51:00",
      HasMeetingURL: "0",
      currentevent: "1",
    },
    {
      IDLevel1: "5406",
      Level1Name:
        "How to Use GoBrunch for Webinars and Meetings: Live Tutorial with Q&A",
      IDLevel2: "8175",
      Level2Name: "Using GoBrunch: Best Practices, Tips and Tricks",
      dateofsessionstart: "2019-04-02 15:30:00",
      HasMeetingURL: "0",
      currentevent: "0",
    },
    {
      IDLevel1: "5406",
      IDLevel2: "817512",
      Level2Name:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Ullam ea dolore tenetur rerum. Expedita, iure! Quod perspiciatis quisquam asperiores sed.",
      dateofsessionstart: "2019-04-02 15:30:00",
      HasMeetingURL: "0",
      currentevent: "0",
    },
  ]);

  this.attachEventHandlers();
}

DualListBox.prototype.formatData = function (rawData) {
  var groupedData = {};

  rawData.forEach(function (item) {
    if (!groupedData[item.IDLevel1]) {
      groupedData[item.IDLevel1] = {
        IDLevel1: item.IDLevel1,
        Level1Name: item.Level1Name,
        Level2: [],
      };
    }
    groupedData[item.IDLevel1].Level2.push({
      IDLevel2: item.IDLevel2,
      Level2Name: item.Level2Name,
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
      IDLevel1: group.id,
      Level1Name: group.label,
      Level2: Array.from(group.querySelectorAll("option")).map((opt) => ({
        IDLevel2: opt.value,
        Level2Name: opt.textContent,
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
    optGroup.label = level1.Level1Name;
    optGroup.id = level1.IDLevel1;
    level1.Level2.forEach((level2) => {
      var option = document.createElement("option");
      option.value = level2.IDLevel2;
      option.textContent = level2.Level2Name;
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

var dualListBox = new DualListBox(listBoxSelectors);
dualListBox.render();
