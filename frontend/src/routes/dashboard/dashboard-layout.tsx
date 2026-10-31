import { Outlet, useLoaderData } from "react-router";
import { clientLoader } from "./dashboard.clientLoader";
import { useEffect, useState } from "react";
import { fetchLastRefresh } from "@/lib/api";
import {
  CornerGlow,
  PageBackground,
  PageContainer,
  DashboardHeader,
  DashboardFooter,
  DashboardNav,
} from "./components";
// eslint-disable-next-line react-refresh/only-export-components
export { clientLoader };

const DashboardLayout = () => {
  const { refresh: initialRefresh } = useLoaderData<typeof clientLoader>();
  const [refresh, setRefresh] = useState(initialRefresh);

  useEffect(() => {
    const interval = setInterval(async () => {
      const latest = await fetchLastRefresh();
      if (latest && latest.refreshCompletedAt !== refresh?.refreshCompletedAt) {
        setRefresh(latest);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [refresh?.refreshCompletedAt]);

  return (
    <PageBackground>
      <CornerGlow />
      <PageContainer>
        <DashboardHeader />
        <DashboardNav />
        <Outlet />
        <DashboardFooter refresh={refresh} />
      </PageContainer>
    </PageBackground>
  );
};
export default DashboardLayout;
