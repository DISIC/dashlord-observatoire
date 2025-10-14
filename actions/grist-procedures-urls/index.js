const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const urlRegex =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
const field_names = {
  id: "Dashlord_ID_JDMA",
  link: "URL_Demarche",
  jdmaStartDate: "Dashlord_JDMA_a_partir_de",
  jdmaEndDate: "Dashlord_JDMA_jusqu_a",
};

const gristUrl = "https://grist.numerique.gouv.fr";
const jdmaUrl = "https://jedonnemonavis.numerique.gouv.fr";

const repeatRequest = async (url, headers, filters, offset, records = []) => {
  return fetch(
    `${url}?${new URLSearchParams(filters).toString()}${
      offset ? `${filters ? "&" : ""}offset=${offset}` : ""
    }`,
    {
      headers,
    }
  ).then((response) => {
    return response.json().then((json) => {
      if (json.offset) {
        return repeatRequest(
          url,
          headers,
          filters,
          json.offset,
          records.concat(json.records)
        );
      } else {
        return records.concat(json.records);
      }
    });
  });
};

const getGristUrls = async (
  grist_api_key,
  jdma_api_key,
  updown_api_key,
  base_id,
  procedures_table_id,
  editions_table_id,
  edition_id = null
) => {
  let startDate = new Date(0).getTime();
  let now = new Date();
  let endDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  ).getTime();

  let response = await repeatRequest(
    `${gristUrl}/api/docs/${base_id}/tables/${editions_table_id}/records?sort=-Date_Fin_Edition&limit=1000`,
    {
      Authorization: `Bearer ${grist_api_key}`,
    }
  );

  let currentEdition;

  if (edition_id) {
    currentEdition = response.find(
      (edition) => edition.id === parseInt(edition_id)
    );
    if (!currentEdition) {
      throw new Error(`Edition with ID ${edition_id} not found`);
    }
  } else {
    currentEdition = response.find(
      (edition) =>
        edition.fields["Date_Fin_Edition"] * 1000 >= endDate &&
        edition.fields["Date_Debut_Edition"] * 1000 <= endDate
    );
  }

  if (currentEdition) {
    startDate = new Date(
      currentEdition.fields[field_names.jdmaStartDate] * 1000
    ).getTime();
    endDate = new Date(
      currentEdition.fields[field_names.jdmaEndDate] * 1000
    ).getTime();
  }

  response = await repeatRequest(
    `${gristUrl}/api/docs/${base_id}/tables/${procedures_table_id}/records`,
    {
      Authorization: `Bearer ${grist_api_key}`,
    },
    {
      limit: 1000,
      filter: JSON.stringify({ Ref_Edition: [currentEdition.id] }),
    }
  );

  await fetch(`${jdmaUrl}/api/open-api/setTop250`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jdma_api_key}`,
    },
    body: JSON.stringify({
      product_ids: response
        .map((record) => record.fields[field_names.id])
        .filter((id) => !isNaN(parseInt(id))),
    }),
  });

  const updownUrls = await fetch("https://updown.io/api/checks", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": updown_api_key,
    },
  }).then((response) => response.json());

  console.log(
    JSON.stringify(
      response
        .map((record) => {
          const jdma_id = record.fields[field_names.id];
          return {
            id: jdma_id,
            edition_id: currentEdition.id,
            link: record.fields[field_names.link]
              ? record.fields[field_names.link].replaceAll("\n", "").trim()
              : "",
            updownToken:
              updownUrls.find((item) =>
                item.alias.split(";").includes("" + jdma_id)
              )?.token || "not_found",
            startDate,
            endDate,
          };
        })
        .filter((record) => !!record.id && urlRegex.test(record.link)),
      null,
      2
    )
  );
};

module.exports = { getGristUrls };

if (require.main === module) {
  getGristUrls(
    process.argv[process.argv.length - 7],
    process.argv[process.argv.length - 6],
    process.argv[process.argv.length - 5],
    process.argv[process.argv.length - 4],
    process.argv[process.argv.length - 3],
    process.argv[process.argv.length - 2],
    process.argv[process.argv.length - 1] || null
  );
}
