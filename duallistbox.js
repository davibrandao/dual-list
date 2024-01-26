import { prepareAndMoveItems } from "./datatranslator.js";

export class DualListBox {
  /**
   * Construtor da classe DualListBox.
   * @param {Object} selectors - Objetos contendo seletores CSS para elementos da lista.
   * @param {Array} initialData - Dados iniciais para a lista.
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
      throw new Error(
        "Seletores inválidos ou elementos não encontrados no DOM."
      );
    }

    this.data = this.formatData(initialData || []);
    this.attachEventHandlers();
  }

  updateData(newData) {
    try {
      if (!Array.isArray(newData)) {
        throw new Error("Dados fornecidos para atualização não são um array.");
      }
      this.data = this.formatData(newData);
      this.render();
    } catch (error) {
      console.error(`Erro ao atualizar dados: ${error.message}`);
    }
  }

  formatData(rawData) {
    return rawData.map((item) => {
      var formattedItem = Object.assign({}, item);
      if (!Array.isArray(formattedItem.level2)) {
        formattedItem.level2 =
          formattedItem.Level2 || formattedItem.level2 || [];
        formattedItem.level2 = formattedItem.level2.map((level2Item) => {
          return {
            idlevel2: level2Item.idlevel2 || "",
            level2name: level2Item.level2name || "Nome não encontrado",
          };
        });
      }
      return formattedItem;
    });
  }

  attachEventHandlers() {
    this.btnAdd.onclick = () =>
      this.moveItems(this.availableList, this.selectedList);
    this.btnRemove.onclick = () =>
      this.moveItems(this.selectedList, this.availableList);
    this.availableList.addEventListener("click", (event) =>
      this.toggleOptGroupSelection(event)
    );
    this.selectedList.addEventListener("click", (event) =>
      this.toggleOptGroupSelection(event)
    );
    this.btnSave.onclick = () => console.log(this.getSelectedItems());
  }

  toggleOptGroupSelection(event) {
    if (event.target.tagName === "OPTGROUP") {
      event.target.classList.toggle("selected");
    }
  }

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

  // Resto dos métodos (moveOptGroup, moveOption, removeEmptyOptGroups, getSelectedItems, render, populateList) permanecem iguais.
  moveOptGroup(source, destination, optGroupId) {
    try {
      var optGroup = source.querySelector(`optgroup[id="${optGroupId}"]`);
      if (!optGroup) {
        throw new Error(`Optgroup com ID '${optGroupId}' não encontrado.`);
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
      console.error(`Erro ao mover optgroup: ${error.message}`);
    }
  }

  populateList(list, data) {
    try {
      if (!list || !Array.isArray(data)) {
        throw new Error("Lista não definida ou dados inválidos.");
      }
      list.innerHTML = "";

      data.forEach((item) => {
        // Determina dinamicamente groupName e groupId
        let groupName = "";
        let groupId = "";
        for (let key in item) {
          if (typeof item[key] === "string" && !groupName) {
            groupName = item[key];
          } else if (typeof item[key] === "number" && !groupId) {
            groupId = item[key];
          }
        }

        // Usa groupId como groupName se groupName não for encontrado
        let useGroupIdAsName = false;
        if (!groupName) {
          groupName = groupId;
          useGroupIdAsName = true;
        }
        groupName = groupName || "Nome não encontrado";
        groupId = groupId || "ID não encontrado";

        var optGroup = document.createElement("optgroup");
        optGroup.label = groupName;
        optGroup.id = groupId;

        // Função recursiva para processar subníveis
        const processSublevels = (subItems, parentElement, parentGroupId) => {
          subItems.forEach((subItem) => {
            if (Array.isArray(subItem)) {
              processSublevels(subItem, parentElement, parentGroupId);
            } else {
              let subItemName = "";
              let subItemId = "";
              for (let key in subItem) {
                if (typeof subItem[key] === "string" && !subItemName) {
                  subItemName = subItem[key];
                } else if (typeof subItem[key] === "number" && !subItemId) {
                  subItemId = subItem[key];
                }
              }

              // Se o groupName é baseado no ID do pai, usa o ID do subItem como nome
              if (useGroupIdAsName) {
                subItemName = subItemId;
              }
              subItemName = subItemName || "Nome do item não encontrado";
              subItemId = subItemId || "ID do item não encontrado";

              var option = document.createElement("option");
              option.value = subItemId;
              option.textContent = subItemName;
              parentElement.appendChild(option);
            }
          });
        };

        // Processa quaisquer subníveis
        for (let key in item) {
          if (Array.isArray(item[key])) {
            processSublevels(item[key], optGroup, groupId);
          }
        }
        for (let key in item) {
          if (Array.isArray(item[key])) {
            item[key].forEach((subItem) => {
              if (subItem.inproduct === 1) {
                // Encontra a opção correspondente e marca como selecionada
                const optionToMark = list.querySelector(
                  `option[value="${subItem.idsession}"]`
                );
                if (optionToMark) {
                  this.removeEmptyOptGroups(list);

                  optionToMark.classList.add("selected");
                }
              }
            });
          }
        }

        list.appendChild(optGroup);
      });
      prepareAndMoveItems(
        list,
        data,
        this.moveOption.bind(this),
        this.selectedList
      );
      this.moveItems(list, this.selectedList);
      this.removeEmptyOptGroups(list);
    } catch (error) {
      console.error(`Erro ao popular lista: ${error.message}`);
    }
  }

  moveItemBasedOnInproduct(subItem, list) {
    const optionToMove = list.querySelector(
      `option[value="${subItem.idsession}"]`
    );
    if (optionToMove) {
      this.moveOption(list, this.selectedList, optionToMove);
    }
  }

  render() {
    try {
      if (!this.availableList || !this.selectedList) {
        throw new Error("Elementos da lista não definidos.");
      }
      this.populateList(this.availableList, this.data);
    } catch (error) {
      console.error(`Erro ao renderizar lista: ${error.message}`);
    }
  }
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
      console.error(`Erro ao obter itens selecionados: ${error.message}`);
      return [];
    }
  }
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
      console.error(`Erro ao mover opção: ${error.message}`);
    }
  }
  removeEmptyOptGroups(list) {
    try {
      var optGroups = list.querySelectorAll("optgroup");
      optGroups.forEach((optGroup) => {
        if (optGroup.children.length === 0) {
          optGroup.remove();
        }
      });
    } catch (error) {
      console.error(`Erro ao remover optgroups vazios: ${error.message}`);
    }
  }
}
