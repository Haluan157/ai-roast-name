const express = require("express")
const app = express()
const path = require("path")
const minifyHTML = require("express-minify-html")
const { GoogleGenerativeAI } = require("@google/generative-ai");
const DOMPurify = require("dompurify")
const marked = require("marked")
const { JSDOM } = require("jsdom")
const wind = new JSDOM("").window
const puri = DOMPurify(wind)

const genAI = new GoogleGenerativeAI(process.env.API_AI);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: process.env.SYSTEM_INST});

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(minifyHTML({
    override: true,
    exception_url: false,
    htmlMinifier: {
        removeComments: true,
        collapseWhitespace: true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes: true,
        removeEmptyAttributes: true,
        minifyJS: true,
        minifyCSS: true
    }
}))

app.get("/", (req, res) => {
  res.render("index", {
    response: "Belum ada"
  })
})

app.post("/", async (req, res) => {
  const { name } = req.body
  let response = name
  try {
    const result = await model.generateContent(name);
    response = result.response.text();
  } catch {
    response = "Token habis 😅😅"
  }
  
  const htm = marked.parse(response)
  
  res.render("index", {
    response: puri.sanitize(htm)
  })
})

app.listen(process.env.PORT || 3000)

module.exports = app
