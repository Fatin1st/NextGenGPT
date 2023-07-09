import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

dotenv.config();

let apiKey;

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeMan!",
  });
});

app.post("/api-key", (req, res) => {
  const { key } = req.body;
  apiKey = key; // Set the API key received from the client
  res.sendStatus(200); // Send a success response to the client
});

app.post("/", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const configuration = new Configuration({
      apiKey: apiKey,
    });

    const openai = new OpenAIApi(configuration);

    if (
      prompt.toLowerCase().includes("image") ||
      prompt.toLowerCase().includes("picture")
    ) {
      // Generate image using DALL·E
      const imageResponse = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });

      const imageURL = imageResponse.data.data[0].url;

      res.status(200).send({
        bot: {
          type: "image",
          url: imageURL,
        },
      });
    } else {
      // Generate text response using ChatGPT
      const textResponse = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      });

      const botResponse = textResponse.data.choices[0].text.trim();

      res.status(200).send({
        bot: {
          type: "text",
          response: botResponse,
        },
      });
    }
  } catch (error) {
    console.error(error);
    if (error.response && error.response.status === 401) {
      res.status(401).send("Invalid API key");
    } else {
      res.status(500).send(error || "Something went wrong");
    }
  }
});

app.listen(5000, () =>
  console.log("AI server started on http://localhost:5000")
);
