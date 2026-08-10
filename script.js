/*
  Main site behavior. Normally you should not need to edit this file.
*/

const projectField = document.getElementById("project-field");
const gallery = document.getElementById("gallery");
const galleryMedia = document.getElementById("gallery-media");
const galleryText = document.getElementById("gallery-text");
const bio = document.getElementById("bio");
const bioText = document.getElementById("bio-text");
const logoButton = document.getElementById("logo-button");

let currentProject = null;
let currentImage = 0;
let highestZ = 1;
let touchStartX = 0;
let touchEndX = 0;

function trackEvent(name, params = {}) {
  if (typeof gtag === "function") {
    gtag("event", name, params);
  }
}

const frameFiles = [
  "frame01.png",
  "frame02.png",
  "frame03.png",
  "frame04.png",
  "frame05.png"
];

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(random(min, max + 1));
}

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function createProjects() {
  projectField.innerHTML = "";
  const projects = shuffle(PROJECTS);

  projects.forEach((project, index) => {
    const element = document.createElement("div");
    element.className = "project";
	const screenScale = Math.max(
	0.6,
	Math.min(window.innerWidth / 1200, 1)
	);
	const minSize = 150 * screenScale;
	const maxSize = 200 * screenScale;
	const size = randomInt(minSize, maxSize);
    const x = random(0, 100);
    const y = random(0, 100);
    const rotation = random(-14, 14);

    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
    element.style.transform =
      `translate(-50%, -50%) rotate(${rotation}deg)`;
    element.style.zIndex = ++highestZ;

    const frame = project.exhibition
  ? "EX_frame.png"
  : frameFiles[index % frameFiles.length];
	const frameRotation = [0, 90, 270][Math.floor(Math.random() * 4)];

    element.innerHTML = `
      <div class="project-frame">
        <img class="project-image" src="${project.image}" alt="${project.name}">
        <img class="frame-image" src="frames/${frame}" alt="" style="transform: rotate(${frameRotation}deg);">
      </div>
    `;

    projectField.appendChild(element);
    enableDragging(element, project);
  });
}

function enableDragging(element, project) {
  let dragging = false;
  let moved = false;

  let startX = 0;
  let startY = 0;

  let offsetX = 0;
  let offsetY = 0;

  let rotation = "0deg";

  // How far the finger/mouse can move before it counts as a drag.
  const dragThreshold = 8;

  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();

    dragging = true;
    moved = false;

    startX = event.clientX;
    startY = event.clientY;

    const rect = element.getBoundingClientRect();

    offsetX = event.clientX - (rect.left + rect.width / 2);
    offsetY = event.clientY - (rect.top + rect.height / 2);

    rotation =
      element.style.transform.match(/rotate\(([^)]+)\)/)?.[1] || "0deg";

    element.setPointerCapture(event.pointerId);
    element.style.zIndex = ++highestZ;
  });

  element.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const distanceX = event.clientX - startX;
    const distanceY = event.clientY - startY;

    const distance = Math.sqrt(
      distanceX * distanceX + distanceY * distanceY
    );

    // Ignore tiny finger/mouse movements.
    if (distance < dragThreshold) {
      return;
    }

    moved = true;

    const fieldRect = projectField.getBoundingClientRect();

    const x = event.clientX - fieldRect.left - offsetX;
    const y = event.clientY - fieldRect.top - offsetY;

    element.style.left = `${(x / fieldRect.width) * 100}%`;
    element.style.top = `${(y / fieldRect.height) * 100}%`;

    element.style.transform =
      `translate(-50%, -50%) rotate(${rotation})`;
  });

  element.addEventListener("pointerup", (event) => {
    if (!dragging) return;

    dragging = false;

    element.releasePointerCapture(event.pointerId);

    // Tap/click opens project.
    // Actual drag does not.
    if (!moved) {
      openGallery(project);
    }
  });
}

