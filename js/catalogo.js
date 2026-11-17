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
  const photoGalleryNote = document.getElementById("productoNotaGaleria");
  const photoCarousel = document.getElementById("productoMiniaturasCarrusel");
  const photoTrack = document.getElementById("productoGaleriaMiniaturas");
  const photoPrevious = document.getElementById("productoMiniaturaAnterior");
  const photoNext = document.getElementById("productoMiniaturaSiguiente");
  const productGalleryAnchor = document.getElementById("productoGaleriaAncla");
  const productGalleryFullWidth = document.getElementById("productoGaleriaAnchoCompleto");
  const productGalleryDivider = document.getElementById("productoSeparadorGaleria");
  const photoZoom = document.getElementById("productoZoomFotos");
  const photoZoomImage = document.getElementById("productoZoomImagen");
  const photoZoomCount = document.getElementById("productoZoomContador");
  const photoZoomClose = document.getElementById("productoZoomCerrar");
  const photoZoomPrevious = document.getElementById("productoZoomAnterior");
  const photoZoomNext = document.getElementById("productoZoomSiguiente");
  const model3DView = document.getElementById("productoVista3D");
  const model3DViewer = document.getElementById("productoModelo3D");
  const modalDescription = document.getElementById("productoDescripcion");
  const modalMeasures = document.getElementById("productoMedidas");
  const modalConsulta = document.getElementById("productoConsulta");
  const shareButton = document.getElementById("productoCompartir");
  const shareStatus = document.getElementById("productoEstadoCompartir");
  const woodColorsSection = document.getElementById("productoSeccionColorMadera");
  const ironColorsSection = document.getElementById("productoSeccionColorHierro");
  const ironVariantContainer = document.getElementById("productoVariantesHierro");
  const ironBlackButton = document.getElementById("productoHierroNegro");
  const ironWhiteButton = document.getElementById("productoHierroBlanco");
  const ironProfileSection = document.getElementById("productoSeccionPerfilHierro");
  const ironProfileButtons = document.querySelectorAll("#productoPerfilesHierro [data-profile-size]");
  const woodColorsContainer = document.getElementById("productoColoresMadera");
  const selectedWoodLabel = document.getElementById("productoMaderaSeleccionada");
  const contactForms = document.querySelectorAll("[data-contact-form]");
  const contactProductInput = document.getElementById("productoNombreModelo");
  let activeProductTrigger = null;
  let woodVariantImages = {};
  let activeWoodIndex = 0;
  let activeIronColor = "negro";
  let activeIronSize = 8;
  let ironProfileSizes = [];
  let galleryImages = [];
  let activeGalleryIndex = 0;
  let photoZoomReturnFocus = null;
  const syncModel3DFinish = () => {
    const baseModel = activeProductTrigger?.dataset.model3d || "";
    const woodFinishes = ["miel", "roble", "nogal", "ebano"];
    const woodFinish = woodFinishes[activeWoodIndex] || woodFinishes[0];
    const modelForFinish = baseModel.replace(/(?:-(?:miel|roble|nogal|ebano)-(?:negro|blanco)-(?:4|8|10)cm)?\.glb(?=\?|$)/i,
      `-${woodFinish}-${activeIronColor}-${activeIronSize}cm.glb`);

    if (modelForFinish && model3DViewer.getAttribute("src") !== modelForFinish) {
      model3DViewer.setAttribute("src", modelForFinish);
    }
  };

  const updateIronProfileSelection = () => {
    ironProfileButtons.forEach((button) => {
      const selected = Number(button.dataset.profileSize) === activeIronSize;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });

    if (!activeProductTrigger) {
      return;
    }

    const profile = `${activeIronSize} × ${activeIronSize} cm`;
    const measures = activeProductTrigger.dataset.measures || "";
    modalMeasures.innerHTML = measures
      .replace(/Perfiles de hierro: \d+ × \d+ cm/g, `Perfiles de hierro: ${profile}`)
      .replace(/Marco trapezoidal: 60 cm arriba y \d+ cm en la base/g,
        `Marco trapezoidal: 60 cm arriba y ${60 - 2 * activeIronSize} cm en la base`)
      .replace(/\n/g, "<br>");

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
    const has3DModel = Boolean(activeProductTrigger?.dataset.model3d);
    galleryIndicators.hidden = has3DModel || galleryImages.length < 2;
    photoTrack.querySelectorAll("[data-photo-index]").forEach((button) => {
      const selected = Number(button.dataset.photoIndex) === activeGalleryIndex;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-current", selected ? "true" : "false");
    });
    photoZoomCount.textContent = `${String(activeGalleryIndex + 1).padStart(2, "0")} / ${String(galleryImages.length).padStart(2, "0")}`;
  };

  const renderGallery = (images) => {
    galleryImages = [...new Set(images.filter(Boolean))];
    galleryIndicators.innerHTML = "";
    photoTrack.innerHTML = "";
    const has3DModel = Boolean(activeProductTrigger?.dataset.model3d);
    const galleryStage = productGallery.querySelector(".product-gallery-stage");
    galleryStage.hidden = has3DModel;
    photoCarousel.hidden = !has3DModel;
    photoGalleryNote.textContent = has3DModel
      ? "Fotos de referencia. Tocá una para ampliarla y deslizá para ver más."
      : "Vistas ilustrativas del modelo. Los detalles pueden variar según la terminación elegida.";

    galleryImages.forEach((image, index) => {
      if (has3DModel) {
        const thumbnail = document.createElement("button");
        thumbnail.type = "button";
        thumbnail.className = "product-photo-thumbnail";
        thumbnail.dataset.photoIndex = String(index);
        thumbnail.setAttribute("aria-label", `Ampliar foto ${index + 1} de ${galleryImages.length}`);
        thumbnail.setAttribute("aria-current", "false");
        const thumbnailImage = document.createElement("img");
        thumbnailImage.src = image;
        thumbnailImage.alt = "";
        thumbnailImage.loading = "lazy";
        thumbnail.appendChild(thumbnailImage);
        photoTrack.appendChild(thumbnail);
      } else {
        const indicator = document.createElement("button");
        indicator.type = "button";
        indicator.className = "product-gallery-indicator";
        indicator.textContent = String(index + 1).padStart(2, "0");
        indicator.setAttribute("aria-label", `Ver imagen ${index + 1} de ${galleryImages.length}`);
        indicator.addEventListener("click", () => showGalleryImage(index));
        galleryIndicators.appendChild(indicator);
      }
    });
    photoPrevious.hidden = galleryImages.length < 2;
    photoNext.hidden = galleryImages.length < 2;
    showGalleryImage(0);
  };

  const openPhotoZoom = (index) => {
    photoZoomReturnFocus = document.activeElement;
    showGalleryImage(index);
    photoZoomImage.src = galleryImages[activeGalleryIndex];
    photoZoomImage.alt = `${modalTitle.textContent} — foto ${activeGalleryIndex + 1} de ${galleryImages.length}`;
    photoZoom.hidden = false;
    photoZoomClose.focus();
  };

  const closePhotoZoom = () => {
    photoZoom.hidden = true;
    if (photoZoomReturnFocus?.isConnected) {
      photoZoomReturnFocus.focus();
    }
  };

  const stepPhotoZoom = (step) => {
    showGalleryImage(activeGalleryIndex + step);
    photoZoomImage.src = galleryImages[activeGalleryIndex];
    photoZoomImage.alt = `${modalTitle.textContent} — foto ${activeGalleryIndex + 1} de ${galleryImages.length}`;
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
    if (activeProductTrigger?.dataset.model3d) {
      syncModel3DFinish();
      return;
    }

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

    const { title, desc, image, ironImageBlack, ironImageWhite, measures, consulta, woodColors, woodVariants, gallery } = trigger.dataset;
    const has3DModel = Boolean(trigger.dataset.model3d);

    if (has3DModel) {
      productGallery.classList.add("product-gallery-wide");
      productGalleryFullWidth.append(productGallery);
      productGalleryFullWidth.hidden = false;
      productGalleryDivider.hidden = false;
    } else {
      productGallery.classList.remove("product-gallery-wide");
      productGalleryAnchor.after(productGallery);
      productGalleryFullWidth.hidden = true;
      productGalleryDivider.hidden = true;
    }

    modalTitle.textContent = title || "";
    model3DViewer.setAttribute("alt", `Modelo 3D de ${title || "este producto"}`);
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
    modalMeasures.innerHTML = (measures || "").replace(/\n/g, "<br>");
    modalConsulta.href = consulta || "#";
    contactProductInput.value = title || "";
    document.querySelector("#productoFormularioContacto [data-form-status]").textContent = "";
    activeIronColor = trigger.dataset.currentIronColor === "white" ? "blanco" : "negro";
    try {
      ironProfileSizes = JSON.parse(trigger.dataset.ironProfileOptions || "[]").map(Number);
    } catch (error) {
      ironProfileSizes = [];
    }
    activeIronSize = ironProfileSizes.includes(8) ? 8 : (ironProfileSizes[0] || 8);
    activeIronSize = ironProfileSizes.includes(Number(trigger.dataset.currentIronSize))
      ? Number(trigger.dataset.currentIronSize)
      : activeIronSize;
    ironProfileSection.hidden = ironProfileSizes.length === 0;
    updateIronProfileSelection();
    activeWoodIndex = Number(trigger.dataset.currentWoodIndex || 0);
    productGallery.hidden = false;
    model3DView.hidden = !has3DModel;

    const hasIronVariants = Boolean(ironImageBlack && ironImageWhite);
    ironVariantContainer.hidden = !hasIronVariants;
    ironColorsSection.hidden = !hasIronVariants;
    if (hasIronVariants) {
      ironBlackButton.dataset.image = ironImageBlack;
      ironWhiteButton.dataset.image = ironImageWhite;
      const selectedWhite = activeIronColor === "blanco";
      modalImage.src = selectedWhite ? ironImageWhite : ironImageBlack;
      ironBlackButton.classList.toggle("active", !selectedWhite);
      ironWhiteButton.classList.toggle("active", selectedWhite);
      ironBlackButton.setAttribute("aria-pressed", selectedWhite ? "false" : "true");
      ironWhiteButton.setAttribute("aria-pressed", selectedWhite ? "true" : "false");
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
    if (trigger.dataset.model3d) {
      syncModel3DFinish();
    }
  });

  galleryPrevious.addEventListener("click", () => showGalleryImage(activeGalleryIndex - 1));
  galleryNext.addEventListener("click", () => showGalleryImage(activeGalleryIndex + 1));

  photoPrevious.addEventListener("click", () => photoTrack.scrollBy({left: -200, behavior: "smooth"}));
  photoNext.addEventListener("click", () => photoTrack.scrollBy({left: 200, behavior: "smooth"}));
  photoTrack.addEventListener("click", (event) => {
    const thumbnail = event.target.closest("[data-photo-index]");
    if (thumbnail) {
      openPhotoZoom(Number(thumbnail.dataset.photoIndex));
    }
  });
  photoZoomClose.addEventListener("click", closePhotoZoom);
  photoZoomPrevious.addEventListener("click", () => stepPhotoZoom(-1));
  photoZoomNext.addEventListener("click", () => stepPhotoZoom(1));
  photoZoom.addEventListener("click", (event) => {
    if (event.target === photoZoom) {
      closePhotoZoom();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (photoZoom.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closePhotoZoom();
    } else if (event.key === "ArrowLeft") {
      stepPhotoZoom(-1);
    } else if (event.key === "ArrowRight") {
      stepPhotoZoom(1);
    }
  });

  modal.addEventListener("hidden.bs.modal", () => {
    if (!photoZoom.hidden) {
      photoZoom.hidden = true;
    }
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
    ironBlackButton.setAttribute("aria-pressed", button === ironBlackButton ? "true" : "false");
    ironWhiteButton.setAttribute("aria-pressed", button === ironWhiteButton ? "true" : "false");
    if (activeProductTrigger) {
      const selectedColor = button === ironWhiteButton ? "white" : "black";
      activeProductTrigger.dataset.currentIronColor = selectedColor;
      activeIronColor = selectedColor === "white" ? "blanco" : "negro";
    }
    if (!model3DView.hidden) syncModel3DFinish();
    updateProductImage();
  });

  document.getElementById("productoPerfilesHierro").addEventListener("click", (event) => {
    const button = event.target.closest("[data-profile-size]");
    if (!button) {
      return;
    }

    const selectedSize = Number(button.dataset.profileSize);
    if (!ironProfileSizes.includes(selectedSize)) {
      return;
    }

    activeIronSize = selectedSize;
    if (activeProductTrigger) {
      activeProductTrigger.dataset.currentIronSize = String(selectedSize);
    }
    updateIronProfileSelection();
    if (!model3DView.hidden) {
      syncModel3DFinish();
    }
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
