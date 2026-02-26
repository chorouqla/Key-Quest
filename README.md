# Key-Quest

El objetivo del jugador es llegar a la puerta para completar el nivel, pero solo puede hacerlo si recoge la llave primero y se coloca correctamente delante de la puerta.

Este proyecto está diseñado de forma modular, separando claramente:

la lógica del juego
los datos del nivel
el dibujado en pantalla
la interacción del jugador

Seguimiento del Proyecto – Estado Parcial de Desarroll

1. Tareas realizadas hasta el momento
a) Estructura general del proyecto

Creación del proyecto base en HTML, CSS y JavaScript.

Estructura organizada de carpetas (assets, imágenes, etc.).

Implementación del canvas y bucle principal del juego.

b) Capítulo 1 (Nivel 1 – ya funcional)

Implementación del personaje principal.
Sistema de movimiento (izquierda, derecha, salto).
Sistema de gravedad y colisiones básicas.
Plataforma principal y plataforma elevada (roof).
Agujeros donde el jugador puede caer.
Llave coleccionable.
Puerta que solo se abre si el jugador tiene la llave.
Condición de victoria cuando el jugador está frente a la puerta.
Temporizador que reinicia el nivel al llegar a cero.
Sistema básico de vidas.
Integración inicial de imágenes (fondo, puerta, llave, personaje, suelo).

⚠ Estado actual:
El nivel 1 es funcional a nivel lógico, pero aún no está completamente ajustado gráficamente (alineaciones, proporciones, estética final).

c) Inicio del Capítulo 2 (Nuevo enfoque)
Se comenzó el desarrollo de un segundo capítulo inspirado en un tutorial de plataforma vertical.

Características en desarrollo:
Plataformas verticales.
Plataformas seguras.
Plataformas con pinchos.
Plataformas con gemas.
Llave ubicada en la parte superior del mapa.
Puerta final que se abre al conseguir la llave.
Implementación futura de cámara con render dinámico (seguimiento del jugador).
Mecánica donde el jugador debe recordar el camino correcto.

Estado actual:

Se está utilizando el programa Tiled para crear el mapa y las colisiones.
Se ha iniciado la fase de creación del mapa.

El desarrollo está bloqueado en la parte de:
Configuración de colisiones en Tiled.
Exportación correcta del mapa.
Integración del archivo generado con JavaScript.
Conexión entre el sistema de colisiones de Tiled y el código del juego.
Este punto es actualmente el principal bloqueo técnico.

3. Tareas pendientes
Capítulo 1

Ajuste final de proporciones gráficas.
Posible sistema simple de puntuación.
Ajustes finales de experiencia de usuario.

Capítulo 2

Comprender y dominar el uso de Tiled.
Configuración correcta de capas de colisión.
Integración del mapa exportado con JavaScript.
Implementación de la cámara dinámica.
Sistema de gemas.
Sistema de pinchos con daño.
Integración completa del sistema de llave y puerta.
Pruebas y balanceo de dificultad.

General

Integración narrativa que conecte ambos capítulos.
Optimización del código.
Limpieza y organización final del proyecto.
Documentación básica del funcionamiento del juego.

4. Problemas actuales que bloquean el desarrollo

El principal problema técnico actual es:

Dificultad en el uso del programa Tiled.
Falta de experiencia previa con la creación de mapas y sistemas de colisión externos.
Dudas sobre cómo conectar correctamente el archivo exportado por Tiled con la lógica JavaScript del juego.
Incertidumbre sobre cómo estructurar correctamente esta parte para que el código principal funcione después.
Este punto requiere orientación para poder continuar el desarrollo del Capítulo 2.

5. Recursos utilizados
   
Tutoriales de referencia:
 https://www.youtube.com/watch?v=rTVoyWu8r6g

 https://www.youtube.com/watch?v=i57Gufe3dCk&list=PLS5LyA6pzVvX5f-5_aThniWA3vuWLUA-4

 https://www.youtube.com/watch?v=Lcdc2v-9PjA&list=PLS5LyA6pzVvX5f-5_aThniWA3vuWLUA-4&index=2


