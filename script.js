/*
  Main site behavior. Normally you should not need to edit this file.
*/

const projectField = document.getElementById("project-field");
const gallery = document.getElementById("gallery");
const galleryImage = document.getElementById("gallery-image");
const galleryText = document.getElementById("gallery-text");
const bio = document.getElementById("bio");
const bioText = document.getElementById("bio-text");
const logoButton = document.getElementById("logo-button");

let currentProject = null;
let currentImage = 0;
let highestZ = 1;

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

    const minSize = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue("--min-size"));
    const maxSize = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue("--max-size"));

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

    const frame = frameFiles[index % frameFiles.length];
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
  let offsetX = 0;
  let offsetY = 0;
  let rotation = "0deg";

  element.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    dragging = true;
    moved = false;

    const rect = element.getBoundingClientRect();
    offsetX = event.clientX - (rect.left + rect.width / 2);
    offsetY = event.clientY - (rect.top + rect.height / 2);

    rotation = element.style.transform.match(/rotate\(([^)]+)\)/)?.[1] || "0deg";

    element.setPointerCapture(event.pointerId);
    element.style.zIndex = ++highestZ;
  });

  element.addEventListener("pointermove", (event) => {
    if (!dragging) return;

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

    if (!moved) openGallery(project);
  });
}

function openGallery(project) {
  currentProject = project;
  currentImage = 0;
  gallery.classList.add("open");
  gallery.setAttribute("aria-hidden", "false");
  showGalleryImage();
}

function showGalleryImage() {
  if (!currentProject) return;
  galleryImage.src = currentProject.images[currentImage];
  galleryImage.alt = `${currentProject.name} ${currentImage + 1}`;
  galleryText.textContent = currentProject.text || currentProject.name;
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

async function openBio() {
  try {
    const response = await fetch("assets/bio.txt");
    bioText.textContent = await response.text();
  } catch {
    bioText.textContent = "Add your biography to assets/bio.txt";
  }

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

createProjects();
