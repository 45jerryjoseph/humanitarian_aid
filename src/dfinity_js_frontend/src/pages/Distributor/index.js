import React, { useEffect, useState, useCallback } from "react";
import { login } from "../../utils/auth";
import { Notification } from "../../components/utils/Notifications";
import Login from "./Login";
import { getDistributorCompanyByOwner } from "../../utils/distributorsCompany";
import { Loader } from "../../components/utils";
import CompanyOverviewPage from "./CompanyOverview";
import ActivateDistributorAccount from "./ActivateDistributorAccount";

const Distributor = () => {
  const [distributor, setDistributor] = useState({});
  const [loading, setLoading] = useState(false);

  const isAuthenticated = window.auth.isAuthenticated;

  const fetchDistributor = useCallback(async () => {
    try {
      setLoading(true);
      setDistributor(
        await getDistributorCompanyByOwner().then(async (res) => {
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

  console.log("Distributor", distributor);

  useEffect(() => {
    fetchDistributor();
  }, []);

  return (
    <>
      <Notification />
      {isAuthenticated ? (
        !loading ? (
          distributor?.name ? (
            <main>
              <CompanyOverviewPage distributor={distributor} />
            </main>
          ) : (
            <ActivateDistributorAccount fetchDistributor={fetchDistributor} />
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

export default Distributor;
