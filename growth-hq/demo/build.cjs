// Builds demo/growth-hq-demo.html: the interactive demo with the app's real catalogue inside.
const { execFileSync } = require("child_process"), fs = require("fs"), path = require("path");
const json = execFileSync("node", [path.join(__dirname, "export-catalog.cjs")]).toString().replace(/<\//g, "<\\/");
const tpl = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
fs.writeFileSync(path.join(__dirname, "growth-hq-demo.html"), tpl.replace("/*CATALOG*/null", json));
console.log("built", (fs.statSync(path.join(__dirname, "growth-hq-demo.html")).size / 1024).toFixed(0) + " KB");
