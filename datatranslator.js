// Função para normalizar as chaves de um objeto para minúsculas
function normalizeKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase()] = obj[key];
    return acc;
  }, {});
}

// Função de tradução com mapeamento flexível de chaves
export function translateToDualListBoxFormat(inputObject, keyMapping) {
  // Normaliza as chaves do objeto de entrada
  const normalizedInput = normalizeKeys(inputObject);

  // Verifica se idlevel1 e idlevel2 estão presentes
  const idLevel1Key = keyMapping.idlevel1 ? keyMapping.idlevel1.toLowerCase() : null;
  const idLevel2Key = keyMapping.idlevel2 ? keyMapping.idlevel2.toLowerCase() : null;
  if (!idLevel1Key || !normalizedInput[idLevel1Key] || !idLevel2Key || !normalizedInput[idLevel2Key]) {
    console.error("idlevel1 ou idlevel2 obrigatório não encontrado no objeto.");
    return null;
  }

  // Constrói um novo objeto com base no mapeamento fornecido
  const translatedObject = {};
  Object.keys(keyMapping).forEach(standardKey => {
    const inputKey = keyMapping[standardKey].toLowerCase();
    translatedObject[standardKey] = normalizedInput[inputKey];
  });

  return translatedObject;
}



