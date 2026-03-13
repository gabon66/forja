<?php
declare(strict_types=1);

$catalogPath = __DIR__ . '/data/productos.json';
$catalogo = ['secciones' => []];

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
    <link rel="stylesheet" href="css/styles.css">
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
                        $descCorta = (string) ($producto['descripcion_corta'] ?? '');
                        $descModal = (string) ($producto['descripcion_modal'] ?? $descCorta);
                        $imagen = (string) ($producto['imagen'] ?? '');
                        $imagenPlano = (string) ($producto['imagen_plano'] ?? 'img/plano.jpg');
                        $coloresMadera = $producto['colores_madera'] ?? [];
                        $coloresHierro = (string) ($producto['colores_hierro'] ?? '');
                        $medidas = (string) ($producto['medidas'] ?? '');
                        $urlMercadoLibre = (string) ($producto['url_mercadolibre'] ?? '#');
                        $urlConsulta = (string) ($producto['url_consulta'] ?? '#');
                        ?>
                        <div class="col-md-4 col-sm-12">
                            <div class="card product-card h-100"
                                data-bs-toggle="modal"
                                data-bs-target="#productoModal"
                                data-title="<?= e($titulo) ?>"
                                data-desc="<?= e($descModal) ?>"
                                data-image="<?= e($imagen) ?>"
                                data-plan="<?= e($imagenPlano) ?>"
                                data-wood-colors="<?= e((string) json_encode($coloresMadera)) ?>"
                                data-iron-colors="<?= e($coloresHierro) ?>"
                                data-measures="<?= e($medidas) ?>"
                                data-mercadolibre="<?= e($urlMercadoLibre) ?>"
                                data-consulta="<?= e($urlConsulta) ?>">
                                <img src="<?= e($imagen) ?>" class="card-img-top" alt="<?= e($titulo) ?>">
                                <div class="card-body">
                                    <h5><?= e($titulo) ?></h5>
                                    <p><?= e($descCorta) ?></p>
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
                    <img src="img/taller.jpg" class="img-fluid rounded" alt="Taller">
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
        </div>
    </section>

    <section id="contacto" class="section">
        <div class="container text-center">
            <h2 class="gold mb-4">Contacto</h2>
            <p>Para consultas o trabajos personalizados.</p>
            <div class="mt-4">
                <a class="btn btn-gold me-3" href="#">WhatsApp</a>
                <a class="btn btn-outline-light" href="#">Instagram</a>
            </div>
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
                            <img id="productoImagen" class="img-fluid rounded modal-product-image" alt="Producto">
                        </div>
                        <div class="col-md-6">
                            <p id="productoDescripcion"></p>
                            <h6>Tipo de madera</h6>
                            <div id="productoColoresMadera" class="wood-colors mb-3"></div>
                            <h6>Color del hierro</h6>
                            <p id="productoColorHierro"></p>
                            <hr>
                            <h6>Medidas</h6>
                            <p id="productoMedidas"></p>
                        </div>
                    </div>
                    <hr class="my-4">
                    <div class="plan-section">
                        <div class="d-flex gap-2 flex-wrap mb-3 align-items-center">
                            <button class="btn btn-outline-light btn-sm modal-action-btn" type="button" data-bs-toggle="collapse" data-bs-target="#productoPlanoContainer" aria-expanded="false" aria-controls="productoPlanoContainer">
                                <i class="bi bi-rulers me-1"></i>Ver plano tecnico
                            </button>
                            <div class="d-flex gap-2 ms-auto flex-wrap">
                                <a id="productoConsulta" href="#" class="btn btn-outline-light btn-sm modal-action-btn">
                                    <i class="bi bi-telephone-fill me-1"></i>Contacto
                                </a>
                                <a id="productoMercadoLibre" href="#" class="btn btn-outline-light btn-sm modal-action-btn" target="_blank" rel="noopener noreferrer">
                                    <i class="bi bi-bag-check-fill me-1"></i>Comprar
                                </a>
                            </div>
                        </div>
                        <div class="collapse" id="productoPlanoContainer">
                            <img id="productoPlano" src="img/compilado.jpg" class="img-fluid rounded modal-plan-image" alt="Plano tecnico">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <footer class="footer text-center">
        <p class="gold">FORJA NORDICA</p>
        <p>Muebles industriales hechos a mano</p>
        <p class="mt-3">© 2026</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/catalogo.js"></script>
</body>

</html>
