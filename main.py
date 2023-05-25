import string

lista_terminales = list(string.digits + string.ascii_lowercase + string.punctuation)
lista_noTerminales = list(string.ascii_uppercase)
epsilom = "#"

diccionario_first = {}
diccionario_follow = {}
diccionario = {}


def main():
    # Leer la gramática
    cadena = []
    while True:
        gramatica = input("Ingrese un string para la gramática (deje en blanco para finalizar): ")
        new_gramatica = gramatica.replace(" ", "")
        if not gramatica:
            break
        cadena_aux = list(new_gramatica)
        cadena.append(cadena_aux)

    # Organizar la gramática en un diccionario
    aumentador_not_used = 0
    lista_inicio_not_used = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    for i in range(len(cadena)):
        clave = cadena[i][0]
        if clave in diccionario:
            if diccionario[clave] != cadena[i][2:]:
                diccionario[clave + lista_inicio_not_used[aumentador_not_used]] = cadena[i][2:]
                aumentador_not_used += 1
        else:
            diccionario[clave] = cadena[i][2:]

    # Verificar si la gramática es LL(1)
    if not is_ll1_grammar(diccionario):
        print("error")
        return

    # Calcular conjuntos First y Follow
    calculate_first_sets(diccionario)
    calculate_follow_sets(diccionario)

    # Construir tabla de análisis sintáctico
    tabla_analisis = build_syntax_table(diccionario)

    # Procesar las cadenas de entrada
    while True:
        entrada = input("Ingrese una cadena a analizar (deje en blanco para finalizar): ")
        if not entrada:
            break
        if analyze_string(entrada, tabla_analisis):
            print("si")
        else:
            print("no")


def is_ll1_grammar(grammar):
    for A in grammar.keys():
        productions = grammar[A]
        first_sets = set()

        # Calcular el conjunto First de las producciones
        for production in productions:
            if production[0] in lista_terminales or production[0] == epsilom:
                first_sets.add(production[0])
            elif production[0] in lista_noTerminales:
                first_sets.update(diccionario_first[production[0]])

        # Verificar si hay intersección en los conjuntos First
        for B in grammar.keys():
            if B != A:
                for production in grammar[B]:
                    if production[0] in first_sets:
                        print("error")
                        return False

        # Verificar si hay ambigüedad en los conjuntos First
        for production1 in productions:
            for production2 in productions:
                if production1 != production2:
                    if production1[0] in lista_noTerminales and production2[0] in lista_noTerminales:
                        first1 = diccionario_first[production1[0]]
                        first2 = diccionario_first[production2[0]]
                        if len(first1.intersection(first2)) > 0:
                            print("error")
                            return False
    return True



def calculate_first_sets(grammar):
    for A in grammar.keys():
        calculate_first_set(A, grammar)

def calculate_first_set(symbol, grammar):
    if symbol in lista_terminales:
        return set([symbol])

    first_set = set()

    for production in grammar[symbol]:
        if production[0] == epsilom:
            first_set.add(epsilom)
        elif production[0] in lista_terminales:
            first_set.add(production[0])
        elif production[0] in lista_noTerminales:
            first_set.update(calculate_first_set(production[0], grammar))

        if epsilom not in production:
            break

    return first_set


def calculate_follow_sets(start_symbol, grammar):
    diccionario_follow[start_symbol] = set(['$'])  # Agregamos el símbolo de fin de cadena al conjunto Follow del símbolo inicial

    for symbol in grammar.keys():
        calculate_follow_set(symbol, grammar)

def calculate_follow_set(symbol, grammar):
    if symbol == start_symbol:
        return diccionario_follow[symbol]  # El conjunto Follow del símbolo inicial ya ha sido calculado previamente

    follow_set = set()

    for A in grammar.keys():
        for production in grammar[A]:
            if symbol in production:
                idx = production.index(symbol)
                if idx < len(production) - 1:
                    next_symbol = production[idx + 1]

                    if next_symbol in lista_terminales:
                        follow_set.add(next_symbol)
                    else:
                        follow_set.update(diccionario_first[next_symbol])

                    if epsilom in diccionario_first[next_symbol]:
                        follow_set.update(diccionario_follow[A])

                elif idx == len(production) - 1:
                    if A != symbol:
                        follow_set.update(diccionario_follow[A])

    return follow_set



def build_syntax_table(grammar):
    syntax_table = {}

    for non_terminal, productions in grammar.items():
        for production in productions:
            first_set = calculate_first_set(production)

            for symbol in first_set:
                if symbol != epsilom:
                    syntax_table[(non_terminal, symbol)] = production

            if epsilom in first_set:
                follow_set = diccionario_follow[non_terminal]

                for symbol in follow_set:
                    syntax_table[(non_terminal, symbol)] = production

    return syntax_table



def analyze_string(grammar, syntax_table, string):
    stack = ['$']  # Pila inicial con el símbolo de fin de cadena
    stack.append(grammar['S'][0][0])  # Agregar el símbolo inicial de la gramática a la pila

    i = 0  # Índice para recorrer la cadena de entrada

    while len(stack) > 0:
        top = stack[-1]  # Obtener el símbolo en la cima de la pila

        if top in grammar and (top, string[i]) in syntax_table:
            production = syntax_table[(top, string[i])]

            stack.pop()  # Retirar el símbolo de la pila
            stack.extend(reversed(production))  # Agregar los símbolos de la producción a la pila

        elif top == string[i]:
            stack.pop()  # Retirar el símbolo de la pila
            i += 1  # Avanzar al siguiente símbolo de la cadena de entrada

        else:
            return False  # No se encontró una coincidencia en la tabla de análisis

    return i == len(string)  # La cadena se analizó correctamente si se llegó al final




if __name__ == "__main__":
    main()
