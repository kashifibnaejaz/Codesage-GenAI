"use server";

import axios from "axios";

export async function compileCode(requestData: any) {
  const endpoint = "https://emkc.org/api/v2/piston/execute";
 // const response = await axios.post(endpoint, requestData);
  try {
    const response = await axios.post(endpoint, requestData);
    console.log("Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    return error;
  }
}
/*

"use server";

import axios from "axios";

export async function compileCode(requestData: any) {
  const endpoint = "https://emkc.org/api/v2/piston/execute";

  try {
    const response = await axios.post(endpoint, requestData);
    console.log("Response:", response.data);
    if (response.data.run.status.code == 0) {
      // Assuming a non-zero status code indicates an error
      throw new Error(response.data.run.stderr || "An error occurred during execution");
    }
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
*/
