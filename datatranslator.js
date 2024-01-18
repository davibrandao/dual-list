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

// export function estruturarDados(dadosEvento, dadosMeeting, eventoKeyMapping, meetingKeyMapping, nomePadrao) {
//   var resultado = {};

//   // Processar dados de Evento
//   dadosEvento.forEach(item => {
//     var idLevel1 = item[eventoKeyMapping.idLevel1];
//     var level1Name = item[eventoKeyMapping.level1Name];
//     var idLevel2 = item[eventoKeyMapping.idLevel2];
//     var level2Name = item[eventoKeyMapping.level2Name];

//     if (!resultado[idLevel1]) {
//       resultado[idLevel1] = { idlevel1: idLevel1, level1name: level1Name, level2: [] };
//     }
//     resultado[idLevel1].level2.push({ idlevel2: idLevel2, level2name: level2Name });
//   });

//   // Processar dados de Meeting
//   dadosMeeting.forEach(item => {
//     var idLevel1 = item[meetingKeyMapping.linkname];
//     var level1Name = item[meetingKeyMapping.hasMeetingURL] === '1' ? nomePadrao : idLevel1;
//     var idLevel2 = item[meetingKeyMapping.idsession];
//     var level2Name = nomePadrao;

//     if (!resultado[idLevel1]) {
//       resultado[idLevel1] = { idlevel1: idLevel1, level1name: level1Name, level2: [] };
//     }
//     resultado[idLevel1].level2.push({ idlevel2: idLevel2, level2name: level2Name });
//   });

//   return Object.values(resultado);
// }


export function estruturarEvento(dados, keyMapping) {
  const resultado = {};

  dados.forEach(item => {
    const idLevel1 = item[keyMapping.idLevel1];
    const level1Name = item[keyMapping.level1Name];

    if (!resultado[idLevel1]) {
      resultado[idLevel1] = {
        idlevel1: idLevel1,
        level1name: level1Name,
        level2: []
      };
    }

    // Verifica se 'level2' é um array e processa cada item
    if (Array.isArray(item.level2)) {
      item.level2.forEach(subItem => {
        resultado[idLevel1].level2.push({
          idlevel2: subItem[keyMapping.idLevel2],
          level2name: subItem[keyMapping.level2Name]
        });
      });
    } else {
      // Processa um único item de nível 2
      const idLevel2 = item[keyMapping.idLevel2];
      const level2Name = item[keyMapping.level2Name];
      resultado[idLevel1].level2.push({
        idlevel2: idLevel2,
        level2name: level2Name
      });
    }
  });

  return Object.values(resultado);
}



export function estruturarMeeting(dados, keyMapping, nomePadrao) {
  return dados.map(item => {
    return {
      idlevel1: item[keyMapping.linkname],
      level1name: item[keyMapping.hasMeetingURL] === '1' ? nomePadrao : item[keyMapping.linkname],
      level2: [{
        idlevel2: item[keyMapping.idsession],
        level2name: nomePadrao
      }]
    };
  });
}

export function unificarDados(dadosEvento, dadosMeeting) {
  return [...dadosEvento, ...dadosMeeting];
}

export function estruturarDados(dados, keyMapping) {
  const resultado = [];

  dados.forEach(grupo => {
    if (grupo.length >= 2) {
      const dadosNivel1 = grupo[0][0]; // Primeiro objeto da primeira linha
      const dadosNivel2 = grupo[1][0]; // Primeiro objeto da segunda linha

      const itemNivel1 = {
        idlevel1: dadosNivel1[keyMapping.idLevel1],
        level1name: dadosNivel1[keyMapping.level1Name],
        level2: [{
          idlevel2: dadosNivel2[keyMapping.idLevel2],
          level2name: dadosNivel2[keyMapping.level2Name]
        }]
      };

      // Adicionando informações adicionais, se necessário
      for (const extraKey in keyMapping.extraNivel1) {
        itemNivel1[extraKey] = dadosNivel1[keyMapping.extraNivel1[extraKey]];
      }

      for (const extraKey in keyMapping.extraNivel2) {
        itemNivel1.level2[0][extraKey] = dadosNivel2[keyMapping.extraNivel2[extraKey]];
      }

      resultado.push(itemNivel1);
    }
  });

  return resultado;
}

