document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("productoModal");

  if (!modal) {
    return;
  }

  const modalTitle = document.getElementById("productoTitulo");
  const modalImage = document.getElementById("productoImagen");
  const modalDescription = document.getElementById("productoDescripcion");
  const modalPlanImage = document.getElementById("productoPlano");
  const modalIronColors = document.getElementById("productoColorHierro");
  const modalMeasures = document.getElementById("productoMedidas");
  const modalMercadoLibre = document.getElementById("productoMercadoLibre");
  const modalConsulta = document.getElementById("productoConsulta");
  const woodColorsContainer = document.getElementById("productoColoresMadera");
  const planContainer = document.getElementById("productoPlanoContainer");

  const buildWoodColors = (colors) => {
    woodColorsContainer.innerHTML = "";

    if (!Array.isArray(colors) || colors.length === 0) {
      return;
    }

    colors.forEach((color) => {
      const circle = document.createElement("div");
      circle.className = "wood wood-dynamic";
      circle.style.backgroundColor = color;
      woodColorsContainer.appendChild(circle);
    });
  };

  modal.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;

    if (!trigger) {
      return;
    }

    const { title, desc, image, plan, ironColors, measures, mercadolibre, consulta, woodColors } = trigger.dataset;

    modalTitle.textContent = title || "";
    modalDescription.textContent = desc || "";
    modalImage.src = image || "";
    modalImage.alt = title || "Producto";
    modalPlanImage.src = plan || "img/plano.jpg";
    modalIronColors.textContent = ironColors || "";
    modalMeasures.innerHTML = (measures || "").replace(/\n/g, "<br>");
    modalMercadoLibre.href = mercadolibre || "#";
    modalConsulta.href = consulta || "#";

    let parsedColors = [];
    if (woodColors) {
      try {
        parsedColors = JSON.parse(woodColors);
      } catch (error) {
        parsedColors = [];
      }
    }
    buildWoodColors(parsedColors);

    if (planContainer && planContainer.classList.contains("show")) {
      const collapse = bootstrap.Collapse.getOrCreateInstance(planContainer, { toggle: false });
      collapse.hide();
    }
  });
});
