import type { NextApiRequest, NextApiResponse } from "next";
import { API_ACTIONS } from "~~/utils/scaffold-eth/common";

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;
let currentRange = 1;
const users: any = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === "POST") {
    const { address, dicePredictions, action, range } = req.body;

    try {
      if (action === API_ACTIONS.checkPrediction) {
        // Iterate over the dicePredictions array
        for (const prediction of dicePredictions) {
          // Check if the prediction value exists in the privateKey string
          if (privateKey.slice(0, currentRange).includes(prediction.value)) {
            // If it exists, set isMatch to true
            prediction.isMatch = true;
          }
        }
        const currentUserMatch = dicePredictions.filter((item: any) => item.isMatch);
        users[address] = currentUserMatch.length === dicePredictions.length;

        return res.status(200).json({ message: "success", address, dicePredictions });
      }

      if (action === API_ACTIONS.setRange) {
        currentRange = range;
        return res.status(200).json({ message: "success", currentRange });
      }

      if (action === API_ACTIONS.getRange) {
        return res.status(200).json({ message: "success", currentRange });
      }

      if (action === API_ACTIONS.getUsers) {
        return res.status(200).json({ message: "success", users });
      }
    } catch (error: any) {
      return res.status(400).json({ message: "error" });
    }
  }

  return res.status(200).json({ message: "success" });
}
