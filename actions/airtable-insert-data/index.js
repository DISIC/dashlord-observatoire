const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const field_names = {
  id: "🕶 ID",
  edition: "📡 Édition",
  a11y: "[Dashlord] - Mention accessibilité",
  a11yLink: "[Dashlord] - Lien de la déclaration d'accessibilité",
  rgaaTaux: "[Dashlord] - Taux RGAA",
};

const insertAirtableData = async (
  id,
  api_key,
  base_id,
  procedures_table_name,
  a11y_json,
  rgaa_json
) => {
  const body = { fields: {} };

  // A11Y
  const a11y = JSON.parse(JSON.parse(a11y_json).toString());
  body.fields[field_names.a11y] = a11y.mention
    ? a11y.mention
    : "Aucune mention";
  body.fields[field_names.a11yLink] = a11y.declarationUrl
    ? a11y.declarationUrl
    : "";

  //RGAA
  const rgaa = JSON.parse(JSON.parse(rgaa_json).toString());
  body.fields[field_names.rgaaTaux] = rgaa.taux ? rgaa.taux + "%" : "";

  console.log("body a11y mention : ", body.fields[field_names.a11y]);
  console.log("body a11y link : ", body.fields[field_names.a11yLink]);
  console.log("body rgaa taux : ", body.fields[field_names.rgaaTaux]);

  let response = await fetch(
    `https://api.airtable.com/v0/${base_id}/${procedures_table_name}?${new URLSearchParams(
      {
        filterByFormula: `AND({${field_names.id}} = "${id}", FIND('Édition actuelle', ARRAYJOIN({${field_names.edition}})))`,
      }
    ).toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${api_key}`,
        "Content-Type": "application/json",
      },
    }
  );
  const json = await response.json();

  const record = json.records[0];

  if (record) {
    await fetch(
      `https://api.airtable.com/v0/${base_id}/${procedures_table_name}/${record.id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
  }
};

module.exports = { insertAirtableData };

if (require.main === module) {
  insertAirtableData(
    process.argv[process.argv.length - 6],
    process.argv[process.argv.length - 5],
    process.argv[process.argv.length - 4],
    process.argv[process.argv.length - 3],
    process.argv[process.argv.length - 2],
    process.argv[process.argv.length - 1]
  );
}
