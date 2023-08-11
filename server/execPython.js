import { spawn } from "child_process";

export async function executePythonScript(pythonScriptPath, args) {
  const pythonProcess = spawn("python", [pythonScriptPath, ...args], {
    stdio: "pipe",
    env: { ...process.env, PYTHONIOENCODING: "utf-8" }, // Set utf-8 encoding
  });

  let result = "";

  pythonProcess.stdout.on("data", (data) => {
    result += data.toString("utf-8"); // Specify utf-8 encoding
  });

  let errorOutput = "";

  pythonProcess.stderr.on("data", (data) => {
    errorOutput += data.toString("utf-8"); // Specify utf-8 encoding
  });

  await new Promise((resolve, reject) => {
    pythonProcess.on("close", (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        const errorMessage = `Python script exited with code ${code}\n${errorOutput}`;
        reject(new Error(errorMessage));
      }
    });
  });

  return result;
}
