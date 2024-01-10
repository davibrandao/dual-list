// Função para normalizar as chaves de um objeto para minúsculas
function normalizeKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {});
}

// Função de tradução com mapeamento flexível de chaves
export function translateToDualListBoxFormat(inputObject, keyMapping) {
  const normalizedInput = normalizeKeys(inputObject);

  const idLevel1Key = keyMapping.idlevel1 && normalizedInput[keyMapping.idlevel1.toLowerCase()];
  const level1NameKey = keyMapping.level1name && normalizedInput[keyMapping.level1name.toLowerCase()];
  if (!idLevel1Key || !level1NameKey) {
    console.error("idlevel1 ou level1name obrigatório não encontrado no objeto.");
    return null;
  }

  const translatedObject = {
    idlevel1: idLevel1Key,
    level1name: level1NameKey,
    Level2: []
  };

  // Ajuste aqui: Assegurando que o mapeamento para os níveis 2 está correto
  const levels2Data = normalizedInput[keyMapping.levels2.toLowerCase()];
  if (levels2Data && Array.isArray(levels2Data)) {
    levels2Data.forEach(level2Item => {
      const normalizedLevel2 = normalizeKeys(level2Item);
      if (normalizedLevel2['idlevel2'] && normalizedLevel2['level2name']) {
        translatedObject.Level2.push({
          idlevel2: normalizedLevel2['idlevel2'],
          level2name: normalizedLevel2['level2name']
        });
      }
    });
  } else {
    console.error("Levels2 não encontrado ou não é um array.");
  }


  return translatedObject;
}

