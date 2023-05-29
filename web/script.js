let firstSets = {};
let followSets = {};
let grammarFixed = {};
let isLl1 = false;
let grammarTable = {};
let StringIsValid = false;

let haveDoneFirstSets = false;
let haveDoneFollowSets = false;
let haveDoneValidation = false;
let haveDoneTable = false;
let haveDoneStringAnalyze = false;

function readGrammar() {
    let grammarText = document.getElementById("grammar-input").value;
    let productions = grammarText.split("\n");
    let grammar = {};

    for (let i = 0; i < productions.length; i++) {
        if (productions[i] == "") {
            alert("No dejes lineas en blanco");
        }
        let noBlank = productions[i].replace(/\s/g, "");
        let production = noBlank.trim().split(">");
        let nonTerminal = production[0];
        let symbols = production[1].split("|");

        if (!grammar[nonTerminal]) {
            grammar[nonTerminal] = [];
        }

        for (let j = 0; j < symbols.length; j++) {
            grammar[nonTerminal].push(symbols[j]);
        }
    }

    return grammar;
}

function calculateFirstSets(grammar) {
    const firstSets = {};

    // Aplicar eliminación de recursión a la izquierda
    eliminateLeftRecursion(grammar);
    grammarFixed = grammar;

    // Recorrer cada símbolo no terminal en la gramática
    for (const nonTerminal in grammar) {
        if (grammar.hasOwnProperty(nonTerminal)) {
            calculateFirstSet(nonTerminal, grammar, firstSets);
        }
    }

    return firstSets;
}

function calculateFirstSet(symbol, grammar, firstSets) {
    // Verificar si el símbolo ya fue calculado
    if (firstSets.hasOwnProperty(symbol)) {
        return;
    }

    const productions = grammar[symbol];
    const firstSet = [];

    // Recorrer cada producción del símbolo no terminal
    for (const production of productions) {
        const firstSymbol = production[0];

        // Si el primer símbolo es un terminal, agregarlo al conjunto First
        if (isTerminal(firstSymbol)) {
            if (!firstSet.includes(firstSymbol)) {
                firstSet.push(firstSymbol);
            }
        }
        // Si el primer símbolo es un no terminal, calcular su conjunto First
        else if (grammar.hasOwnProperty(firstSymbol)) {
            calculateFirstSet(firstSymbol, grammar, firstSets);
            const firstOfFirstSymbol = firstSets[firstSymbol];

            // Agregar los símbolos del conjunto First del primer símbolo
            // excepto el símbolo de epsilon (#)
            for (const symbol of firstOfFirstSymbol) {
                if (symbol !== '#' && !firstSet.includes(symbol)) {
                    firstSet.push(symbol);
                }
            }

            let i = 1;

            // Continuar con los siguientes símbolos de la producción
            while (i < production.length && firstOfFirstSymbol.includes('#')) {
                const nextSymbol = production[i];

                // Si el siguiente símbolo es un terminal, agregarlo al conjunto First
                if (isTerminal(nextSymbol)) {
                    if (!firstSet.includes(nextSymbol)) {
                        firstSet.push(nextSymbol);
                    }
                    break;
                }
                // Si el siguiente símbolo es un no terminal, calcular su conjunto First
                else if (grammar.hasOwnProperty(nextSymbol)) {
                    calculateFirstSet(nextSymbol, grammar, firstSets);
                    const firstOfNextSymbol = firstSets[nextSymbol];

                    // Agregar los símbolos del conjunto First del siguiente símbolo
                    // excepto el símbolo de epsilon (#)
                    for (const symbol of firstOfNextSymbol) {
                        if (symbol !== '#' && !firstSet.includes(symbol)) {
                            firstSet.push(symbol);
                        }
                    }

                    i++;
                }
                // Si el siguiente símbolo no es ni terminal ni no terminal, terminar el ciclo
                else {
                    break;
                }
            }

            // Si todos los siguientes símbolos derivan en epsilon (#), agregar epsilon (#) al conjunto First
            if (i === production.length && firstOfFirstSymbol.includes('#') && !firstSet.includes('#')) {
                firstSet.push('#');
            }
        }
    }

    // Guardar el conjunto First del símbolo no terminal en el objeto firstSets
    firstSets[symbol] = firstSet;
}

