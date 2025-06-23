const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptBtn = document.querySelector(".prompt-btn");
const promptInput = document.querySelector(".prompt-input")
const modelSelect = document.getElementById("model-select")
const countSelect = document.getElementById("count-select")
const ratioSelect = document.getElementById("ratio-select")
const gridGallery = document.querySelector(".gallery-grid");
const API_KEY = "";




const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
  "A cosmic beach with glowing sand and an aurora in the night sky",
  "A medieval marketplace with colorful tents and street performers",
  "A cyberpunk city with neon signs and flying cars at night",
  "A peaceful bamboo forest with a hidden ancient temple",
  "A giant turtle carrying a village on its back in the ocean",
];

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"
}

themeToggle.addEventListener("click", toggleTheme);


// assign random input
promptBtn.addEventListener("click", () => {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
  promptInput.value = prompt;
  promptInput.focus();
})

// Get image Dimensions 

const getImageDimensions = (aspectRatio, baseSize = 512) => {
  const { width, height } = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(width * height);

  let calculateWidth = Math.round(width * scaleFactor);
  let calculateHeight = Math.round(height * scaleFactor);

  calculateWidth = Math.floor(calculateHeight / 16) * 16;
  calculateHeight = Math.floor(calculateHeight / 16) * 16;

  return { width: calculateWidth, height: calculateHeight }
}

// updating loading spinner with generated image
const updateImageCard = (imgIndex, imgUrl) => {
  const imgCard = document.getElementById(`img-card-${imgIndex}`);
  if(!imgCard)
    return;

  imgCard.classList.remove("loading");
  imgCard.innerHTML = `<img src="${imgUrl}" alt="" srcset="" class="result-img">
                    <div class="img-overlay">
                        <a href="${imgUrl}" class="img-download-btn" download = "${Date.now()}.png">
                            <i class="fa-solid fa-download"></i>
                        </a>
                    </div>`
}

// Generate Images

const generateImages = async (promptText, selectModel, imageCount, aspectRatio) => {
  const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectModel}`;
  // const MODEL_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev";

  const { width, height } = getImageDimensions(aspectRatio);

  // Create Array requests as per number of images
  const imagePromises = Array.from({ length: imageCount }, async (_, i) => {
    try {
      const response = await fetch(MODEL_URL, {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: promptText,
          parameters: { width, height },

        }),
      })

      if(!response.ok) throw new Error((await response.json())?.error);

      const result = await response.blob();
      console.log(result);
      // convert response to a image URL and update image cards
      updateImageCard(i, URL.createObjectURL(result));
    } catch (error) {
      console.log(error)
    }
  })

  await Promise.allSettled(imagePromises)
}


// Create placeholder cards
const createImageCards = (promptText, selectModel, imageCount, aspectRatio) => {
  gridGallery.innerHTML = "";

  for (let i = 0; i < imageCount; i++) {
    gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                    <div class="status-container">
                        <div class="spinner">   
                        </div>
                        <p class="status-text">Generating...</p>
                    </div>
                </div>`
  }

  generateImages(promptText, selectModel, imageCount, aspectRatio);
}

// Handle form submission
const handleFormSubmit = (e) => {
  e.preventDefault();

  const selectModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  createImageCards(promptText, selectModel, imageCount, aspectRatio)
}

promptForm.addEventListener("submit", handleFormSubmit)