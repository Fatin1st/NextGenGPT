import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

const micIcon = document.getElementById("mic_icon");
const micActiveIcon = document.getElementById("mic_active_icon");

const textarea = document.querySelector("#textarea");
const micButton = document.querySelector("#mic_button");

let recognition;
let isVoiceInput = false; // Flag to track voice input
let loadInterval;
let desiredVoice;
let search_on_wiki = false;
// Function to show the modal
function showModal() {
  const modal = document.getElementById("apiModal");
  modal.style.display = "";
}

// Function to hide the modal
function hideModal() {
  const modal = document.getElementById("apiModal");
  modal.style.display = "none";
}

// Function to handle API key submission
function handleApiKeySubmit() {
  const apiKey = document.getElementById("apiKeyInput").value;

  // Send the API key to the server for further processing
  fetch("https://nextgengpt.onrender.com/api-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      key: apiKey,
    }),
  })
    .then((response) => {
      if (response.ok) {
        hideModal(); // Hide the modal on successful API key submission

        // Create success alert message
        const successDiv = document.createElement("div");
        successDiv.className =
          "alert alert-success d-flex align-items-center fade show";
        successDiv.setAttribute("role", "alert");
        successDiv.innerHTML = `
          <div>
            API Key submitted successfully!
          </div>
        `;

        // Clear any existing success message
        const apiSubmissionSuccessDiv = document.getElementById(
          "api_submission_success"
        );
        apiSubmissionSuccessDiv.innerHTML = "";

        // Append success message to the success div
        apiSubmissionSuccessDiv.appendChild(successDiv);

        // Automatically close the success message after 2 seconds
        setTimeout(() => {
          successDiv.classList.remove("show");
          setTimeout(() => {
            apiSubmissionSuccessDiv.innerHTML = "";
          }, 300); // Wait for the fade-out animation to complete
        }, 2000);
      } else {
        throw new Error("API key submission failed");
      }
    })
    .catch((error) => {
      console.error(error);
      // Handle error if API key submission fails
    });
}

// Event listener for API key submission button
document
  .getElementById("apiKeySubmit")
  .addEventListener("click", handleApiKeySubmit);

// Display the modal when the page loads
window.addEventListener("DOMContentLoaded", showModal);

// Wait for the voices to be loaded
window.speechSynthesis.onvoiceschanged = function () {
  // Retrieve the available voices
  var voices = window.speechSynthesis.getVoices();

  // Find the desired voice by its name or other properties
  desiredVoice = voices.find(function (voice) {
    return voice.name === "Google UK English Female";
  });
};

// Message loader animation
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// letter-by-letter typing animation
function typeAndpronounce(element, text) {
  let index = 0;
  const speech = new SpeechSynthesisUtterance(text);
  speech.voice = desiredVoice;
  speech.rate = 1.0;
  window.speechSynthesis.speak(speech);

  setTimeout(() => {
    let interval = setInterval(() => {
      if (index < text.length) {
        element.innerHTML += text.charAt(index);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 20);
  }, 800); // Delay the typing
}

// uniqueId generator
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// Message container
function chatStripe(isAi, value, uniqueId) {
  if (isAi && value.type === "image") {
    return `
      <div class="wrapper ai">
            <div class="chat">
                <div class="profile">
                  <img src="${bot}" alt="bot" /> 
                </div>
                <div class="message" id=${uniqueId}>
                  <p>Here you go-<br></p
                  <img src="${value.url}" alt="Generated Image" />
                </div>
            </div>
        </div>
    `;
  } else {
    return `
        <div class="wrapper ${isAi && "ai"}">
            <div class="chat">
                <div class="profile">
                    <img
                      src=${isAi ? bot : user} 
                      alt="${isAi ? "bot" : "user"}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
  }
}

// Stop voice recognition
function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// Handle voice input button click
micButton.addEventListener("click", function (e) {
  e.preventDefault(); // Prevent form submission

  window.speechSynthesis.cancel(); // stop the voice

  isVoiceInput = !isVoiceInput;

  if (isVoiceInput) {
    micIcon.style.display = "none";
    micActiveIcon.style.display = "inline";

    recognition = new window.webkitSpeechRecognition(); // Access webkitSpeechRecognition from the window object
    recognition.interimResults = true;

    recognition.addEventListener("result", (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      textarea.value = transcript;
    });

    recognition.addEventListener("end", () => {
      micActiveIcon.style.display = "none";
      micIcon.style.display = "inline";
      if (textarea.value.trim() !== "") {
        form.dispatchEvent(new Event("submit"));
      }
    });

    recognition.start();
    micButton.classList.add("active");
  } else {
    stopRecognition();
    micButton.classList.remove("active");
  }
});

// Handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  const prompt = textarea.value.trim();
  if (prompt === "") {
    return; // If textarea is empty, do not submit
  }

  // Retrieve the available voices
  var voices = window.speechSynthesis.getVoices();

  // Find the desired voice by its name or other properties
  var desiredVoice = voices.find(function (voice) {
    return voice.name === "Google UK English Female";
  });

  const data = new FormData(form);
  window.speechSynthesis.cancel(); // stop the voice
  stopRecognition();

  // user's chatstripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  form.reset();

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Retrieve the selected number of sentences
  const numSentencesSelect = document.getElementById("numSentences");
  const numSentences = numSentencesSelect.value;

  // fetch data from server -> bot's response
  try {
    let response;
    if (search_on_wiki === true) {
      response = await fetch("https://nextgengpt.onrender.com/wikipedia-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchTerm: data.get("prompt"),
          numSentences: numSentences,
        }),
      });
    } else if (search_on_wiki === false) {
      response = await fetch("https://nextgengpt.onrender.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: data.get("prompt"),
        }),
      });
    }

    clearInterval(loadInterval);
    messageDiv.innerHTML = "";

    if (response.ok) {
      const responseData = await response.json();

      if (search_on_wiki === true && responseData.text) {
        // Handle Wikipedia search response
        const parsedData = responseData.text.trim();
        typeAndpronounce(messageDiv, parsedData);
      } else if (search_on_wiki === false && responseData.bot) {
        // Handle regular bot response
        const botData = responseData.bot;
        if (botData.type === "image") {
          // Handle image response
          const imageContainer = document.createElement("div");
          imageContainer.classList.add("image-container");
          const imageElement = document.createElement("img");
          imageElement.src = botData.url;
          imageElement.alt = "Generated Image";
          imageContainer.appendChild(imageElement);
          messageDiv.appendChild(imageContainer);
        } else if (botData.type === "text") {
          // Handle text response
          const parsedData = botData.response.trim();
          typeAndpronounce(messageDiv, parsedData);
        } else if (botData.type === "error") {
          // Handle error response
          messageDiv.innerHTML = botData.message;
        }
      } else {
        messageDiv.innerHTML = "Invalid response data.";
      }
    } else {
      const err = await response.text();
      messageDiv.innerHTML = err;
      alert(err);
    }
  } catch (error) {
    messageDiv.innerHTML = "Something went wrong!";
    console.error(error);
  }
};

// Event listener of Wikipedia Toggle
$(function () {
  $("#wiki-toggle").change(function () {
    const isChecked = $(this).prop("checked");

    if (isChecked) {
      // Enable Wikipedia search
      search_on_wiki = true;
      $("#textarea").attr(
        "placeholder",
        "Ask NextGenGPT or search on Web..."
      );
    } else {
      // Disable Wikipedia search
      search_on_wiki = false;
      $("#textarea").attr("placeholder", "Ask NextGenGPT...");
    }
  });
});

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
