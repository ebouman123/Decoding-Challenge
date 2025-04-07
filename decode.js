const axios = require("axios");
const cheerio = require("cheerio");

const assessmentData =
  "https://docs.google.com/document/d/e/2PACX-1vQGUck9HIFCyezsrBSnmENk5ieJuYwpt7YHYEzeNJkIb9OSDdx-ov2nRNReKQyey-cwJOoEKUhLmN9z/pub";

// uses cheerio to scrape the table data from the Google Doc and push it into an array
async function scrapeTable(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const tableData = [];

    $("table tr").each((_, row) => {
      const rowData = [];
      $(row)
        .find("td, th")
        .each((_, cell) => {
          rowData.push($(cell).text().trim());
        });
      if (rowData.length > 0) {
        tableData.push(rowData);
      }
    });

    return tableData;
  } catch (error) {
    console.error("Error scraping table:", error);
    return null;
  }
}

// takes the table data and prints a visual representation in a grid
function printGrid(data) {
  const entries = data.slice(1).map(([x, char, y]) => ({
    x: parseInt(x, 10),
    y: parseInt(y, 10),
    char,
  }));

  const maxX = Math.max(...entries.map((e) => e.x));
  const maxY = Math.max(...entries.map((e) => e.y));

  const grid = Array.from({ length: maxY + 1 }, () =>
    Array.from({ length: maxX + 1 }, () => " ")
  );

  entries.forEach(({ x, y, char }) => {
    grid[y][x] = char;
  });

  grid.forEach((row) => {
    console.log(row.join(""));
  });
}

async function renderSecretMessageFromUrl(url) {
  const data = await scrapeTable(url);
  if (data) {
    printGrid(data);
  } else {
    console.error("Failed to retrieve table data.");
  }
}

renderSecretMessageFromUrl(assessmentData);
