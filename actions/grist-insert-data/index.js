const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const field_names = {
  noMaj: "MaJ_Manuelle_Satisfaction",
  jdmaSatisfactionCount: "Dashlord_Satisfaction_12_mois_Nb_Avis",
  jdmaSatisfactionCount3M: "Dashlord_Satisfaction_3_mois_Nb_Avis",
  jdmaSatisfactionMark: "Dashlord_Satisfaction_12_mois_Note",
  jdmaSatisfactionMark3M: "Dashlord_Satisfaction_3_mois_Note",
  jdmaComprehensionCount: "Dashlord_Clarte_Nb_Avis",
  jdmaComprehensionMark: "Dashlord_Clarte_Note",
  jdmaAutonomyCount: "Dashlord_Autonomie_Nb_Avis",
  jdmaAutonomyMark: "Dashlord_Autonomie_Note",
  jdmaContactReachabilityCount: "Dashlord_Aide_Joignable_Nb_Avis",
  jdmaContactReachabilityMark: "Dashlord_Aide_Joignable_Note",
  jdmaContactSatisfactionCount: "Dashlord_Aide_Efficace_Nb_Avis",
  jdmaContactSatisfactionMark: "Dashlord_Aide_Efficace_Note",
  updownUptime: "Dashlord_UpDown_Dispo",
  updownResponseTime: "Dashlord_UpDown_Tps_Moy_Chargement",
};