function isTerminal(symbol) {
    return /^(?!.*[A-Z'])(?!.*[hA-Z]'$).*$/.test(symbol);
}

function eliminateLeftRecursion(grammar) {
    const nonTerminals = Object.keys(grammar);

    for (let i = 0; i < nonTerminals.length; i++) {
        const A = nonTerminals[i];
        const productionsA = grammar[A];

        for (let j = 0; j < i; j++) {
            const B = nonTerminals[j];
            const productionsB = grammar[B];

            for (const productionA of productionsA) {
                if (productionA.startsWith(B)) {
                    const restOfProductionA = productionA.slice(B.length);

                    // Eliminar la producción A -> BA'
                    grammar[A] = grammar[A].filter((production) => production !== productionA);

                    // Agregar las producciones A -> γA' para cada producción γ de B
                    for (const productionB of productionsB) {
                        grammar[A].push(productionB + restOfProductionA);
                    }
                }
            }
        }

        // Eliminar recursión directa si existe
        eliminateDirectRecursion(A, grammar);
    }
}

function eliminateDirectRecursion(nonTerminal, grammar) {
    const productions = grammar[nonTerminal];

    // Separar las producciones con y sin recursión directa
    const recursiveProductions = [];
    const nonRecursiveProductions = [];

    for (const production of productions) {
        if (production.startsWith(nonTerminal)) {
            recursiveProductions.push(production.slice(nonTerminal.length));
        } else {
            nonRecursiveProductions.push(production);
        }
    }

    if (recursiveProductions.length > 0) {
        // Crear un nuevo símbolo no terminal para las producciones recursivas
        const newNonTerminal = nonTerminal + "'";

        // Eliminar las producciones recursivas del símbolo no terminal original
        grammar[nonTerminal] = nonRecursiveProductions.map((production) => production + newNonTerminal);

        // Agregar las producciones recursivas al nuevo símbolo no terminal
        grammar[newNonTerminal] = recursiveProductions.map((production) => production + newNonTerminal);
        grammar[newNonTerminal].push('#'); // Agregar producción # al nuevo símbolo no terminal
    }
}

function calculateFollowSets(grammar, startSymbol) {
    const followSets = {};

    // Calcular el conjunto Follow de cada símbolo no terminal
    for (const nonTerminal in grammar) {
        if (grammar.hasOwnProperty(nonTerminal)) {
            calculateFollowSet(nonTerminal, grammar, followSets, startSymbol);
        }
    }

    return followSets;
}

function calculateFollowSet(symbol, grammar, followSets, startSymbol, processedNonTerminals = []) {
    // Verificar si el símbolo ya fue calculado
    if (followSets.hasOwnProperty(symbol)) {
        return;
    }

    const followSet = [];

    // Marcar el símbolo actual como procesado para evitar bucles infinitos
    processedNonTerminals.push(symbol);

    // Recorrer todas las producciones de la gramática
    for (const nonTerminal in grammar) {
        if (grammar.hasOwnProperty(nonTerminal)) {
            const productions = grammar[nonTerminal];

            // Recorrer cada producción para buscar el símbolo en cuestión
            for (const production of productions) {
                const symbolIndex = production.indexOf(symbol);

                // Si el símbolo no está presente en la producción, continuar con la siguiente producción
                if (symbolIndex === -1) {
                    continue;
                }

                // Si el símbolo está al final de la producción
                if (symbolIndex === production.length - 1) {
                    // Si el no terminal de la producción ya fue procesado, omitir su cálculo de Follow
                    if (processedNonTerminals.includes(nonTerminal)) {
                        continue;
                    }

                    // Calcular el conjunto Follow del no terminal de la producción
                    calculateFollowSet(nonTerminal, grammar, followSets, startSymbol, processedNonTerminals);
                    const followOfNonTerminal = followSets[nonTerminal];

                    // Agregar los símbolos del conjunto Follow del no terminal al conjunto Follow del símbolo actual
                    for (const followSymbol of followOfNonTerminal) {
                        if (!followSet.includes(followSymbol)) {
                            followSet.push(followSymbol);
                        }
                    }
                }
                // Si el símbolo no está al final de la producción
                else {
                    const nextSymbol = production[symbolIndex + 1];

                    // Si el siguiente símbolo es un terminal, agregarlo al conjunto Follow del símbolo actual
                    if (isTerminal(nextSymbol)) {
                        if (!followSet.includes(nextSymbol)) {
                            followSet.push(nextSymbol);
                        }
                    }
                    // Si el siguiente símbolo es un no terminal, calcular su conjunto First
                    // y agregar los símbolos excepto el símbolo de epsilon (#) al conjunto Follow del símbolo actual
                    else if (grammar.hasOwnProperty(nextSymbol)) {
                        calculateFirstSet(nextSymbol, grammar, {});

                        for (const firstSymbol of firstSets[nextSymbol]) {
                            if (firstSymbol !== '#' && !followSet.includes(firstSymbol)) {
                                followSet.push(firstSymbol);
                            }
                        }

                        // Si el conjunto First del siguiente símbolo contiene el símbolo de epsilon (#),
                        // agregar el conjunto Follow del símbolo no terminal al conjunto Follow del símbolo actual
                        if (firstSets[nextSymbol].includes('#')) {
                            // Evitar ciclos infinitos al calcular el conjunto Follow del símbolo actual
                            if (!processedNonTerminals.includes(nonTerminal) && nonTerminal !== startSymbol) {
                                calculateFollowSet(nonTerminal, grammar, followSets, startSymbol, processedNonTerminals);
                                const followOfNonTerminal = followSets[nonTerminal];

                                // Agregar los símbolos del conjunto Follow del no terminal al conjunto Follow del símbolo actual
                                for (const followSymbol of followOfNonTerminal) {
                                    if (!followSet.includes(followSymbol)) {
                                        followSet.push(followSymbol);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (symbol === startSymbol && !followSet.includes('$')) {
        followSet.push('$');
    }
    else if (followSet.length === 0) {
        followSet.push('$');
    }

    // Almacenar el conjunto Follow del símbolo actual en el objeto followSets
    followSets[symbol] = followSet;

    // Eliminar el símbolo actual de los no terminales procesados
    processedNonTerminals.pop();
}




function getStartSymbol() {
    let grammarText = document.getElementById("grammar-input").value;
    let startSymbol = grammarText[0]
    return startSymbol;
}

function isLL1Grammar(grammar, startSymbol) {
    for (const nonTerminal in grammar) {
        if (grammar.hasOwnProperty(nonTerminal)) {
            const productions = grammar[nonTerminal];

            // Verificar si hay ambigüedad en los conjuntos First de las producciones
            const firstSetsOfProductions = productions.map(production => calculateProductionFirstSet(production, firstSets));
            const unionOfFirstSets = new Set();

            for (const firstSet of firstSetsOfProductions) {
                for (const symbol of firstSet) {
                    if (unionOfFirstSets.has(symbol)) {
                        // Hay intersección en los conjuntos First de las producciones
                        return false;
                    }
                    unionOfFirstSets.add(symbol);
                }
            }

            for (const production of productions) {
                const productionFirstSet = calculateProductionFirstSet(production, firstSets);

                if (productionFirstSet.has('#')) {
                    const followSet = followSets[nonTerminal];
                    const intersection = new Set([...productionFirstSet].filter(x => followSet.includes(x)));

                    if (intersection.size > 0) {
                        // Hay intersección entre el conjunto First de una producción y el conjunto Follow del símbolo no terminal
                        return false;
                    }
                }
            }
        }
    }

    return true;
}

function calculateProductionFirstSet(production, firstSets) {
    const firstSet = new Set();

    for (const symbol of production) {
        if (isTerminal(symbol)) {
            firstSet.add(symbol);
            break;
        } else {
            const symbolFirstSet = firstSets[symbol];

            for (const symbol of symbolFirstSet) {
                if (symbol !== '#') {
                    firstSet.add(symbol);
                }
            }

            if (!symbolFirstSet.includes('#')) {
                break;
            }
        }
    }

    return firstSet;
}

function generateTable(grammar) {
    const parsingTable = {};

    for (const nonTerminal in grammar) {
        if (grammar.hasOwnProperty(nonTerminal)) {
            const productions = grammar[nonTerminal];

            for (const production of productions) {
                const firstSet = calculateProductionFirstSet(production, firstSets);

                for (const terminal of firstSet) {
                    if (terminal !== '#') {
                        if (!parsingTable.hasOwnProperty(nonTerminal)) {
                            parsingTable[nonTerminal] = {};
                        }
                        parsingTable[nonTerminal][terminal] = production;
                    }
                }

                if (firstSet.has('#')) {
                    const followSet = followSets[nonTerminal];

                    for (const terminal of followSet) {
                        if (!parsingTable.hasOwnProperty(nonTerminal)) {
                            parsingTable[nonTerminal] = {};
                        }
                        parsingTable[nonTerminal][terminal] = production;
                    }
                }
            }
        }
    }

    return parsingTable;
}

function analyzeString(input, grammar, startSymbol, parsingTable) {
    const stack = [startSymbol];
    let currentSymbol = stack.pop();
    let inputIndex = 0;

    while (currentSymbol !== undefined) {
        if (isTerminal(currentSymbol)) {
            if (currentSymbol === input[inputIndex]) {
                inputIndex++;
                currentSymbol = stack.pop();
            } else {
                return false; // El símbolo actual no coincide con el símbolo de entrada
            }
        } else if (grammar.hasOwnProperty(currentSymbol)) {
            let production = "";
            if (input[inputIndex] === undefined) {
                production = parsingTable[currentSymbol]["$"];
            } else {
                production = parsingTable[currentSymbol][input[inputIndex]];
            }
            if (production) {
                if (production === '#') {
                    currentSymbol = stack.pop();
                } else {
                    const symbols = production.split('').reverse();
                    stack.push(...symbols);
                    currentSymbol = stack.pop();
                }
            } else {
                return false; // No se encontró una producción en la tabla de análisis
            }
        } else {
            return false; // El símbolo actual no es ni terminal ni no terminal válido
        }
    }

    return inputIndex === input.length;
}

function item0Set(grammar) {
    var productionStrings = {};
  
    let firstNonTerminal = Object.keys(grammar)[0]; // Obtener el primer no terminal
    let auxProductionString = "." + firstNonTerminal;
    let newWord = firstNonTerminal + "'";
    productionStrings[newWord] = auxProductionString;
  
    for (const nonTerminal in grammar) {
      if (grammar.hasOwnProperty(nonTerminal)) {
        const productions = grammar[nonTerminal];
        const productionStringsForNonTerminal = [];
  
        for (let i = 0; i < productions.length; i++) {
          const production = productions[i];
          let productionString = "";
  
          if (production === "#") {
            productionString += " ."; // Producción con epsilon
          } else {
            productionString += "." + production; // A > .Eb
          }
  
          productionStringsForNonTerminal.push(productionString); // Guardando A > .Eb
        }
  
        productionStrings[nonTerminal] = productionStringsForNonTerminal;
      }
    }
  
    return productionStrings;
  }
  
  
  function goto(I, X) {
    const gotoSet = [];
  
    for (let i = 0; i < I.length; i++) {
      const item = I[i];
      const indexDot = item.indexOf(".");
  
      if (indexDot !== item.length - 1) {
        const newValue = item.substring(0, indexDot) + X + "." + item.substring(indexDot + 1);
        gotoSet.push(newValue);
      }
    }
  
    return gotoSet;
  }
  
  function gotoSet(item0) {
    let gotoSet = {};
    gotoSet.I0 = item0;
    let contador = 0;
  
    for (const item in item0) {
      let strItem0 = item0[item];
      for (const symbol in strItem0) {
        if (goto(item0[item], symbol).length > 0) {
          contador = contador + 1;
          let name = "I" + contador;
  
          gotoSet[name] = goto(item0[item], symbol);
        }
      }
    }
  
    return gotoSet;
  }

function showFirstSets(set) {
    let resultDiv = document.getElementById("firstResult");
    resultDiv.innerHTML = "";

    for (let nonTerminal in set) {
        // Eliminar las producciones recursivas del first
        if (!nonTerminal.endsWith("'")) {
            resultDiv.innerHTML += "<p>First(" + nonTerminal + ") = {" + set[nonTerminal].join(", ") + "}</p>";
        } else {
            resultDiv.innerHTML += "<p>First(" + nonTerminal + ") = {" + set[nonTerminal].join(", ") + "} <b>Produccion creada para la eliminacion de la recursion por izquierda</b></p>";
        }
    }
}

function showFollowSets(set) {
    let resultDiv = document.getElementById("followResult");
    resultDiv.innerHTML = "";

    for (let nonTerminal in set) {
        // Eliminar las producciones recursivas del first
        if (!nonTerminal.endsWith("'")) {
            resultDiv.innerHTML += "<p>Follow(" + nonTerminal + ") = {" + set[nonTerminal].join(", ") + "}</p>";
        } else {
            resultDiv.innerHTML += "<p>Follow(" + nonTerminal + ") = {" + set[nonTerminal].join(", ") + "} <b>Produccion creada para la eliminacion de la recursion por izquierda</b></p>";
        }
    }
}

function showIsll1(isLl1) {
    let resultDiv = document.getElementById("ll1-validation-result");
    if (isLl1) {
        resultDiv.innerHTML = "<p style='color: green'>Si es LL(1)<p>";
    } else {
        resultDiv.innerHTML = "<p style='color: red'>No es LL(1)<p>";
    }
}

function showTable(table) {
    const tableResult = document.getElementById('ll1-table-result');

    // Crear la estructura de la tabla
    const tableElement = document.createElement('table');
    tableElement.classList.add('ll1-table');

    // Obtener los no terminales y terminales
    const nonTerminals = Object.keys(table);
    const terminals = new Set();

    for (const nonTerminal in table) {
        const productions = table[nonTerminal];
        Object.keys(productions).forEach((terminal) => {
            terminals.add(terminal);
        });
    }

    // Crear la primera fila de terminales
    const terminalsRow = document.createElement('tr');
    terminalsRow.appendChild(createTableCell(''));

    for (const terminal of terminals) {
        terminalsRow.appendChild(createTableCell(terminal));
    }

    // Agregar la primera fila de terminales a la tabla
    tableElement.appendChild(terminalsRow);

    // Crear las filas con las producciones correspondientes
    for (const nonTerminal of nonTerminals) {
        const productionsRow = document.createElement('tr');
        productionsRow.appendChild(createTableCell(nonTerminal));

        for (const terminal of terminals) {
            const production = table[nonTerminal][terminal] || '';
            productionsRow.appendChild(createTableCell(production));
        }

        // Agregar la fila de producciones a la tabla
        tableElement.appendChild(productionsRow);
    }

    // Limpiar el contenedor y agregar la tabla
    tableResult.innerHTML = '';
    tableResult.appendChild(tableElement);
}

function createTableCell(content) {
    const cell = document.createElement('td');
    cell.textContent = content;
    return cell;
}

function showAnalyzeString(isValid) {
    let resultDiv = document.getElementById("string-analysis-result");
    let string = document.getElementById("input-string").value;
    if (isValid) {
        resultDiv.innerHTML = "<p>'" + string + "' SI hace parte del diccionario de la gramatica<p>";
    } else {
        resultDiv.innerHTML = "<p>'" + string + "' NO hace parte del diccionario de la gramatica<p>";
    }
}

function showItem0(set) {
    let item0Result = document.getElementById("item0Result");
    item0Result.innerHTML = "";
  
    for (const nonTerminal in set) {
      item0Result.innerHTML += "<p>" + nonTerminal + " > " + set[nonTerminal] + "</p>";
    }
  }

  function showGoto(set) {
    let resultDiv = document.getElementById("gotoResult");
    resultDiv.innerHTML = JSON.stringify(set);
  }


document.getElementById("grammar-input").addEventListener("input", function () {
    firstSets = {};
    followSets = {};
    grammarFixed = {};
    isLl1 = false;
    grammarTable = {};
    StringIsValid = false;

    haveDoneFirstSets = false;
    haveDoneFollowSets = false;
    haveDoneValidation = false;
    haveDoneTable = false;
    haveDoneStringAnalyze = false;

    document.getElementById("string-analysis-result").innerHTML = "";
    document.getElementById("ll1-table-result").innerHTML = "";
    document.getElementById("input-string").value = "";
    document.getElementById("ll1-validation-result").innerHTML = "";
    document.getElementById("followResult").innerHTML = "";
    document.getElementById("firstResult").innerHTML = "";
    document.getElementById("item0Result").innerHTML = "";git
});


function firstButton() {
    let grammar = readGrammar();
    let newFirstSets = calculateFirstSets(grammar);
    showFirstSets(newFirstSets);
    firstSets = newFirstSets;
    haveDoneFirstSets = true;
}

function followButton() {
    if (haveDoneFirstSets) {
        let grammar = grammarFixed;
        let startSymbol = getStartSymbol();
        let newFollowSets = calculateFollowSets(grammar, startSymbol);
        showFollowSets(newFollowSets);
        followSets = newFollowSets;
        haveDoneFollowSets = true;
    } else {
        alert("Debes calcular los conjuntos First antes de calcular los de Follow");
    }

}

function ll1Button() {
    if (haveDoneFollowSets) {
        let grammar = grammarFixed;
        let startSymbol = getStartSymbol();
        let newIsLl1 = isLL1Grammar(grammar, startSymbol, firstSets, followSets);
        showIsll1(newIsLl1);
        isLl1 = newIsLl1;
        haveDoneValidation = true;
    } else {
        alert("Debes calcular los conjuntos First y Follow para saber si la gramatica es LL(1)");
    }
}

function tableButton() {
    if (isLl1) {
        let grammar = grammarFixed;
        let newTable = generateTable(grammar);
        showTable(newTable);
        grammarTable = newTable;
        haveDoneTable = true;
    } else if (!haveDoneValidation) {
        alert("Debes validar si la gramatica es LL(1) primero");
    } else {
        alert("La gramatica no es LL(1)");
    }
}

function stringButton() {
    if (haveDoneTable) {
        let input = document.getElementById("input-string").value;
        if (input === "") {
            alert("Debes ingresar alguna cadena para analizarla");
        } else {
            let grammar = grammarFixed;
            let startSymbol = getStartSymbol();
            let newStringValid = analyzeString(input, grammar, startSymbol, grammarTable);
            showAnalyzeString(newStringValid);
            StringIsValid = newStringValid;
            haveDoneStringAnalyze = true;
        }
    } else {
        alert("Debes crear la tabla de LL(1) primero");
    }
}

function item0Button() {
    let grammar = readGrammar();
    let set = item0Set(grammar);
    showItem0(set);
  }
  
  function gotoButton() {
    let grammar = readGrammar();
    let item0 = item0Set(grammar);
    let item0Response = gotoSet(item0);
    showGoto(item0Response);
  }





