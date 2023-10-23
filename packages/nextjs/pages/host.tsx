import { useEffect, useState } from "react";
import axios from "axios";
import type { NextPage } from "next";
import { useInterval, useLocalStorage } from "usehooks-ts";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";
import { API_ACTIONS } from "~~/utils/scaffold-eth/common";

const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY as string;
const hostSecret = process.env.NEXT_PUBLIC_HOST_SECRET as string;

const Host: NextPage = () => {
  // const { address } = useAccount();

  const [range, setRange] = useState<number>(1);
  const [users, setUsers] = useState<any>({});
  const [localStorageHostSecret, setLocalStorageHostSecret] = useState<any>(null);

  const [hasHostSecret, setHostSecret] = useLocalStorage("hostSecret", localStorageHostSecret);

  useInterval(() => {
    getUsers();
  }, 1000);

  const getUsers = async () => {
    try {
      const res = await axios.post(`http://${window.location.host}/api/data`, {
        action: API_ACTIONS.getUsers,
      });
      setUsers(res.data.users);
    } catch (error) {}
  };

  const onSetRange = async () => {
    console.log(`n-🔴 => onSetRange => process.env.NEXT_PUBLIC_API:`, process.env.NEXT_PUBLIC_API);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/data`, {
        action: API_ACTIONS.setRange,
        range,
      });

      notification.success(<div>Range updated</div>, {
        icon: "🎉",
      });
    } catch (error) {}
  };

  useEffect(() => {
    const localStorageHostSecret = localStorage.getItem("hostSecret");
    setLocalStorageHostSecret(localStorageHostSecret);
  }, []);

  return (
    <>
      <MetaHeader />

      {hasHostSecret !== hostSecret && (
        <div className="flex items-center flex-col flex-grow pt-10">
          <input
            type="text"
            placeholder="Enter host password"
            className="input w-full max-w-xs"
            onChange={event => {
              setHostSecret(event.target.value);
            }}
          />
        </div>
      )}
      {hasHostSecret === hostSecret && (
        <div className="flex items-center flex-col flex-grow pt-10">
          <div className="flex flex-col justify-center items-center">
            <div>Private key</div>
            <Address disableAddressLink address={privateKey} />
          </div>
          <input
            type="range"
            min={1}
            max={`${privateKey.length}`}
            value={range}
            className="range range-primary range-xs w-[90%]"
            onChange={event => {
              setRange(+event.target.value);
            }}
          />
          <div className="flex m-2">
            <div className="badge badge-primary">Range {range}</div>
          </div>

          {/* <div className="text text-primary text-xl whitespace-pre-wrap max-w-xs">{privateKey.slice(0, range)}</div> */}
          <div className="mockup-code">
            {range >= 0 && (
              <pre data-prefix="~">
                <code>{privateKey.slice(0, range <= 22 ? range : 22)}</code>
              </pre>
            )}

            {range >= 22 && (
              <pre data-prefix="~">
                <code>{privateKey.slice(22, range > 22 && range <= 44 ? range : 44)}</code>
              </pre>
            )}

            {range >= 44 && (
              <pre data-prefix="~">
                <code>{privateKey.slice(44, range)}</code>
              </pre>
            )}
          </div>
          <div className="m-2">
            <button className="btn btn-primary btn-xs" onClick={onSetRange}>
              Set
            </button>
          </div>

          <div>
            <div className="badge badge-primary">Users</div>
            {Object.keys(users).length > 0 &&
              Object.keys(users).map((address, index) => {
                return (
                  <div className="flex " key={index + address}>
                    <Address address={address} />
                    {users[address] && <div className="text text-success mx-2">Winner</div>}
                    {!users[address] && <div className="text  mx-2">No luck</div>}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </>
  );
};

export default Host;
