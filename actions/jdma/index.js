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
    const threeMonthAgo = new Date(
      new Date().setMonth(new Date().getMonth() - 3)
    ).getTime();
    const newStartDate =
      threeMonthAgo > parseInt(startDate) ? threeMonthAgo : parseInt(startDate);
    const newEndDate =
      new Date().getTime() < parseInt(endDate)
        ? new Date().getTime()
        : parseInt(endDate);

    params = {
      input: {
        json: {
          product_id: parseInt(id),
          start_date: newStartDate.toString(),
          end_date: newEndDate.toString(),
        },
      },
    };
  } else {
    params = {
      input: {
        json: {
          product_id: parseInt(id),
          start_date: startDate,
          end_date: endDate,
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
