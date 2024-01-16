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
  return dados.map(item => {
    return {
      idlevel1: item[keyMapping.idLevel1],
      level1name: item[keyMapping.level1Name],
      level2: [{
        idlevel2: item[keyMapping.idLevel2],
        level2name: item[keyMapping.level2Name]
      }]
    };
  });
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

