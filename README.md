# Forja Nórdica

Sitio de catálogo hecho en PHP. El entorno local usa Docker Compose con Apache/PHP y Mailpit para capturar las consultas del formulario sin enviarlas a una casilla real.

## Levantar en local

Requisitos: Docker Engine y el plugin `docker compose` instalados y en ejecución.

```bash
forjaup
```

El comando construye la imagen de la aplicación y levanta los servicios en segundo plano:

- Sitio: <http://127.0.0.1:8000>
- Bandeja local de consultas (Mailpit): <http://127.0.0.1:8025>

Las consultas enviadas desde el formulario aparecerán en Mailpit; este entorno no las entrega a Gmail ni a Hostinger. Para ver los registros de PHP y del envío de correo:

```bash
cd /home/gabriel-felipe/cosas_gabo/forja
docker compose logs -f web
```

Para detener el sitio:

```bash
cd /home/gabriel-felipe/cosas_gabo/forja
docker compose down
```

Después de cambiar archivos del sitio, volver a ejecutar `forjaup` para reconstruir la imagen.

## Sin el comando `forjaup`

Desde la carpeta del proyecto también se puede iniciar todo con:

```bash
docker compose up -d --build
```

## Estructura principal

- `index.php`: página y catálogo.
- `data/productos.json`: datos de productos.
- `css/` y `js/`: estilos e interacción.
- `enviar-consulta.php`: validación y envío del formulario.
- `docker/msmtprc`: transporte de correo local hacia Mailpit dentro de Compose.
- `tools/generate_mesa_living_nord.py`: genera el modelo GLB de la mesa y sus ocho combinaciones de terminación para la vista 3D/AR.

La ficha **Mesa Living Nord con estante** incluye una vista 3D interactiva y un botón de realidad aumentada para celulares compatibles. Para ofrecer AR en producción, el sitio debe estar publicado con HTTPS.
