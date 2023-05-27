function readGrammar() {
    let grammarText = document.getElementById("grammar").value;
    let productions = grammarText.split("\n");
    let grammar = {};

    for (let i = 0; i < productions.length; i++) {
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
    return /^[^A-Z]+$/.test(symbol);
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


function showSets(set) {
    let resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    for (let nonTerminal in set) {
        // Eliminar las producciones recursivas del first
        if (!nonTerminal.endsWith("'")) {
            resultDiv.innerHTML += "<p>First(" + nonTerminal + ") = {" + set[nonTerminal].join(", ") + "}</p>";
        }
    }
}

function firstButton() {
    let grammar = readGrammar();
    let firstSets = calculateFirstSets(grammar);
    showSets(firstSets);
}

// function main() {
//     let grammar = readGrammar();
//     firstSet = calculateFirstSet(grammar);
// }
// window.addEventListener('load', main);



