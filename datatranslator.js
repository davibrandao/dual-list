// Função para normalizar as chaves de um objeto para minúsculas
function normalizeKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {});
}

// Função de tradução modificada para lidar com um array de objetos
export function translateToDualListBoxFormat(inputArray, keyMapping) {
  return inputArray.map(inputObject => {
    const normalizedInput = normalizeKeys(inputObject);

    const idLevel1Key = keyMapping.idlevel1 && normalizedInput[keyMapping.idlevel1.toLowerCase()];
    const level1NameKey = keyMapping.level1name && normalizedInput[keyMapping.level1name.toLowerCase()];
    if (!idLevel1Key || !level1NameKey) {
      console.error("idlevel1 ou level1name obrigatório não encontrado no objeto.");
      return null;
    };

    const translatedObject = {
      idlevel1: idLevel1Key,
      level1name: level1NameKey,
      level2: []
    };

    // Ajuste aqui: Assegurando que o mapeamento para os níveis 2 está correto
    const levels2Data = normalizedInput[keyMapping.levels2.toLowerCase()];
    if (levels2Data && Array.isArray(levels2Data)) {
      levels2Data.forEach(level2Item => {
        const normalizedLevel2 = normalizeKeys(level2Item);
        if (normalizedLevel2['idlevel2'] && normalizedLevel2['level2name']) {
          translatedObject.level2.push({
            idlevel2: normalizedLevel2['idlevel2'],
            level2name: normalizedLevel2['level2name']
          });
        }
      });
    } else {
      console.error("Levels2 não encontrado ou não é um array.");
    }
    return translatedObject;
  }).filter(item => item != null); // Filtra os objetos nulos
}



/**
 * Valida um esquema JSON contra um conjunto de regras.
 * Verifica se o esquema é um objeto válido, se cada propriedade tem um tipo definido,
 * e se as propriedades do tipo 'object' ou 'array' também possuem esquemas válidos.
 *
 * @param {object} schema - O esquema JSON a ser validado.
 * @returns {boolean} Retorna true se o esquema é válido, false caso contrário.
 */
export function validateSchema(schema) {
  if (typeof schema !== 'object' || schema === null) {
    console.error("Esquema fornecido não é um objeto válido.");
    return false;
  }

  if (schema.type !== 'object' || typeof schema.properties !== 'object') {
    console.error("Esquema de objeto esperado com propriedades definidas.");
    return false;
  }

  for (const key in schema.properties) {
    const property = schema.properties[key];

    if (typeof property !== 'object' || typeof property.type !== 'string') {
      console.error(`Propriedade '${key}' no esquema não é definida corretamente.`);
      return false;
    }

    // Validação recursiva para propriedades do tipo 'object' e 'array'
    if ((property.type === 'object' && property.properties && !validateSchema(property)) ||
      (property.type === 'array' && (!property.items || typeof property.items !== 'object' || !validateSchema(property.items)))) {
      return false;
    }
  }

  return true;
}


export function transformAndCompareWithSchema(array, schema) {
  function transformObject(obj, schemaProperties) {
    const transformed = {};
    for (const key in schemaProperties) {
      const property = schemaProperties[key];

      if (property.type === 'array' && property.items && property.items.properties) {
        // Cria um array para as propriedades do tipo array
        transformed[key] = [transformObject(obj, property.items.properties)];
      } else if (typeof obj[key] !== 'undefined') {
        // Copia o valor se existir no objeto
        transformed[key] = obj[key];
      }
    }
    return transformed;
  }

  for (const nestedArray of array) {
    for (const subArray of nestedArray) {
      for (const obj of subArray) {
        const transformedObj = transformObject(obj, schema.properties);
        if (!compareObjectWithSchema(transformedObj, schema.properties)) {
          return false;
        }
      }
    }
  }
  return true;
}

function compareObjectWithSchema(obj, schemaProperties) {
  for (const key in schemaProperties) {
    if (typeof obj[key] === 'undefined') {
      console.log(`Propriedade faltando: ${key}`);
      return false;
    }
    const property = schemaProperties[key];
    if (property.type === 'array') {
      if (!Array.isArray(obj[key])) {
        console.log(`Esperado array, encontrado: ${typeof obj[key]} para a propriedade ${key}`);
        return false;
      }
      if (property.items && property.items.properties) {
        for (const item of obj[key]) {
          if (!compareObjectWithSchema(item, property.items.properties)) {
            return false;
          }
        }
      }
    } else if (typeof obj[key] !== property.type) {
      console.log(`Tipo incorreto para ${key}: esperado ${property.type}, encontrado ${typeof obj[key]}`);
      return false;
    }
  }
  return true;
}

export function buildObjectFromSchema(array, schema) {
  function processObject(obj, schemaProperties) {
    const resultObj = {};

    for (const key in schemaProperties) {
      const property = schemaProperties[key];

      if (property.type === 'array' && property.items && property.items.properties) {
        // Para propriedades do tipo array, processa os itens do array conforme definido em 'items.properties'
        if (Array.isArray(obj)) {
          resultObj[key] = obj.map(item => processObject(item, property.items.properties));
        } else {
          // Se a propriedade esperada é um array, mas o objeto atual não é, inicializa como um array vazio
          resultObj[key] = [];
        }
      } else {
        // Para propriedades não-array, copia o valor diretamente
        resultObj[key] = obj[key];
      }
    }

    return resultObj;
  }

  const finalResult = {};

  for (const nestedArray of array) {
    for (const subArray of nestedArray) {
      for (const obj of subArray) {
        // Combina o objeto processado com o resultado final
        const processedObj = processObject(obj, schema.properties);
        for (const key in processedObj) {
          if (finalResult[key] === undefined) {
            finalResult[key] = processedObj[key];
          } else if (Array.isArray(finalResult[key])) {
            finalResult[key].push(...processedObj[key]);
          }
        }
      }
    }
  }

  return finalResult;
}

