import React, { useEffect, useState, useCallback } from "react";
import { login } from "../../utils/auth";
import { Notification } from "../../components/utils/Notifications";
import Login from "./Login";
import { Loader } from "../../components/utils";
import CompanyOverviewPage from "./CompanyOverview";
import { getFarmerByOwner } from "../../utils/farmer";
import ActivateFarmerAccount from "./ActivateFarmerAccount";

const Client = () => {
  const [farmer, setFarmer] = useState({});
  const [loading, setLoading] = useState(false);

  const isAuthenticated = window.auth.isAuthenticated;

  const fetchFarmer = useCallback(async () => {
    try {
      setLoading(true);
      setFarmer(
        await getFarmerByOwner().then(async (res) => {
          console.log(res);
          return res.Ok;
        })
      );
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  });

  console.log("farmer", farmer);

  useEffect(() => {
    fetchFarmer();
  }, []);

  return (
    <>
      <Notification />
      {isAuthenticated ? (
        !loading ? (
          farmer?.fullName ? (
            <main>
              <CompanyOverviewPage farmer={farmer} />
            </main>
          ) : (
            <ActivateFarmerAccount
              fetchFarmer={fetchFarmer}
            />
          )
        ) : (
          <Loader />
        )
      ) : (
        <Login login={login} />
      )}
    </>
  );
};

export default Client;
