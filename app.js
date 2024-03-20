const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req, res) => {
  try {
    res.json("Hello World");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function extractTitleAndPages(story) {
  // Regular expression patterns for matching the title and pages
  const titlePattern = /Story Title:\s*(.*?)\s*\n/;
  const pagePattern = /Page\s+(\d+):\s*\n(.*?)\n\n/g;

  let match;
  let title;
  const pages = [];

  // Extract title
  match = titlePattern.exec(story);
  if (match) {
    title = match[1];
  }

  // Extract pages
  while ((match = pagePattern.exec(story)) !== null) {
    const pageNumber = match[1];
    const pageContent = match[2];
    pages.push({ pageNumber, pageContent });
  }

  return { title, pages };
}

app.post("/generateStory", async (req, res) => {
  try {
    const apiResponse = await axios.post(
      "https://staging.enchantedpages.ai:8000/Story_gen",
      req.body
    );
    const { title, pages } = extractTitleAndPages(
      apiResponse?.data?.Story?.paragraphs
    );
    res.json({
      images: apiResponse?.data?.Story?.images,
      title,
      pages,
    });
    // const jsonData = JSON.parse(apiResponse.data?.Story?.paragraphs);
    // console.log(jsonData);
    // res.json({ ...apiResponse.data, paragraphs: jsonData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
