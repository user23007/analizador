import string
##Código

    
# Pedir los strings hasta que se ingrese una cadena vacía
diccionario_first = {}
diccionario_follow = {}
diccionario = {}
cadena = []
sub_cadena = []
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
#print(cadena[0][0], " ", cadena[1][0])

for i in range(len(cadena)):
    clave = cadena[i][0]
    if clave in diccionario:
        if diccionario[clave] != cadena[i][2:]:
            diccionario[clave + '1'] = cadena[i][2:]
    else:
        diccionario[clave] = cadena[i][2:]
#print(diccionario)

lista_caracteres = list(string.digits + string.ascii_lowercase + string.punctuation)
epsilom = "#"

def get_first(diccionario):
    for clave in diccionario.keys():
        for i in range(len(lista_caracteres)):
            if(lista_caracteres[i] in diccionario[clave][0] or epsilom in diccionario[clave][0]):
                diccionario_first[clave] = diccionario[clave][0]

    for clave in diccionario_first.keys():
        print("en proceso")

    
        

get_first(diccionario)
print(diccionario_first)


#Analisis -> Para candena[i] siempre será 'S' = 0, '→' = 1, otro = 2+

#diccionario[clave] = valor

