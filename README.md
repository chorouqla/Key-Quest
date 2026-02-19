# Key-Quest

El objetivo del jugador es llegar a la puerta para completar el nivel, pero solo puede hacerlo si recoge la llave primero y se coloca correctamente delante de la puerta.

Este proyecto está diseñado de forma modular, separando claramente:

la lógica del juego
los datos del nivel
el dibujado en pantalla
la interacción del jugador

Actualmente el proyecto se centra exclusivamente en completar y pulir el Nivel 1.
El Nivel 2 está planificado, pero no se desarrollará hasta finalizar completamente el Nivel 1.

¿Qué he implementado en el Nivel 1?
1: Sistema de estados del juego

El juego funciona con distintos estados:
menu → menú principal
about → pantalla de instrucciones
playing → jugando el nivel
win → nivel completado
Esto permite controlar fácilmente qué se dibuja y qué lógica se ejecuta en cada momento.

2: Movimiento del jugador y físicas
Movimiento horizontal con flechas izquierda/derecha
Salto con flecha arriba
Sistema de gravedad que afecta al jugador
El jugador solo puede saltar si está en el suelo
El jugador no se desliza por los bordes del agujero
El jugador solo cae al agujero si está completamente dentro de él.
Si solo una parte del jugador está sobre el suelo, no muere, evitando deslizamientos irreales.

3: Suelo, agujeros y plataformas
El suelo se dibuja con huecos (agujeros)
Los agujeros están definidos por datos del nivel
Las plataformas (roofs) permiten saltar sobre obstáculos
Las colisiones con plataformas están controladas manualmente

4: Sistema de llave y puerta (lógica correcta)
El jugador recoge la llave al tocarla
La puerta NO se abre automáticamente
La puerta solo se abre si:
el jugador tiene la llave
el jugador toca la puerta
El jugador solo gana el nivel si está completamente delante de la puerta abierta
Esto evita errores comunes como ganar el nivel solo por tocar la llave.

5: Sistema de vidas
El jugador comienza con 3 vidas
Pierde una vida si:
cae completamente en un agujero
toca un pincho (cuando se añadan)
el tiempo se termina (cuando se añade)
Si pierde todas las vidas:
el juego se reinicia desde el menú

6: Sistema de tiempo
Cada nivel tiene un tiempo límite
En el Nivel 1: 30 segundos
Si el tiempo llega a 0:
el nivel se reinicia
se registra un fallo por tiempo

7: Datos del nivel separados de la lógica
El Nivel 1 está definido en un objeto levels, lo que permite:
cambiar el diseño del nivel sin tocar la lógica
añadir más niveles fácilmente en el futuro
como:
posición de agujeros, plataformas, llave, tiempo límite

8: Menús y UI
Menú principal con botones (Start / About)
Pantalla de instrucciones
Pantalla de victoria con:
vidas restantes
tiempo restante
Interacción tanto con teclado como con ratón

¿Qué NO he hecho todavía (plan futuro)?

 Nivel 2:
El código del Nivel 2 está comentado (no es completo)
Empezaré a desarrollarlo solo cuando el Nivel 1 esté terminado visual y técnicamente

Gráficos e imágenes:
Actualmente el juego usa rectángulos de colores
Próximo paso es añadir sprites (jugador, puerta, llave, suelo...)

Sonidos:
Sonidos de recoger llave, abrir puerta, perder vida, completar nivel, Música de fondo ligera

Mejora del diseño del menú:
El menú funciona, pero el diseño es básico
Se mejorará usando CSS y mejor composición visual