export function createEmptyObjectFromSchema(schema) {
  function createObject(schemaProperties) {
    const resultObj = {};

    for (const key in schemaProperties) {
      const property = schemaProperties[key];
      if (property.type === 'array') {
        if (property.items && property.items.properties) {
          // Cria uma estrutura de objeto para cada item no array
          resultObj[key] = [createObject(property.items.properties)];
        } else {
          // Se não houver propriedades adicionais definidas, inicializa um array vazio
          resultObj[key] = [];
        }
      } else {
        // Inicializa como null para propriedades simples
        resultObj[key] = null;
      }
    }

    return resultObj;
  }

  return createObject(schema.properties);
}

export function fillObjectWithData(emptyObj, dataArray, schema) {
  // Reset the level2 array to avoid initializing with a null object
  emptyObj.level2 = [];

  for (let i = 0; i < dataArray.length; i++) {
    for (let j = 0; j < dataArray[i].length; j++) {
      for (let k = 0; k < dataArray[i][j].length; k++) {
        const dataItem = dataArray[i][j][k];
        const schemaProperties = schema.properties;

        // Populate the top-level properties
        for (const key in schemaProperties) {
          if (schemaProperties[key].type !== 'array') {
            emptyObj[key] = dataItem[key];
          } else {
            // Handle nested array properties
            const nestedArraySchema = schemaProperties[key].items.properties;
            const nestedObj = {};
            let hasData = false;

            for (const nestedKey in nestedArraySchema) {
              nestedObj[nestedKey] = dataItem[nestedKey];
              if (dataItem[nestedKey] !== null && dataItem[nestedKey] !== undefined) {
                hasData = true;
              }
            }

            // Only add the nested object if it has data
            if (hasData) {
              emptyObj[key].push(nestedObj);
            }
          }
        }
      }
    }
  }
  return emptyObj;
}


function mergeOrAddItem(resultArray, newItem, primaryKey) {
  const existingItemIndex = resultArray.findIndex(item => item[primaryKey] === newItem[primaryKey]);

  if (existingItemIndex !== -1) {
    // Mescla os dados se o item já existir
    resultArray[existingItemIndex] = { ...resultArray[existingItemIndex], ...newItem };
  } else {
    // Adiciona um novo item se não existir
    resultArray.push(newItem);
  }
}

function processItem(item, schemaProperties, level) {
  const newItem = {};

  for (const key in schemaProperties) {
    if (schemaProperties[key].type === 'array' && item[key]) {
      newItem[`level${level}`] = item[key].map(subItem => processItem(subItem, schemaProperties[key].items.properties, level + 1));
    } else if (item[key]) {
      newItem[`idlevel${level}`] = item[key];
      newItem[`level${level}name`] = key;
    }
  }

  return newItem;
}


/**
 * Processa dados de entrada com base em um esquema JSON e propriedades de agrupamento.
 * Agrupa dados com base nas propriedades especificadas e processa cada nível de aninhamento.
 *
 * @param {array} inputData - Dados de entrada a serem processados.
 * @param {object} jsonSchema - O esquema JSON usado para o processamento dos dados.
 * @param {array} groupingProperties - Propriedades usadas para agrupar os dados.
 */
export function populateObjectsFromData(inputData, jsonSchema, groupingProperties) {
  try {
    if (!Array.isArray(inputData) || typeof jsonSchema !== 'object' || !Array.isArray(groupingProperties)) {
      throw new Error('Dados de entrada, esquema JSON ou propriedades de agrupamento inválidos.');
    }

    // Agrupa os dados com base nas propriedades especificadas e processa cada grupo
    const groupedData = groupBySpecifiedProperties(inputData.flat(2), groupingProperties);
    return createTopLevelObjects(groupedData, groupingProperties);
  } catch (error) {
    console.error(`Erro ao processar os dados: ${error.message}`);
    return []; // Retorna um array vazio em caso de erro
  }
}


// Agrupa dados com base em propriedades especificadas
function groupBySpecifiedProperties(data, properties) {
  const groupedData = {};
  data.forEach(item => {
    // Cria uma chave única para cada grupo com base nas propriedades especificadas
    const key = properties.map(prop => item[prop]).join('_');
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(item);
  });
  return groupedData;
}

// Cria objetos de nível superior com base nos dados agrupados
function createTopLevelObjects(groupedData, groupingProperties) {
  return Object.values(groupedData).map(group => {
    // Inicializa o objeto de nível superior com base no primeiro item do grupo
    let topLevelObject = createInitialTopLevelObject(group[0], groupingProperties);

    // Processa cada item do grupo para adicionar objetos de nível 2
    group.forEach(item => {
      const level2Object = createLevel2Object(item, groupingProperties);
      topLevelObject.level2.push(level2Object);
    });

    return topLevelObject;
  });
}

// Cria um objeto de nível superior inicial com base no primeiro item do grupo
function createInitialTopLevelObject(item, groupingProperties) {
  let topLevelObject = {};
  groupingProperties.forEach(prop => {
    topLevelObject[prop] = item[prop]; // Define cada propriedade de agrupamento no objeto de nível superior
  });
  topLevelObject.level2 = []; // Inicializa o array para objetos de nível 2
  return topLevelObject;
}

// Cria um objeto de nível 2 com base no item atual
function createLevel2Object(item, groupingProperties) {
  let level2Object = {};
  Object.keys(item).forEach(key => {
    // Inclui no objeto de nível 2 todas as propriedades que não são de agrupamento
    if (!groupingProperties.includes(key)) {
      level2Object[key] = item[key];
    }
  });
  return level2Object;
}
