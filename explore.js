/* needs node8 */
const path = require("path");
const { promisify } = require("util");
const { readFile } = require("fs");
const { exec } = require("child_process");

const $readFile = promisify(readFile);
const $exec = promisify(exec);
const buildFolder = (require("./webpack.config.js")()).output.path;
const sme = require.resolve("source-map-explorer");

if (!sme) {
  console.log("No source-map-explorer found");
  process.exit();
}

$readFile("stats.json", "utf8")
  .then(data => {
    let json;

    try {
      json = JSON.parse(data);
    } catch (err) {
      throw err;
    }

    return json.assetsByChunkName;
  })
  .then(chunks => {
    const pairs = [];

    for (const [k, v] of Object.entries(chunks)) {
      // multiple chunks may emit to the same sourcemap
      const assets = new Set(v);
      let mapFile;
      let sourceFile;

      assets.forEach(elem => {
        if (elem.endsWith(".map")) return mapFile = elem;
        if (elem.endsWith(".js")) return sourceFile = elem;
      });
      mapFile && sourceFile && pairs.push({ mapFile, sourceFile });
    }
    return pairs;
  })
  .then(arr => {
    const promises = arr.map(elem => $exec(`node ${sme} ${buildFolder}${path.sep}${elem.sourceFile} ${buildFolder}${path.sep}${elem.mapFile}`));
    return Promise.all(promises);
  })
  .catch(console.error);