function linkify(text) {
  // Web links
  text = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Email addresses
  text = text.replace(
    /([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi,
    '<a href="mailto:$1">$1</a>'
  );

  return text;
}

function formatProjectText(text) {
  let lines = text.split("\n");

  const hasInquire = lines.some(
    line => line.trim().toUpperCase() === "INQUIRE"
  );

  lines = lines.filter(
    line => line.trim().toUpperCase() !== "INQUIRE"
  );

  const title = lines.shift() || "";

  let body = lines.join("\n");

  body = body.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  body = linkify(body);

  let heading = `<span class="project-title">${title}</span>`;

  if (hasInquire) {
    const subject = encodeURIComponent(`Inquiry about ${title}`);

    heading =
      `<span class="project-heading">` +
        `<span class="project-title">${title}</span>` +
        `<a class="inquire-link" href="mailto:ryan@rydeck.com?subject=${subject}">Inquire</a>` +
      `</span>`;
  }

  return heading + "\n" + body;
}

function formatBioText(text) {
  // **text** becomes bold
  text = text.replace(
    /\*\*(.*?)\*\*/g,
    "<strong>$1</strong>"
  );

  // Make URLs and email addresses clickable
  text = linkify(text);

  return text;
}

function openGallery(project) {
  currentProject = project;
  currentImage = 0;
  trackEvent("project_open", {
  project_name: project.name
});
  gallery.classList.add("open");
  gallery.setAttribute("aria-hidden", "false");
  showGalleryImage();

}

function showGalleryImage() {
  if (!currentProject) return;

  const media = currentProject.images[currentImage];

  galleryMedia.innerHTML = "";

  if (media.type === "youtube") {
    const iframe = document.createElement("iframe");

    iframe.src = media.url;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";

    iframe.allowFullscreen = true;

    galleryMedia.appendChild(iframe);
  } else {
    const img = document.createElement("img");

    img.src = media.url;
    img.alt = `${currentProject.name} ${currentImage + 1}`;

    galleryMedia.appendChild(img);
  }
  
trackEvent("gallery_slide", {
  project_name: currentProject.name,
  slide_number: currentImage + 1
});

  galleryText.innerHTML = formatProjectText(
    currentProject.text || currentProject.name
  );
}

function nextImage() {
  if (!currentProject) return;
  currentImage = (currentImage + 1) % currentProject.images.length;
  showGalleryImage();
}

function previousImage() {
  if (!currentProject) return;
  currentImage =
    (currentImage - 1 + currentProject.images.length) %
    currentProject.images.length;
  showGalleryImage();
}

function closeGallery() {
  gallery.classList.remove("open");
  gallery.setAttribute("aria-hidden", "true");

  // Remove the current image/video.
  // This stops YouTube playback immediately.
  galleryMedia.innerHTML = "";

  currentProject = null;
}
document.querySelector(".gallery-next").addEventListener("click", (e) => {
  e.stopPropagation();
  nextImage();
});

document.querySelector(".gallery-prev").addEventListener("click", (e) => {
  e.stopPropagation();
  previousImage();
});

gallery.querySelector(".close-button").addEventListener("click", closeGallery);

bio.querySelector(".close-button").addEventListener("click", closeBio);

gallery.addEventListener("click", (event) => {
  if (event.target === gallery) closeGallery();
});

bio.addEventListener("click", (event) => {
  if (event.target === bio) closeBio();
});

gallery.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
}, { passive: true });

gallery.addEventListener("touchend", (event) => {
  touchEndX = event.changedTouches[0].screenX;

  const swipeDistance = touchEndX - touchStartX;
  const swipeThreshold = 50;

  if (Math.abs(swipeDistance) < swipeThreshold) return;

  if (swipeDistance < 0) {
    nextImage();
  } else {
    previousImage();
  }
}, { passive: true });

let wheelLocked = false;

gallery.addEventListener("wheel", (event) => {
  event.preventDefault();

  if (wheelLocked) return;

  const movement =
    Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY;

  if (Math.abs(movement) < 10) return;

  wheelLocked = true;

  if (movement > 0) {
    nextImage();
  } else {
    previousImage();
  }

  setTimeout(() => {
    wheelLocked = false;
  }, 50);
}, { passive: false });

async function openBio() {
  try {
    const response = await fetch("assets/bio.txt");
    const text = await response.text();

    bioText.innerHTML = formatBioText(text);
  } catch {
    bioText.textContent = "Add your biography to assets/bio.txt";
  }
  trackEvent("bio_open");
  bio.classList.add("open");
  bio.setAttribute("aria-hidden", "false");
}

function closeBio() {
  bio.classList.remove("open");
  bio.setAttribute("aria-hidden", "true");
}

logoButton.addEventListener("click", openBio);

bio.addEventListener("click", (event) => {
  if (event.target === bio) closeBio();
});

document.addEventListener("keydown", (event) => {
  if (gallery.classList.contains("open")) {
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") previousImage();
    if (event.key === "Escape") closeGallery();
  }

  if (bio.classList.contains("open")) {
    if (event.key === "Escape") closeBio();
  }
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) return;

  trackEvent("link_click", {
    link_url: link.href,
    link_text: link.textContent.trim()
  });
});

createProjects();

let resizeTimer;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);

  resizeTimer = setTimeout(() => {
    createProjects();
  }, 150);
});

