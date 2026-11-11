
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.send("One Piece Bot server is running!");
});

app.post("/api/chat", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Please enter a question." });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "Server API key is missing." });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openrouter/free",
          messages: [
            {
              role: "system",
              content: "You are a friendly One Piece expert. Answer questions about One Piece clearly. Avoid making up facts. Warn users before major spoilers."
            },
            {
              role: "user",
              content: question
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(502).json({ error: "The AI service had a problem. Try again." });
    }

    const answer = data.choices?.[0]?.message?.content;

    res.json({
      answer: answer || "I couldn't think of an answer. Try again!"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.listen(PORT, () => {
  console.log(`One Piece Bot running on port ${PORT}`);
});
