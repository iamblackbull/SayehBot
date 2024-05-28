export async function getPing(host) {
  const { exec } = require("child_process");

  return new Promise((resolve, reject) => {
    exec(`ping -c 4 ${host}`, (error, stdout) => {
      if (error) {
        if (error.code == 1) {
          console.error("Connection to host failed while pinging.");

          resolve(1);
        } else if (error.code == 2) {
          console.error("Unable to retrieve ip while pinging.");

          resolve(2);
        } else {
          console.error("Unknown error while pinging: ", error);

          reject(error);
        }
        return;
      }

      resolve(stdout);
    });
  });
}