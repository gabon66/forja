document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-card-gallery]").forEach((gallery) => {
    let images = [];
    try {
      images = JSON.parse(gallery.dataset.galleryImages || "[]");
    } catch (error) {
      images = [];
    }
    if (!Array.isArray(images) || images.length < 2) {
      gallery.querySelectorAll("[data-gallery-step], [data-gallery-count]").forEach((control) => {
        control.hidden = true;
      });
      return;
    }

    const image = gallery.querySelector("img");
    const count = gallery.querySelector("[data-gallery-count]");
    let index = 0;
    gallery.querySelectorAll("[data-gallery-step]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        index = (index + Number(button.dataset.galleryStep) + images.length) % images.length;
        image.src = images[index];
        image.alt = `${image.alt.split(" — vista ")[0]} — vista ${index + 1} de ${images.length}`;
        count.textContent = `${String(index + 1).padStart(2, "0")} / ${String(images.length).padStart(2, "0")}`;
      });
    });
  });

  const modal = document.getElementById("productoModal");

  if (!modal) {
    return;
  }

  document.querySelectorAll(".product-card[data-product-slug]").forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("[data-gallery-step]")) {
        return;
      }
      bootstrap.Modal.getOrCreateInstance(modal).show(card);
    });
  });

  const modalTitle = document.getElementById("productoTitulo");
  const modalImage = document.getElementById("productoImagen");
  const galleryIndicators = document.getElementById("productoGaleriaIndicadores");
  const galleryPrevious = document.getElementById("productoGaleriaAnterior");
  const galleryNext = document.getElementById("productoGaleriaSiguiente");
  const productGallery = document.getElementById("productoGaleria");
  const model3DActions = document.getElementById("productoAcciones3D");
  const model3DButton = document.getElementById("productoAlternar3D");
  const model3DView = document.getElementById("productoVista3D");
  const model3DViewer = document.getElementById("productoModelo3D");
  const modalDescription = document.getElementById("productoDescripcion");
  const modalIronColors = document.getElementById("productoColorHierro");
  const modalMeasures = document.getElementById("productoMedidas");
  const modalConsulta = document.getElementById("productoConsulta");
  const shareButton = document.getElementById("productoCompartir");
  const shareStatus = document.getElementById("productoEstadoCompartir");
  const woodColorsSection = document.getElementById("productoSeccionColorMadera");
  const ironColorsSection = document.getElementById("productoSeccionColorHierro");
  const ironVariantContainer = document.getElementById("productoVariantesHierro");
  const ironBlackButton = document.getElementById("productoHierroNegro");
  const ironWhiteButton = document.getElementById("productoHierroBlanco");
  const woodColorsContainer = document.getElementById("productoColoresMadera");
  const selectedWoodLabel = document.getElementById("productoMaderaSeleccionada");
  const contactForms = document.querySelectorAll("[data-contact-form]");
  const contactProductInput = document.getElementById("productoNombreModelo");
  let activeProductTrigger = null;
  let woodVariantImages = {};
  let activeWoodIndex = 0;
  let activeIronColor = "negro";
  let galleryImages = [];
  let activeGalleryIndex = 0;
  const syncModel3DFinish = () => {
    const baseModel = activeProductTrigger?.dataset.model3d || "";
    const woodFinishes = ["miel", "roble", "nogal", "ebano"];
    const woodFinish = woodFinishes[activeWoodIndex] || woodFinishes[0];
    const modelForFinish = baseModel.replace(/(?:-miel-negro)?\.glb(?=\?|$)/i, `-${woodFinish}-${activeIronColor}.glb`);

    if (modelForFinish && model3DViewer.getAttribute("src") !== modelForFinish) {
      model3DViewer.setAttribute("src", modelForFinish);
    }
  };

  const showGalleryImage = (index) => {
    if (galleryImages.length === 0) {
      return;
    }

    activeGalleryIndex = (index + galleryImages.length) % galleryImages.length;
    modalImage.src = galleryImages[activeGalleryIndex];
    modalImage.alt = `${modalTitle.textContent} — vista ${activeGalleryIndex + 1} de ${galleryImages.length}`;
    galleryIndicators.querySelectorAll("button").forEach((button, buttonIndex) => {
      const selected = buttonIndex === activeGalleryIndex;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
    galleryPrevious.hidden = galleryImages.length < 2;
    galleryNext.hidden = galleryImages.length < 2;
    galleryIndicators.hidden = galleryImages.length < 2;
  };

  const renderGallery = (images) => {
    galleryImages = [...new Set(images.filter(Boolean))];
    galleryIndicators.innerHTML = "";
    galleryImages.forEach((_, index) => {
      const indicator = document.createElement("button");
      indicator.type = "button";
      indicator.className = "product-gallery-indicator";
      indicator.textContent = String(index + 1).padStart(2, "0");
      indicator.setAttribute("aria-label", `Ver imagen ${index + 1} de ${galleryImages.length}`);
      indicator.addEventListener("click", () => showGalleryImage(index));
      galleryIndicators.appendChild(indicator);
    });
    showGalleryImage(0);
  };

  const setProductUrl = (slug) => {
    const url = new URL(window.location.href);
    if (slug) {
      url.searchParams.set("producto", slug);
    } else {
      url.searchParams.delete("producto");
    }
    window.history.replaceState({ producto: slug || null }, "", url);
  };

  const updateProductImage = () => {
    const woodImages = woodVariantImages[activeIronColor] || [];
    const selectedImage = woodImages[activeWoodIndex];
    const ironImage = activeIronColor === "blanco"
      ? activeProductTrigger?.dataset.ironImageWhite
      : activeProductTrigger?.dataset.ironImageBlack;
    const mainImage = selectedImage || ironImage || activeProductTrigger?.dataset.image || "";
    if (galleryImages.length === 0) {
      galleryImages = [mainImage];
    } else {
      galleryImages[0] = mainImage;
    }
    showGalleryImage(0);

    if (activeProductTrigger) {
      activeProductTrigger.dataset.image = modalImage.src;
    }
  };

  const buildWoodColors = (colors, onSelect, selectedIndex = 0) => {
    woodColorsContainer.innerHTML = "";
    selectedWoodLabel.textContent = "";

    if (!Array.isArray(colors) || colors.length === 0) {
      return;
    }

    const defaultNames = ["Miel", "Roble", "Nogal", "Ébano"];
    const setSelected = (index) => {
      const selectedButton = woodColorsContainer.querySelector(`[data-wood-index="${index}"]`);
      woodColorsContainer.querySelectorAll("[data-wood-index]").forEach((button) => {
        const isSelected = button === selectedButton;
        button.classList.toggle("active", isSelected);
        button.setAttribute("aria-pressed", isSelected ? "true" : "false");
      });
      selectedWoodLabel.textContent = selectedButton
        ? `Seleccionado: ${selectedButton.dataset.woodName}`
        : "";
    };

    colors.forEach((color, index) => {
      const circle = document.createElement("button");
      const colorValue = typeof color === "string" ? color : color.color;
      const colorName = typeof color === "string" ? defaultNames[index] : color.nombre;
      circle.className = "wood wood-dynamic";
      circle.type = "button";
      circle.dataset.woodIndex = String(index);
      circle.dataset.woodName = colorName || `Tono ${index + 1}`;
      circle.setAttribute("aria-label", `Madera ${circle.dataset.woodName}`);
      circle.setAttribute("aria-pressed", "false");
      circle.title = `Madera ${circle.dataset.woodName}`;
      circle.style.backgroundColor = colorValue;
      circle.addEventListener("click", () => {
        activeWoodIndex = index;
        setSelected(index);
        if (activeProductTrigger) {
          activeProductTrigger.dataset.currentWoodIndex = String(index);
        }
        onSelect(index);
        if (!model3DView.hidden) {
          syncModel3DFinish();
        }
      });
      woodColorsContainer.appendChild(circle);
    });

    activeWoodIndex = Math.min(selectedIndex, colors.length - 1);
    const selectedColor = colors[activeWoodIndex];
    setSelected(activeWoodIndex);
    onSelect(activeWoodIndex);
  };

  modal.addEventListener("show.bs.modal", (event) => {
    const trigger = event.relatedTarget;

    if (!trigger) {
      return;
    }
    activeProductTrigger = trigger;

    setProductUrl(trigger.dataset.productSlug);
    shareStatus.textContent = "";

    const { title, desc, image, ironImageBlack, ironImageWhite, ironColors, measures, consulta, woodColors, woodVariants, gallery } = trigger.dataset;

    modalTitle.textContent = title || "";
    modalDescription.textContent = desc || "";
    let parsedGallery = [];
    if (gallery) {
      try {
        parsedGallery = JSON.parse(gallery);
      } catch (error) {
        parsedGallery = [];
      }
    }
    renderGallery([image || "", ...(Array.isArray(parsedGallery) ? parsedGallery : [])]);
    modalIronColors.textContent = ironColors || "";
    ironColorsSection.hidden = !ironColors;
    modalMeasures.innerHTML = (measures || "").replace(/\n/g, "<br>");
    modalConsulta.href = consulta || "#";
    contactProductInput.value = title || "";
    document.querySelector("#productoFormularioContacto [data-form-status]").textContent = "";
    activeIronColor = trigger.dataset.currentIronColor === "white" ? "blanco" : "negro";
    activeWoodIndex = Number(trigger.dataset.currentWoodIndex || 0);
    productGallery.hidden = false;
    model3DView.hidden = true;
    model3DButton.setAttribute("aria-pressed", "false");
    model3DButton.innerHTML = '<i class="bi bi-box me-1" aria-hidden="true"></i>Ver modelo 3D';
    model3DActions.hidden = !trigger.dataset.model3d;

    const hasIronVariants = Boolean(ironImageBlack && ironImageWhite);
    ironVariantContainer.hidden = !hasIronVariants;
    if (hasIronVariants) {
      ironBlackButton.dataset.image = ironImageBlack;
      ironWhiteButton.dataset.image = ironImageWhite;
      const selectedWhite = activeIronColor === "blanco";
      modalImage.src = selectedWhite ? ironImageWhite : ironImageBlack;
      ironBlackButton.classList.toggle("active", !selectedWhite);
      ironWhiteButton.classList.toggle("active", selectedWhite);
    }

    let parsedColors = [];
    if (woodColors) {
      try {
        parsedColors = JSON.parse(woodColors);
      } catch (error) {
        parsedColors = [];
      }
    }
    woodColorsSection.hidden = parsedColors.length === 0;
    woodVariantImages = {};
    if (woodVariants) {
      try {
        woodVariantImages = JSON.parse(woodVariants);
      } catch (error) {
        woodVariantImages = {};
      }
    }
    buildWoodColors(parsedColors, updateProductImage, activeWoodIndex);
  });

  galleryPrevious.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
  galleryNext.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));

  model3DButton.addEventListener("click", () => {
    const showing3D = model3DView.hidden;
    productGallery.hidden = showing3D;
    model3DView.hidden = !showing3D;
    model3DButton.setAttribute("aria-pressed", showing3D ? "true" : "false");
    model3DButton.innerHTML = showing3D
      ? '<i class="bi bi-images me-1" aria-hidden="true"></i>Volver a las fotos'
      : '<i class="bi bi-box me-1" aria-hidden="true"></i>Ver modelo 3D';

    if (showing3D) {
      syncModel3DFinish();
    }
  });

  modal.addEventListener("hidden.bs.modal", () => {
    setProductUrl("");
    activeProductTrigger = null;
    shareStatus.textContent = "";
  });

  shareButton.addEventListener("click", async () => {
    if (!activeProductTrigger?.dataset.productSlug) {
      return;
    }

    setProductUrl(activeProductTrigger.dataset.productSlug);
    try {
      await navigator.clipboard.writeText(window.location.href);
      shareStatus.textContent = "Enlace copiado";
    } catch (error) {
      shareStatus.textContent = "Copiá la URL de la barra del navegador.";
    }
  });

  ironVariantContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-image]");
    if (!button) {
      return;
    }

    ironBlackButton.classList.toggle("active", button === ironBlackButton);
    ironWhiteButton.classList.toggle("active", button === ironWhiteButton);
    if (activeProductTrigger) {
      const selectedColor = button === ironWhiteButton ? "white" : "black";
      activeProductTrigger.dataset.currentIronColor = selectedColor;
      activeIronColor = selectedColor === "white" ? "blanco" : "negro";
    }
    if (!model3DView.hidden) {
      syncModel3DFinish();
    }
    updateProductImage();
  });

  contactForms.forEach((contactForm) => {
    const submitButton = contactForm.querySelector('[type="submit"]');
    const status = contactForm.querySelector("[data-form-status]");

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      status.className = "small text-secondary";
      status.textContent = "Enviando consulta…";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });
        const result = await response.json().catch(() => ({
          ok: false,
          message: "No se pudo enviar en este momento. Probá por WhatsApp."
        }));
        if (!response.ok || !result.ok) {
          throw new Error(result.message || "No se pudo enviar la consulta.");
        }

        status.className = "small text-success";
        status.textContent = result.message || "Consulta enviada. ¡Gracias!";
        contactForm.reset();
        if (contactForm.id === "productoFormularioContacto") {
          contactProductInput.value = activeProductTrigger?.dataset.title || "";
        }
      } catch (error) {
        status.className = "small text-warning";
        status.textContent = error.message || "No se pudo enviar. Probá por WhatsApp.";
      } finally {
        submitButton.disabled = false;
      }
    });
  });

  const sharedProductSlug = new URLSearchParams(window.location.search).get("producto");
  if (sharedProductSlug) {
    const productTrigger = Array.from(document.querySelectorAll(".product-card[data-product-slug]"))
      .find((card) => card.dataset.productSlug === sharedProductSlug);
    if (productTrigger) {
      bootstrap.Modal.getOrCreateInstance(modal).show(productTrigger);
    }
  }
});