export function transformarDadosComBaseNoSchema(inputArray, jsonSchema) {
  // Verifica se o schema e a entrada são válidos
  if (!Array.isArray(inputArray) || typeof jsonSchema !== 'object') {
    throw new Error('Invalid input or schema');
  }

  // Função auxiliar para transformar cada item com base no schema
  function transformItem(item, schema) {
    const result = {};

    // Itera sobre as propriedades do schema
    for (const key in schema.properties) {
      const prop = schema.properties[key];
      if (prop.type === 'array' && Array.isArray(item[key])) {
        // Processa recursivamente para arrays
        result[key] = item[key].map(subItem => transformItem(subItem, prop.items));
      } else if (typeof item[key] !== 'undefined') {
        // Copia o valor conforme está no item
        result[key] = item[key];
      }
    }

    return result;
  }

  // Transforma cada item do array de entrada
  const transformedData = inputArray.map(subArray =>
    subArray.map(item => transformItem(item, jsonSchema))
  );

  return transformedData;
}


export function validateSchema(schema) {
  if (typeof schema !== 'object' || schema === null) {
    return false;
  }

  if (schema.type !== 'object' || typeof schema.properties !== 'object') {
    return false;
  }

  for (const key in schema.properties) {
    const property = schema.properties[key];
    if (typeof property !== 'object' || typeof property.type !== 'string') {
      return false;
    }

    if (property.type === 'object' && property.properties) {
      if (!validateSchema(property)) {
        return false;
      }
    }

    if (property.type === 'array') {
      if (!property.items || typeof property.items !== 'object' || !validateSchema(property.items)) {
        return false;
      }
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


export function populateObjectsFromData(inputData, jsonSchema, groupingProperties) {
  if (!Array.isArray(inputData) || typeof jsonSchema !== 'object' || !Array.isArray(groupingProperties)) {
    console.error('Dados de entrada, schema JSON ou propriedades de agrupamento inválidos');
    return;
  }

  function groupDataByProperties(data, properties) {
    const groupedData = {};
    data.forEach(item => {
      const key = properties.map(prop => item[prop]).join('_');
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    });
    return groupedData;
  }


  // Processa cada nível de aninhamento
  function processLevel(data, schema, level) {
    if (!Array.isArray(data)) {
      console.error('Dados esperados como array no nível', level);
      return [];
    }

    return data.map(item => {
      let processedItem = {};
      for (let key in schema.properties) {
        const propSchema = schema.properties[key];
        if (propSchema.type === "array") {
          // Verifica se a propriedade existe e é um array
          if (Array.isArray(item[key])) {
            processedItem[key] = processLevel(item[key], propSchema.items, level + 1);
          } else {
            console.warn('Propriedade array', key, 'não encontrada ou não é um array no nível', level);
            // Opcional: Atribuir um valor padrão se necessário
            // processedItem[key] = []; // Por exemplo
          }
        } else {
          if (Array.isArray(item) && item.length > 0) {
            processedItem[key] = item[0][key];
          } else {
            console.error(`Propriedade ${key} não encontrada no nível`, level);
          }
        }
      }
      return processedItem;
    });
  }

  // Agrupa os dados de entrada
  const groupedInputData = groupDataByProperties(inputData.flat(2), groupingProperties);

  return Object.values(groupedInputData).map(group => {
    let topLevelObject = {};
    group.forEach(item => {
      groupingProperties.forEach(prop => {
        topLevelObject[prop] = item[prop];
      });
      let level2Object = {};
      Object.keys(item).forEach(key => {
        if (!groupingProperties.includes(key)) {
          level2Object[key] = item[key];
        }
      });
      if (!topLevelObject.level2) {
        topLevelObject.level2 = [];
      }
      topLevelObject.level2.push(level2Object);
    });
    return topLevelObject;
  });
}



// export function populateObjectsFromData(inputData, jsonSchema) {
//   if (!Array.isArray(inputData) || typeof jsonSchema !== 'object') {
//     console.error('Dados de entrada ou schema JSON inválidos');
//     return;
//   }

//   function processLevel(data, schema, level) {
//     if (!Array.isArray(data)) {
//       console.error('Dados esperados como array no nível', level);
//       return [];
//     }

//     return data.map(item => {
//       let processedItem = {};
//       for (let key in schema.properties) {
//         const propSchema = schema.properties[key];
//         if (propSchema.type === "array") {
//           // Verifica se a propriedade existe e é um array
//           if (Array.isArray(item[key])) {
//             processedItem[key] = processLevel(item[key], propSchema.items, level + 1);
//           } else {
//             console.warn('Propriedade array', key, 'não encontrada ou não é um array no nível', level);
//             // Opcional: Atribuir um valor padrão se necessário
//             // processedItem[key] = []; // Por exemplo
//           }
//         } else {
//           if (Array.isArray(item) && item.length > 0) {
//             processedItem[key] = item[0][key];
//           } else {
//             console.error(`Propriedade ${key} não encontrada no nível`, level);
//           }
//         }
//       }
//       return processedItem;
//     });
//   }

//   return processLevel(inputData[0], jsonSchema, 1);
// }