const insertGristData = async (
  id,
  edition_id,
  api_key,
  base_id,
  procedures_table_id,
  a11y_json,
  rgaa_json,
  jdma_json,
  jdma_3months_json,
  updown_json
) => {
  const body = { fields: {} };
  const jdma = JSON.parse(JSON.parse(jdma_json).toString());
  const jdma_3months = JSON.parse(JSON.parse(jdma_3months_json).toString());
  const updown = JSON.parse(JSON.parse(updown_json).toString());

  if (
    !jdma.data ||
    !jdma.metadata ||
    !jdma_3months.data ||
    !jdma_3months.metadata
  ) {
    process.exit();
  }

  // jdma satisfaction
  if (
    jdma.data.satisfaction !== undefined &&
    jdma.metadata.satisfaction_count !== undefined
  ) {
    body.fields[field_names.jdmaSatisfactionCount] =
      jdma.metadata.satisfaction_count;
    if (jdma.metadata.satisfaction_count > 0) {
      body.fields[field_names.jdmaSatisfactionMark] = jdma.data.satisfaction;
    }
  }

  // 3 months jdma satisfaction
  if (
    jdma_3months.data.satisfaction !== undefined &&
    jdma_3months.metadata.satisfaction_count !== undefined
  ) {
    body.fields[field_names.jdmaSatisfactionCount3M] =
      jdma_3months.metadata.satisfaction_count;
    if (jdma_3months.metadata.satisfaction_count > 0) {
      body.fields[field_names.jdmaSatisfactionMark3M] =
        jdma_3months.data.satisfaction;
    } else {
      body.fields[field_names.jdmaSatisfactionMark3M] = null;
    }
  }

  // jdma comprehension
  if (
    jdma.data.satisfaction !== undefined &&
    jdma.metadata.satisfaction_count !== undefined
  ) {
    body.fields[field_names.jdmaComprehensionCount] =
      jdma.metadata.comprehension_count;
    if (jdma.metadata.comprehension_count > 0) {
      body.fields[field_names.jdmaComprehensionMark] = jdma.data.comprehension;
    }
  }

  // jdma autonomy
  if (
    jdma.data.autonomy !== undefined &&
    jdma.metadata.autonomy_count !== undefined
  ) {
    body.fields[field_names.jdmaAutonomyCount] = jdma.metadata.autonomy_count;
    if (jdma.metadata.autonomy_count > 0) {
      body.fields[field_names.jdmaAutonomyMark] = jdma.data.autonomy;
    }
  }

  // jdma help reachable
  if (jdma.data.contact_reachability !== undefined) {
    body.fields[field_names.jdmaContactReachabilityCount] =
      jdma.metadata.contactReachability_count;
    if (jdma.metadata.contactReachability_count > 0) {
      body.fields[field_names.jdmaContactReachabilityMark] =
        jdma.data.contact_reachability;
    }
  }

  // jdma help efficient
  if (jdma.data.contact_satisfaction !== undefined) {
    body.fields[field_names.jdmaContactSatisfactionCount] =
      jdma.metadata.contactSatisfaction_count;
    if (jdma.metadata.contactSatisfaction_count > 0) {
      body.fields[field_names.jdmaContactSatisfactionMark] =
        jdma.data.contact_satisfaction;
    }
  }

  // updown uptime
  if (updown.uptime !== undefined) {
    body.fields[field_names.updownUptime] = updown.uptime / 100;
  }

  // updown response time
  if (updown.timings !== undefined && updown.timings.response !== undefined) {
    body.fields[field_names.updownResponseTime] = updown.timings.response;
  }

  console.log(
    "body jdma satisfaction count : ",
    body.fields[field_names.jdmaSatisfactionCount]
  );
  console.log(
    "body jdma satisfaction mark : ",
    body.fields[field_names.jdmaSatisfactionMark]
  );
  console.log(
    "body jdma satisfaction count 3 months : ",
    body.fields[field_names.jdmaSatisfactionCount3M]
  );
  console.log(
    "body jdma satisfaction mark 3 months : ",
    body.fields[field_names.jdmaSatisfactionMark3M]
  );
  console.log(
    "body jdma comprehension count : ",
    body.fields[field_names.jdmaComprehensionCount]
  );
  console.log(
    "body jdma comprehension mark : ",
    body.fields[field_names.jdmaComprehensionMark]
  );
  console.log(
    "body jdma autonomy count : ",
    body.fields[field_names.jdmaAutonomyCount]
  );
  console.log(
    "body jdma autonomy mark : ",
    body.fields[field_names.jdmaAutonomyMark]
  );
  console.log(
    "body jdma contact reachability mark : ",
    body.fields[field_names.jdmaContactReachabilityMark]
  );
  console.log(
    "body jdma contact satisfaction mark : ",
    body.fields[field_names.jdmaContactSatisfactionMark]
  );
  console.log("body updown uptime : ", body.fields[field_names.updownUptime]);
  console.log(
    "body updown response time : ",
    body.fields[field_names.updownResponseTime]
  );

  response = await fetch(
    `https://grist.numerique.gouv.fr/api/docs/${base_id}/tables/${procedures_table_id}/records?filter=%7B"Dashlord_ID_JDMA"%3A%20%5B${id}%5D%2C%20"Ref_Edition"%3A%20%5B${edition_id}%5D%7D`,
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
    if (!record.fields[field_names.noMaj]) {
      console.log("body", JSON.stringify(body));
      const patchDemarche = await fetch(
        `https://grist.numerique.gouv.fr/api/docs/${base_id}/tables/${procedures_table_id}/records`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                id: record.id,
                fields: { ...body.fields },
              },
            ],
          }),
        }
      );
      console.log(patchDemarche);
    } else {
      console.log(`case "${field_names.noMaj}" cochée, mise à jour updown...`);
      const patchDemarche = await fetch(
        `https://grist.numerique.gouv.fr/api/docs/${base_id}/tables/${procedures_table_id}/records`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${api_key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            records: [
              {
                id: record.id,
                fields: {
                  [field_names.updownResponseTime]:
                    body.fields[field_names.updownResponseTime],
                  [field_names.updownUptime]:
                    body.fields[field_names.updownUptime],
                },
              },
            ],
          }),
        }
      );
      console.log(patchDemarche);
    }
  }
};

module.exports = { insertGristData };

if (require.main === module) {
  insertGristData(
    process.argv[process.argv.length - 10],
    process.argv[process.argv.length - 9],
    process.argv[process.argv.length - 8],
    process.argv[process.argv.length - 7],
    process.argv[process.argv.length - 6],
    process.argv[process.argv.length - 5],
    process.argv[process.argv.length - 4],
    process.argv[process.argv.length - 3],
    process.argv[process.argv.length - 2],
    process.argv[process.argv.length - 1]
  );
}
