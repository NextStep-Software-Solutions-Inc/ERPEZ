import DashboardPageView from "./page-view";
import { getDictionary } from "@/app/dictionaries";

interface DashboardProps {
  params: Promise<{
    lang: any;
  }>;
}
const Dashboard = async ({ params }: DashboardProps) => {
  const { lang } = await params;
  const trans = await getDictionary(lang);
  return <DashboardPageView trans={trans} />;
};

export default Dashboard;
