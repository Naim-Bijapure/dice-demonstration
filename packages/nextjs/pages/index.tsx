import { useEffect, useRef, useState } from "react";
import axios from "axios";
import type { NextPage } from "next";
import { useInterval } from "usehooks-ts";
import { Address as AddressType } from "viem";
import { useAccount } from "wagmi";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { MetaHeader } from "~~/components/MetaHeader";
import { API_ACTIONS } from "~~/utils/scaffold-eth/common";

export type Roll = {
  address: AddressType;
  amount: number;
  roll: string;
};
function getRandomHexDigit() {
  const array = new Uint8Array(1);
  window.crypto.getRandomValues(array);
  const randomValue = array[0] % 16;
  let hexDigit = randomValue.toString(16);

  // If the hex digit is an alphabet character, convert it to uppercase
  if (/[a-f]/.test(hexDigit)) {
    hexDigit = hexDigit.toUpperCase();
  }

  return hexDigit;
}
const generateDiceArray = (number: number) => Array.from({ length: number + 1 }, (_, index) => index);
const MODE = {
  manual: "MANUAL",
  auto: "auto",
};
const ITEMS_PER_PAGE = 10;

const Home: NextPage = () => {
  const { address } = useAccount();
  // const [rolls, setRolls] = useState<any[]>([{ roll: "F" }]);
  const [diceCount, setDiceCount] = useState<number>(4);
  const [dicePredictions, setDicePredictions] = useState<{ no: number; value: number; isMatch: boolean }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [rolled, setRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [mode, setMode] = useState(MODE.manual);

  useInterval(() => {
    getRange();
  }, 1000);

  // on auto mode
  useInterval(() => {
    if (mode === MODE.auto) {
      RollDice();
    }
  }, 5000);

  useEffect(() => {
    if (address) {
      getRange();
    }
  }, [address]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = dicePredictions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  const currentItems = dicePredictions.slice(startIndex, endIndex);

  const handlePageChange = (page: any) => {
    setCurrentPage(page);
  };

  const getRange = async () => {
    const res = await axios.post(`${window.location.href}api/data`, {
      action: API_ACTIONS.getRange,
    });

    setDiceCount(res.data.currentRange - 1);
  };

  const RollDice = async () => {
    // await getRange();
    setIsRolling(true);
    const dices = generateDiceArray(diceCount);
    const dicePredictions: any = [];
    let index = 0;
    for (const diceNo of dices) {
      const randomDigit = getRandomHexDigit();
      dicePredictions.push({ diceNo, no: index, value: randomDigit, isMatch: false });
      index++;
    }

    const res = await axios.post(`${window.location.href}api/data`, {
      action: API_ACTIONS.checkPrediction,
      address,
      dicePredictions,
    });

    setDicePredictions(res.data.dicePredictions);
    setRolled(true);
    setIsRolling(false);
    index = 0;
  };

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div>Guess {diceCount + 1} digits</div>
        <div className="flex">
          <div className="form-control ">
            <label className="label cursor-pointer">
              <span className="label-text mx-2">Manual</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-red-500"
                checked={MODE.manual === mode}
                onClick={() => {
                  setMode(MODE.manual);
                }}
              />
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text mx-2">Auto</span>
              <input
                type="radio"
                name="radio-10"
                className="radio checked:bg-blue-500"
                checked={MODE.auto === mode}
                onClick={() => {
                  setMode(MODE.auto);
                }}
              />
            </label>
          </div>
        </div>

        {MODE.manual === mode && (
          <div>
            <button className="btn btn-primary btn-xs tooltip" onClick={RollDice} data-tip="Roll the dice">
              <ArrowPathIcon className="h-4 w-4 mr-0.5" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 m-2 xl:grid xl:grid-cols-4">
          {/* {generateDiceArray(diceCount).map((diceNo, index) => { */}
          {currentItems.map((dice, index) => {
            return (
              <div key={dice.value + index}>
                <div
                  className={`flex flex-col items-center rounded-md border-2 p-1 ${
                    dice.isMatch ? "bg-green-100" : "bg-orange-100"
                  }`}
                >
                  <div className="text-xl ml-auto">
                    {/* {dicePredictions[index]?.isMatch ? ( */}
                    {/* {dice?.isMatch ? (
                      <CheckCircleIcon className="h-4- w-4- mr-0.5 text-green-600 z-50" height={30} />
                    ) : (
                      <XCircleIcon className="h-4- w-4- mr-0.5- text-red-500" height={30} />
                    )} */}
                  </div>
                  {rolled ? (
                    isRolling ? (
                      <video
                        key="rolling"
                        width={300}
                        className="rounded-full border-2 "
                        height={300}
                        loop
                        src="/rolls/Spin.webm"
                        autoPlay
                      />
                    ) : (
                      <video
                        className="rounded-full border-2 "
                        key="rolled"
                        width={300}
                        height={300}
                        // src={`/rolls/${dicePredictions[index]?.value || "0"}.webm`}
                        src={`/rolls/${dice?.value || "0"}.webm`}
                        autoPlay
                      />
                    )
                  ) : (
                    <video
                      className="rounded-full border-2 "
                      ref={videoRef}
                      key="last"
                      width={300}
                      height={300}
                      src={`/rolls/${dice?.value || "0"}.webm`}
                    />
                  )}

                  <div className="text-xs">{dice.no + 1}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <div className="join">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={currentPage === index + 1 ? "join-item btn btn-xs btn-active" : "join-item btn btn-xs"}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
