const axios = require("axios");
const { consoleTags } = require("../../utils/main/mainUtils");

export async function scan(url) {
  let virus = false;
  let result = "";

  try {
    const encodedUrl = encodeURI(url);
    const apiUrl = `https://www.virustotal.com/vtapi/v2/url/report?apikey=${process.env.VIRUSTOTAL_API_KEY}&resource=${encodedUrl}`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    if (data.verbose_msg == "Resource does not exist in the dataset") {
      result = "No scan results found for this website.";
    } else {
      const scanDate = new Date(data.scan_date);
      const formattedScanDate = `<t:${Math.floor(
        scanDate.getTime() / 1000
      )}:F>`;

      let scanResult;
      if (data.positives > 0) {
        scanResult = "This website is not safe!";
        virus = true;
      } else scanResult = "This website is safe to use.";

      result = `### ${scanResult}
              > 🔗 Checked URL: <${url}>
              > 📄 Positive Scans: \`${data.positives}/${data.total}\`
              > 📅 Scan Date: ${formattedScanDate}
              > *Click [here](<${data.permalink}>) for more details.*`;
    }
  } catch (error) {
    result = "error";

    console.error(`${consoleTags.error} While scaning a url: `, error);
  }

  return { virus, result };
}
