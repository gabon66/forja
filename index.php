<?php
declare(strict_types=1);

$catalogPath = __DIR__ . '/data/productos.json';
$catalogo = ['secciones' => []];
$cssPath = __DIR__ . '/css/styles.css';
$cssVersion = is_file($cssPath) ? (string) filemtime($cssPath) : '1';
$jsPath = __DIR__ . '/js/catalogo.js';
$jsVersion = is_file($jsPath) ? (string) filemtime($jsPath) : '1';

if (is_readable($catalogPath)) {
    $jsonRaw = file_get_contents($catalogPath);
    $jsonData = json_decode($jsonRaw ?: '', true);
    if (is_array($jsonData) && isset($jsonData['secciones']) && is_array($jsonData['secciones'])) {
        $catalogo = $jsonData;
    }
}

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function productSlug(string $value): string
{
    $ascii = function_exists('iconv') ? iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value) : $value;
    $slug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($ascii !== false ? $ascii : $value));
    return trim($slug ?: '', '-');
}
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forja Nordica</title>
    <link rel="icon" type="image/png" href="img/yunque.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css?v=<?= e($cssVersion) ?>">
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container">
            <a class="navbar-brand gold d-flex align-items-center" href="#">
                FORJA NORDICA
            </a>
            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="nav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="#trabajos">Trabajos</a></li>
                    <li class="nav-item"><a class="nav-link" href="#proceso">Proceso</a></li>
                    <li class="nav-item"><a class="nav-link" href="#taller">El Taller</a></li>
                    <li class="nav-item"><a class="nav-link" href="#contacto">Contacto</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <section class="hero">
        <div class="hero-background" aria-hidden="true">
            <img src="img/hero-loop/mesa-nord-estante.webp" alt="" fetchpriority="high">
            <img src="img/hero-loop/mesa-nord-blanca.webp" alt="">
            <img src="img/hero-loop/mesa-industrial.webp" alt="">
            <img src="img/hero-loop/banco-industrial-doble.webp" alt="">
        </div>
        <div class="container text-center">
            <h1>FORJA <span class="gold">NORDICA</span></h1>
            <p class="mt-3">Hierro - Fuego - Diseño</p>
            <a href="#trabajos" class="btn btn-gold mt-4">Ver trabajos</a>
        </div>
    </section>

    <section id="trabajos" class="section">
        <div class="container">
            <h2 class="text-center mb-5 gold">Trabajos</h2>

            <?php foreach ($catalogo['secciones'] as $seccion): ?>
                <h3 class="gold mb-4"><?= e((string) ($seccion['nombre'] ?? 'Catalogo')) ?></h3>
                <div class="row g-4 mb-5">
                    <?php foreach (($seccion['productos'] ?? []) as $producto): ?>
                        <?php
                        $titulo = (string) ($producto['titulo'] ?? 'Producto');
                        $slug = productSlug((string) ($producto['slug'] ?? $titulo));
                        $descCorta = (string) ($producto['descripcion_corta'] ?? '');
                        $descModal = (string) ($producto['descripcion_modal'] ?? $descCorta);
                        $imagen = (string) ($producto['imagen'] ?? '');
                        $imagenHierroNegro = (string) ($producto['imagen_hierro_negro'] ?? $imagen);
                        $imagenHierroBlanco = (string) ($producto['imagen_hierro_blanco'] ?? '');
                        $modelo3d = (string) ($producto['modelo_3d'] ?? '');
                        $perfilesHierro = $producto['perfiles_hierro'] ?? [];
                        $modelo3dRevision = $modelo3d !== '' && is_file(__DIR__ . '/' . $modelo3d)
                            ? '?v=' . filemtime(__DIR__ . '/' . $modelo3d)
                            : '';
                        $coloresMadera = $producto['colores_madera'] ?? [];
                        $variantesMadera = $producto['variantes_madera'] ?? [];
                        $galeria = $producto['galeria'] ?? [];
                        $medidas = (string) ($producto['medidas'] ?? '');
                        $urlConsulta = (string) ($producto['url_consulta'] ?? '#');
                        ?>
                        <div class="col-lg-4 col-md-6 col-sm-12">
                            <div class="card product-card h-100"
                                data-title="<?= e($titulo) ?>"
                                data-product-slug="<?= e($slug) ?>"
                                data-desc="<?= e($descModal) ?>"
                                data-image="<?= e($imagen) ?>"
                                data-iron-image-black="<?= e($imagenHierroNegro) ?>"
                                data-iron-image-white="<?= e($imagenHierroBlanco) ?>"
                                data-model3d="<?= e($modelo3d . $modelo3dRevision) ?>"
                                data-iron-profile-options="<?= e((string) json_encode($perfilesHierro)) ?>"
                                data-current-iron-color="black"
                                data-wood-colors="<?= e((string) json_encode($coloresMadera)) ?>"
                                data-wood-variants="<?= e((string) json_encode($variantesMadera)) ?>"
                                data-gallery="<?= e((string) json_encode($galeria)) ?>"
                                data-measures="<?= e($medidas) ?>"
                                data-consulta="<?= e($urlConsulta) ?>">
                                <div class="product-card-gallery" data-card-gallery data-gallery-images="<?= e((string) json_encode(array_merge([$imagen], is_array($galeria) ? $galeria : []))) ?>">
                                    <img src="<?= e($imagen) ?>" class="card-img-top" alt="<?= e($titulo) ?>">
                                    <button class="product-card-gallery-nav product-card-gallery-prev" type="button" data-gallery-step="-1" aria-label="Ver imagen anterior de <?= e($titulo) ?>">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                    <button class="product-card-gallery-nav product-card-gallery-next" type="button" data-gallery-step="1" aria-label="Ver imagen siguiente de <?= e($titulo) ?>">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                    <?php if ($modelo3d !== ''): ?>
                                        <span class="product-card-3d-badge" aria-label="Este modelo tiene una vista 3D interactiva">
                                            <i class="bi bi-box" aria-hidden="true"></i>
                                            <span>Vista 3D</span>
                                        </span>
                                    <?php endif; ?>
                                    <span class="product-card-gallery-count" data-gallery-count aria-live="polite">01 / <?= e(sprintf('%02d', count(is_array($galeria) ? $galeria : []) + 1)) ?></span>
                                </div>
                                <div class="card-body">
                                    <h5><?= e($titulo) ?></h5>
                                    <p><?= e($descCorta) ?></p>
                                </div>
                                <div class="product-card-shipping">
                                    <i class="bi bi-truck" aria-hidden="true"></i>
                                    <span>Envíos a todo el país</span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endforeach; ?>
        </div>
    </section>

    <section class="section about" id="taller">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-lg-6 col-md-12">
                    <img src="img/taller/proceso-04.webp" class="img-fluid rounded taller-feature-image" alt="Mesa de hierro y madera terminada en el taller">
                </div>
                <div class="col-lg-6 col-md-12">
                    <h2 class="gold">El Taller</h2>
                    <p>
                        Forja Nordica nace de la pasion por el hierro, el fuego y el diseno industrial.
                        Cada pieza se construye de forma artesanal combinando estructuras de acero
                        con madera natural.
                    </p>
                    <p>
                        El objetivo es crear muebles solidos, minimalistas y duraderos que transmitan
                        la fuerza del material y el caracter del trabajo manual.
                    </p>
                </div>
            </div>
            <div class="taller-gallery mt-5">
                <h3 class="gold mb-2">El trabajo, paso a paso</h3>
                <p class="text-secondary mb-4">Madera, perfiles de hierro y armado artesanal en nuestro taller.</p>
                <div class="row g-4">
                    <div class="col-md-4">
                        <figure class="taller-gallery-item">
                            <img src="img/taller/proceso-01.webp" alt="Detalle de la madera y la estructura de hierro" loading="lazy">
                            <figcaption>Detalles de madera y hierro</figcaption>
                        </figure>
                    </div>
                    <div class="col-md-4">
                        <figure class="taller-gallery-item">
                            <img src="img/taller/proceso-02.webp" alt="Perfiles de acero preparados para el armado" loading="lazy">
                            <figcaption>Preparación de los perfiles</figcaption>
                        </figure>
                    </div>
                    <div class="col-md-4">
                        <figure class="taller-gallery-item">
                            <img src="img/taller/proceso-03.webp" alt="Mesa de hierro con tapa de madera durante el armado" loading="lazy">
                            <figcaption>Armado de cada pieza</figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="proceso" class="section">
        <div class="container">
            <h2 class="text-center mb-5 gold">El proceso</h2>
            <div class="row text-center">
                <div class="col-md-3 col-6 process-box">
                    <div class="process-number">01</div>
                    <h4>Diseno</h4>
                    <p>Ideas convertidas en piezas unicas.</p>
                </div>
                <div class="col-md-3 col-6 process-box">
                    <div class="process-number">02</div>
                    <h4>Forja</h4>
                    <p>Trabajo del hierro con precision.</p>
                </div>
                <div class="col-md-3 col-6 process-box">
                    <div class="process-number">03</div>
                    <h4>Soldadura</h4>
                    <p>Estructuras solidas y duraderas.</p>
                </div>
                <div class="col-md-3 col-6 process-box">
                    <div class="process-number">04</div>
                    <h4>Terminacion</h4>
                    <p>Madera y metal en equilibrio.</p>
                </div>
            </div>
            <div class="row align-items-center g-4 process-material mt-4">
                <div class="col-lg-5 col-md-6">
                    <img src="img/proceso/seleccion-hierros.webp" class="img-fluid rounded process-material-image" alt="Perfiles de hierro seleccionados para fabricar muebles" loading="lazy">
                </div>
                <div class="col-lg-7 col-md-6">
                    <h3 class="gold">Selección de hierros</h3>
                    <p class="mb-0">Cada diseño empieza con la elección de los perfiles de acero adecuados para lograr una estructura firme y duradera.</p>
                </div>
            </div>
            <div class="process-story mt-5">
                <h3 class="text-center gold mb-2">De la idea al resultado</h3>
                <p class="text-center text-secondary mb-4">Un diseño pensado para integrar hierro y madera en una mesa para TV.</p>
                <div class="row g-4">
                    <div class="col-lg-4 col-md-6">
                        <figure class="process-story-item">
                            <img src="img/proceso/boceto-mesa-tv.webp" alt="Boceto original de la mesa para TV" loading="lazy">
                            <figcaption><span>01</span> Boceto de Lupe :) ❤️</figcaption>
                        </figure>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <figure class="process-story-item">
                            <img src="img/proceso/estructura-mesa-tv.webp" alt="Estructura de hierro de la mesa para TV durante el armado" loading="lazy">
                            <figcaption><span>02</span> Estructura en armado</figcaption>
                        </figure>
                    </div>
                    <div class="col-lg-4 col-md-6">
                        <figure class="process-story-item">
                            <img src="img/mesa-tv-nord.webp" alt="Propuesta final de la mesa Nord para TV" loading="lazy">
                            <figcaption><span>03</span> Propuesta final</figcaption>
                        </figure>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section id="contacto" class="section">
        <div class="container text-center">
            <h2 class="gold mb-4">Contacto</h2>
            <p>Para consultas o trabajos personalizados.</p>
            <div class="mt-4">
                <a class="btn btn-gold me-3 contact-social-btn" href="https://wa.me/5491128173940?text=Hola%2C%20quisiera%20consultar%20por%20alguno%20de%20sus%20modelos." target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a class="btn btn-outline-light contact-social-btn" href="https://www.instagram.com/forja.nordica/" target="_blank" rel="noopener noreferrer">Instagram</a>
            </div>
            <form id="contactoFormularioGeneral" class="contact-form" data-contact-form action="enviar-consulta.php" method="post">
                <input type="hidden" name="producto" value="Consulta general">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="contactoGeneralNombre" class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="contactoGeneralNombre" name="nombre" maxlength="120" autocomplete="name" required>
                    </div>
                    <div class="col-md-6">
                        <label for="contactoGeneralEmail" class="form-label">Mail</label>
                        <input type="email" class="form-control" id="contactoGeneralEmail" name="email" maxlength="254" autocomplete="email" required>
                    </div>
                    <div class="col-md-6">
                        <label for="contactoGeneralTelefono" class="form-label">Teléfono</label>
                        <input type="tel" class="form-control" id="contactoGeneralTelefono" name="telefono" maxlength="40" autocomplete="tel" placeholder="Ej. 11 2817-3940" required>
                    </div>
                    <div class="col-12">
                        <label for="contactoGeneralConsulta" class="form-label">Consulta</label>
                        <textarea class="form-control" id="contactoGeneralConsulta" name="consulta" rows="3" maxlength="3000" required></textarea>
                    </div>
                    <div class="visually-hidden" aria-hidden="true">
                        <label for="contactoGeneralSitio">Dejar vacío</label>
                        <input type="text" id="contactoGeneralSitio" name="sitio" tabindex="-1" autocomplete="off">
                    </div>
                    <div class="col-12 d-flex flex-wrap align-items-center gap-3">
                        <button type="submit" class="btn btn-outline-light">
                            <i class="bi bi-send me-2"></i>Enviar consulta
                        </button>
                        <span class="small" data-form-status role="status" aria-live="polite"></span>
                    </div>
                </div>
            </form>
        </div>
    </section>

    <div class="modal fade" id="productoModal" tabindex="-1">
        <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content bg-dark text-light">
                <div class="modal-header border-0">
                    <h5 class="modal-title" id="productoTitulo"></h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-4">
                        <div class="col-md-6">
                            <div id="productoVista3D" class="product-3d-view product-3d-view-main" hidden>
                                <model-viewer id="productoModelo3D" alt="Modelo 3D del producto" camera-controls touch-action="pan-y" shadow-intensity="1" exposure=".8" tone-mapping="neutral" environment-image="neutral" camera-orbit="45deg 65deg auto" camera-target="0m 0.3m 0m" field-of-view="27deg" ar ar-scale="fixed" ar-modes="webxr scene-viewer quick-look" ar-placement="floor" xr-environment>
                                    <button slot="ar-button" class="btn btn-gold product-3d-ar-button" type="button">
                                        <i class="bi bi-camera me-2" aria-hidden="true"></i>Ver en mi espacio
                                    </button>
                                </model-viewer>
                                <small class="d-block text-secondary mt-2">Giralo con el mouse o el dedo. En un celular compatible, podés probarlo en tu espacio.</small>
                            </div>
                            <div id="productoGaleriaAncla"></div>
                            <div id="productoGaleria" class="product-gallery">
                                <div class="product-gallery-stage">
                                    <img id="productoImagen" class="img-fluid rounded modal-product-image" alt="Producto">
                                    <button id="productoGaleriaAnterior" class="product-gallery-nav product-gallery-prev" type="button" aria-label="Ver imagen anterior">
                                        <i class="bi bi-chevron-left"></i>
                                    </button>
                                    <button id="productoGaleriaSiguiente" class="product-gallery-nav product-gallery-next" type="button" aria-label="Ver imagen siguiente">
                                        <i class="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                                <div id="productoMiniaturasCarrusel" class="product-photo-carousel" hidden>
                                    <button id="productoMiniaturaAnterior" class="product-photo-carousel-nav" type="button" aria-label="Desplazar fotos anteriores">
                                        <i class="bi bi-chevron-left" aria-hidden="true"></i>
                                    </button>
                                    <div id="productoGaleriaMiniaturas" class="product-photo-carousel-track" aria-label="Fotos del modelo"></div>
                                    <button id="productoMiniaturaSiguiente" class="product-photo-carousel-nav" type="button" aria-label="Desplazar fotos siguientes">
                                        <i class="bi bi-chevron-right" aria-hidden="true"></i>
                                    </button>
                                </div>
                                <div id="productoGaleriaIndicadores" class="product-gallery-indicators" aria-label="Elegir imagen"></div>
                                <small id="productoNotaGaleria" class="product-gallery-note">Vistas ilustrativas del modelo. Los detalles pueden variar según la terminación elegida.</small>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <p id="productoDescripcion"></p>
                            <div id="productoSeccionColorMadera">
                                <h6>Color de la madera</h6>
                                <div id="productoColoresMadera" class="wood-colors mb-3"></div>
                                <small id="productoMaderaSeleccionada" class="text-secondary d-block mb-3"></small>
                            </div>
                            <div id="productoSeccionColorHierro">
                                <h6>Color del hierro</h6>
                                <div id="productoVariantesHierro" class="wood-colors iron-colors mt-2" role="group" aria-label="Elegir color del hierro" hidden>
                                    <button id="productoHierroNegro" class="wood iron-color iron-black" type="button" aria-label="Hierro negro" title="Hierro negro" aria-pressed="false"></button>
                                    <button id="productoHierroBlanco" class="wood iron-color iron-white" type="button" aria-label="Hierro blanco" title="Hierro blanco" aria-pressed="false"></button>
                                </div>
                            </div>
                            <div id="productoSeccionPerfilHierro" class="product-iron-profile" hidden>
                                <h6>Medida del hierro</h6>
                                <div id="productoPerfilesHierro" class="d-flex flex-wrap gap-2" role="group" aria-label="Elegir medida del perfil de hierro">
                                    <button class="btn btn-outline-light btn-sm" type="button" data-profile-size="4" aria-pressed="false">4 cm</button>
                                    <button class="btn btn-outline-light btn-sm active" type="button" data-profile-size="8" aria-pressed="true">8 cm</button>
                                    <button class="btn btn-outline-light btn-sm" type="button" data-profile-size="10" aria-pressed="false">10 cm</button>
                                </div>
                            </div>
                            <hr>
                            <h6>Medidas</h6>
                            <p id="productoMedidas"></p>
                            <small class="text-secondary">Las medidas indicadas son de referencia y podemos adaptarlas al espacio y al uso que necesites.</small>
                        </div>
                    </div>
                    <div id="productoSeparadorGaleria" hidden><hr class="my-3"></div>
                    <div id="productoGaleriaAnchoCompleto" class="product-gallery-full-width" hidden></div>
                    <hr class="my-4">
                    <div class="product-contact-section">
                        <h5 class="mb-3">Consultas por este modelo</h5>
                        <form id="productoFormularioContacto" class="contact-form" data-contact-form action="enviar-consulta.php" method="post">
                            <input type="hidden" name="producto" id="productoNombreModelo" value="">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label for="contactoNombre" class="form-label">Nombre</label>
                                    <input type="text" class="form-control" id="contactoNombre" name="nombre" maxlength="120" autocomplete="name" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="contactoEmail" class="form-label">Mail</label>
                                    <input type="email" class="form-control" id="contactoEmail" name="email" maxlength="254" autocomplete="email" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="contactoTelefono" class="form-label">Teléfono</label>
                                    <input type="tel" class="form-control" id="contactoTelefono" name="telefono" maxlength="40" autocomplete="tel" placeholder="Ej. 11 2817-3940" required>
                                </div>
                                <div class="col-12">
                                    <label for="contactoConsulta" class="form-label">Consulta</label>
                                    <textarea class="form-control" id="contactoConsulta" name="consulta" rows="3" maxlength="3000" required></textarea>
                                </div>
                                <div class="visually-hidden" aria-hidden="true">
                                    <label for="contactoSitio">Dejar vacío</label>
                                    <input type="text" id="contactoSitio" name="sitio" tabindex="-1" autocomplete="off">
                                </div>
                                <div class="col-12 d-flex flex-wrap align-items-center gap-3">
                                    <button id="productoEnviarConsulta" type="submit" class="btn btn-outline-light">
                                        <i class="bi bi-send me-2"></i>Enviar consulta
                                    </button>
                                    <span id="productoEstadoFormulario" class="small" data-form-status role="status" aria-live="polite"></span>
                                    <div class="product-contact-actions ms-auto">
                                        <span id="productoEstadoCompartir" class="small text-secondary" role="status" aria-live="polite"></span>
                                        <a id="productoConsulta" href="#" class="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                                            <i class="bi bi-whatsapp me-1" aria-hidden="true"></i>Consulta WhatsApp
                                        </a>
                                        <button id="productoCompartir" type="button" class="btn btn-outline-light">
                                            <i class="bi bi-link-45deg me-1"></i>Copiar enlace
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="productoZoomFotos" class="product-photo-zoom" role="dialog" aria-modal="true" aria-label="Foto ampliada" hidden>
        <button id="productoZoomCerrar" class="product-photo-zoom-close" type="button" aria-label="Cerrar foto ampliada">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
        </button>
        <button id="productoZoomAnterior" class="product-photo-zoom-nav product-photo-zoom-prev" type="button" aria-label="Ver foto anterior">
            <i class="bi bi-chevron-left" aria-hidden="true"></i>
        </button>
        <img id="productoZoomImagen" alt="">
        <button id="productoZoomSiguiente" class="product-photo-zoom-nav product-photo-zoom-next" type="button" aria-label="Ver foto siguiente">
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
        </button>
        <span id="productoZoomContador" class="product-photo-zoom-count" aria-live="polite"></span>
    </div>

    <footer class="footer text-center">
        <p class="gold">FORJA NORDICA</p>
        <p>Muebles industriales hechos a mano</p>
        <p class="mt-3">© 2026</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <script src="js/catalogo.js?v=<?= e($jsVersion) ?>"></script>
</body>

</html>
