import { Outlet, useLoaderData } from "react-router";
import { clientLoader } from "./dashboard.clientLoader";
import { useEffect, useState } from "react";
import { fetchLastRefresh } from "@/lib/api";
import { PageBackground, PageContainer, DashboardHeader, DashboardFooter } from "./components";
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
      <PageContainer>
        <DashboardHeader refresh={refresh} />
        <main id="main-content" className="flex-1">
          <Outlet />
        </main>
        <DashboardFooter refresh={refresh} />
      </PageContainer>
    </PageBackground>
  );
};
export default DashboardLayout;
