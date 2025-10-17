const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const encodeQueryParams = (params) => {
  return Object.keys(params)
    .map((key) => {
      const value = params[key];
      return (
        encodeURIComponent(key) +
        "=" +
        encodeURIComponent(
          typeof value === "object" ? JSON.stringify(value) : value
        )
      );
    })
    .join("&");
};

const getJdmaData = (id, startDate, endDate, fromLastThreeMonth) => {
  let params;

  if (JSON.parse(fromLastThreeMonth)) {
    let endDate3Month = new Date();

    if (endDate3Month.getTime() > new Date(parseInt(endDate)).getTime()) {
      endDate3Month = new Date(parseInt(endDate));
    }

    const threeMonthAgo = new Date(endDate3Month);
    threeMonthAgo.setMonth(endDate3Month.getMonth() - 3);
    threeMonthAgo.setHours(0, 0, 0, 0);

    endDate3Month.setHours(23, 59, 59, 999);

    params = {
      input: {
        json: {
          product_id: parseInt(id),
          start_date: threeMonthAgo.getTime().toString(),
          end_date: endDate3Month.getTime().toString(),
        },
      },
    };
  } else {
    const startDateObj = new Date(parseInt(startDate));
    startDateObj.setHours(0, 0, 0, 0);

    const endDateObj = new Date(parseInt(endDate));
    endDateObj.setHours(23, 59, 59, 999);

    params = {
      input: {
        json: {
          product_id: parseInt(id),
          start_date: startDateObj.getTime().toString(),
          end_date: endDateObj.getTime().toString(),
        },
      },
    };
  }

  const url = `https://jedonnemonavis.numerique.gouv.fr/api/trpc/answer.getObservatoireStats?${encodeQueryParams(
    params
  )}`;

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => {
    response.json().then((json) => {
      const data = json.result?.data?.json;

      if (data) {
        console.log(JSON.stringify(data));
      }
    });
  });
};

module.exports = { getJdmaData };

if (require.main === module) {
  getJdmaData(
    process.argv[process.argv.length - 4],
    process.argv[process.argv.length - 3],
    process.argv[process.argv.length - 2],
    process.argv[process.argv.length - 1]
  );
}
