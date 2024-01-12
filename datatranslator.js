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

export function estruturarEvento(dados) {
  var resultado = {};
  dados.forEach(linha => {
    var [idLevel1, level1Name, idLevel2, level2Name] = linha.split('\t');

    if (!resultado[idLevel1]) {
      resultado[idLevel1] = { idlevel1: idLevel1, level1name: level1Name, level2: [] };
    }
    resultado[idLevel1].level2.push({ idlevel2: idLevel2, level2name: level2Name });
  });

  return Object.values(resultado);
}


export function estruturarMeeting(dados, nomePadrao) {
  var resultado = {};
  dados.forEach(linha => {
    var [linkname, idsession, , hasMeetingURL] = linha.split('\t');

    var nomeUsado = hasMeetingURL === '1' ? nomePadrao : linkname;

    if (!resultado[idsession]) {
      resultado[idsession] = { idlevel1: linkname, level1name: nomeUsado, level2: [] };
    }

    // Exemplo: adicionando um item de nível 2 com ID e nome específicos
    resultado[idsession].level2.push({ idlevel2: idsession, level2name: "Meeting Room" });
  });

  return Object.values(resultado);
}

export function unificarDados(dadosEvento, dadosMeeting) {
  var unificados = {};

  // Processa os dados de eventos
  dadosEvento.forEach(item => {
    unificados[item.idlevel1] = item;
  });

  // Processa os dados de meetings, combinando com eventos se necessário
  dadosMeeting.forEach(item => {
    if (unificados[item.idlevel1]) {
      // Combina os níveis 2 se o nível 1 já existir
      unificados[item.idlevel1].level2 = [...unificados[item.idlevel1].level2, ...item.level2];
    } else {
      unificados[item.idlevel1] = item;
    }
  });

  return Object.values(unificados);
}

