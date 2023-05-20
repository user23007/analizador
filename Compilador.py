import string
##Código

    
# Pedir los strings hasta que se ingrese una cadena vacía
diccionario_first = {}
diccionario_follow = {}
diccionario = {}
cadena = []
sub_cadena = []
#manera de pedir el string:   A > x   ó    A : x
while True:
    gramatica = input("Ingrese un string para la gramática (deje en blanco para finalizar): ")
    new_gramatica = gramatica.replace(" ", "") #Quitamos todos los espacios que tenga la cadena del usuario
    if not gramatica:
        break
    cadena_aux = list(new_gramatica)
    cadena.append(cadena_aux) #Metemos todos los items, ya sin los espacios en una lista


for i in cadena:
    while ' ' in cadena:
        cadena.remove(' ') #removemos espacios adicionales si es que el usuario ingresa A >  ebc (acá hay dos espacios) 
#print(cadena[0][0], " ", cadena[1][0])  #como verás, podemos acceder a la cadena del usuario, que esta en una lista,
# ejemplo: [[a,b,c],[d,e,f]] aqui cadena[0][0] sería a, y cadena[1][2] sería f


#Meteremos la cadena en un diccionario
for i in range(len(cadena)):
    clave = cadena[i][0] #decimos que la clave del diccionario será el primer item de cada lista, ya que el primero siempre es no terminal
    if clave in diccionario: #aqui clave toma el valor de el diccionario
        if diccionario[clave] != cadena[i][2:]: #recordar que las claves son unicas y no se pueden repetir, esto es un problema para el or 
            diccionario[clave + '1'] = cadena[i][2:] #Aqui agregamos un 1 a cualquier clave que se repita, si agregas A > bcd    A > e, entonces se veria como A y A1
    else:
        diccionario[clave] = cadena[i][2:] #Si no se repite ( o sea, si no hay un or) entonces se agrega normal
#print(diccionario)

lista_caracteres = list(string.digits + string.ascii_lowercase + string.punctuation) #esta es la lista de TERMINALES
epsilom = "#"

def get_first(diccionario):
    for clave in diccionario.keys(): #aqui clave toma el valor de las claves del diccionario
        for i in range(len(lista_caracteres)):
            if(lista_caracteres[i] in diccionario[clave][0] or epsilom in diccionario[clave][0]): #Aqui, si algun caracter esta de primero en el diccionario (en los valores)
                diccionario_first[clave] = diccionario[clave][0]#Entonces metemos a ese caracter en el diccionario de first

    for clave in diccionario_first.keys(): #Aqui la idea es meter los first de los strings de la forma noTerminal > noTerminal, ejemplo: A -> Ba  B -> e
        #recuerda que en el ejemplo anterior, ya habriamos metido B -> e en el diccionario de first, eso será una ayuda en este caso
        print("Completar")
        

    
        

get_first(diccionario)
print(diccionario_first)


#Analisis -> Para candena[i] siempre será 'S' = 0, '→' = 1, otro = 2+

#diccionario[clave] = valor

