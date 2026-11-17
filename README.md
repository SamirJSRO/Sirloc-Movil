# SIRLOC · versión móvil

Misma lógica y datos de demostración que la versión web, rediseñada como app de celular.

## Cómo abrirlo
Abre `index.html` (con `styles.css` y `app.js` en la misma carpeta). En PC se ve como un teléfono de 412 dp con su propio scroll; en el celular ocupa toda la pantalla.
DNI de ejemplo: `40374767`.

## Cómo se comporta como app
- Pantalla de carga al abrir y pantalla de inicio de sesión (DNI con teclado numérico, contraseña con botón Mostrar/Ocultar, mensajes de error y "¿Olvidaste tu contraseña?"). Demostración: DNI `40374767` y cualquier contraseña de 6 o más caracteres.
- Menú desplegable (☰) solo para lo secundario: ayuda, acerca de, solicitar cancelación y cerrar sesión (ambas piden confirmación en una hoja inferior).
- Navegación inferior de 3 secciones (Inicio, Registrar, Consultar).
- Un solo botón de volver (←) y un solo botón principal fijo abajo en cada paso.
- Hoja inferior para confirmar o agregar, y mensaje con "Deshacer" al anular la inscripción.
- Feedback al tocar: efecto de presión, "Procesando…", aviso y vibración corta en celulares compatibles.
- Teclado en pantalla simulado en PC para todos los campos de texto: numérico (DNI, celular, horas) y de letras con ?123, mayúsculas y @ (contraseña, correo, formularios). También aparece dentro de las hojas inferiores. En un celular real se usa el teclado del sistema.
- Metadatos para "Agregar a la pantalla de inicio" (pantalla completa, color de barra).

## Checklist de la clase
- Botones, campos y teclas de 56 dp; filas de 72 dp; mínimo de 48 dp en todos los controles; 12 a 16 dp de separación.
- Frame de 412 dp, una columna y solo scroll vertical (sin desplazamiento horizontal).
- Texto de 16 px o más; márgenes seguros para cámara y barra de gestos.
- Patrones: navegación inferior, menú hamburguesa para lo secundario, hoja inferior, deshacer, formularios con teclado adecuado.
