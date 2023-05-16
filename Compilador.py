import string
##Código

def First(cadena):
    print("hola")
    
# Pedir los strings hasta que se ingrese una cadena vacía
diccionario = {}
cadena = []
while True:
    gramatica = input("Ingrese un string para la gramática (deje en blanco para finalizar): ")
    new_gramatica = gramatica.replace(" ", "")
    if not gramatica:
        break
    cadena_aux = list(new_gramatica)
    cadena.append(cadena_aux)


for i in cadena:
    while ' ' in cadena:
        cadena.remove(' ')

#diccionario[clave] = valor
for i in range(len(cadena)):
    j = 0
    diccionario[cadena[i][0]] = cadena[i][2:]
    j = j+1


print("La gramática ingresada es: ", cadena)
print("La gramática ingresada es: ", diccionario)


#Analisis -> Para candena[i] siempre será 'S' = 0, '→' = 1, otro = 2+

