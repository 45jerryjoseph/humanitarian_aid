import React, { useEffect, useState, useCallback } from "react";
import { login } from "../../utils/auth";
import { Notification } from "../../components/utils/Notifications";
import Login from "./Login";
import { getProcessingCompanyByOwner } from "../../utils/warehouse";
import { Loader } from "../../components/utils";
import CompanyOverviewPage from "./CompanyOverview";
import ActivateProcessorAccount from "./ActivateProcessorAccount";

const Processor = () => {
  const [processor, setProcessor] = useState({});
  const [loading, setLoading] = useState(false);

  const isAuthenticated = window.auth.isAuthenticated;

  const fetchProcessorCompany = useCallback(async () => {
    try {
      setLoading(true);
      setProcessor(
        await getProcessingCompanyByOwner().then(async (res) => {
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

  console.log("Processor", processor);

  useEffect(() => {
    fetchProcessorCompany();
  }, []);

  return (
    <>
      <Notification />
      {isAuthenticated ? (
        !loading ? (
          processor?.name ? (
            <main>
              <CompanyOverviewPage processorCompany={processor} />
            </main>
          ) : (
            <ActivateProcessorAccount
              fetchClient={fetchProcessorCompany}
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

export default Processor;
