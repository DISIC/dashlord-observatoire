const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const monthes = {
  janvier: 0,
  février: 1,
  mars: 2,
  avril: 3,
  mai: 4,
  juin: 5,
  juillet: 6,
  août: 7,
  septembre: 8,
  octobre: 9,
  novembre: 10,
  décembre: 11,
};

const formattedDatesRegex = /(?:\s|^)(\d{2}[/-]\d{2}[/-]\d{4})(?=\W|$)/g;
const plainDatesRegex =
  /\s(?:(?:(0?[1-9]|[12]\d|3[01]))\s)?(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)\s(\d{4})\b/g;
const percentagesRegex = /\d+(?:[,.]\d+)?\s*%/g;

const formatDateFromTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1; // Months start at 0!
  let dd = date.getDate();

  if (dd < 10) dd = "0" + dd;
  if (mm < 10) mm = "0" + mm;

  return dd + "/" + mm + "/" + yyyy;
};

const getMaxDateFromMatches = (matches) => {
  const timestamps = matches.reduce((acc, date) => {
    const splittedSlash = date.trim().split("/");
    const splittedSpace = date.trim().split(" ");
    if (splittedSlash.length === 3) {
      acc.push(
        new Date(splittedSlash[2], splittedSlash[1] - 1, splittedSlash[0])
      );
    } else if (splittedSpace.length >= 2) {
      if (splittedSpace.length === 2) {
        acc.push(
          new Date(
            splittedSpace[1],
            monthes[splittedSpace[0].toLowerCase()],
            1
          ).getTime()
        );
      } else if (splittedSpace.length === 3) {
        acc.push(
          new Date(
            splittedSpace[2],
            monthes[splittedSpace[1].toLowerCase()],
            splittedSpace[0]
          ).getTime()
        );
      }
    }

    return acc;
  }, []);

  return timestamps.length
    ? formatDateFromTimestamp(
        timestamps.reduce((acc, t) => {
          if (t > acc) return t;
          return acc;
        }, 0)
      )
    : "";
};

const analyseDom = async (dom) => {
  const walker = dom.window.document.createTreeWalker(
    dom.window.document.body,
    4
  );

  // loop through all text nodes and concatenate their contents
  let text = "";
  while (walker.nextNode()) {
    const node = walker.currentNode;
    // ignore text within <script> tags
    if (!node.parentNode || node.parentNode.tagName === "SCRIPT") {
      continue;
    }
    text += node.textContent;
  }

  const percentages = [];
  while ((matches = percentagesRegex.exec(text))) {
    if (matches[0]) percentages.push(matches[0]);
  }

  const dates = [];
  while ((matches = formattedDatesRegex.exec(text))) {
    if (matches[0]) dates.push(matches[0]);
  }
  while ((matches = plainDatesRegex.exec(text))) {
    if (matches[0]) dates.push(matches[0]);
  }

  const tauxRgaa = Math.min(
    ...percentages.map((p) =>
      parseFloat(p.replace(",", ".").substring(0, p.length - 1))
    )
  );

  const dateRgaa = getMaxDateFromMatches(dates);

  return {
    taux: tauxRgaa !== Infinity ? tauxRgaa : null,
    date: dateRgaa || null,
  };
};

const analyseFile = async (filePath, { url } = {}) => {
  const dom = await JSDOM.fromFile(filePath);
  return analyseDom(dom, { url });
};

// warn: this wont work for SPA applications
const analyseUrl = async (url) => {
  const dom = await JSDOM.fromURL(url);
  return analyseDom(dom, { url });
};

module.exports = { analyseFile, analyseUrl };

if (require.main === module) {
  const filePath = process.argv[process.argv.length - 1]; // file path to analyse
  analyseFile(filePath)
    .then((result) => console.log(JSON.stringify(result)))
    .catch(() => console.log(JSON.stringify({ taux: null })));
}
