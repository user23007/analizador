import string
##Código
gramatica = {
    "<S>": ["<LETRA>", "<LETRA><S>"],
    "<LETRA>": list(string.ascii_lowercase + string.ascii_digits) #alfabeto en minuscula
}

def verificar_string(cadena):
    S → aSb | c F → 

# Pedir la gramática
gramatica = input("Ingrese su gramática: ")

# Pedir los strings hasta que se ingrese una cadena vacía
cadena = []
while True:
    string = input("Ingrese un string para la gramática (deje en blanco para finalizar): ")
    if not string:
        break
    cadena.append(string)

print("La gramática ingresada es:", gramatica)
print("Los strings ingresados son:", cadena)