import { getDictionary } from "@/app/dictionaries";
import ProjectPageView from "./page-view";

interface DashboardProps {
  params: Promise<{
    lang: any;
  }>;
}

const ProjectPage = async ({ params }: DashboardProps) => {
  const { lang } = await params;
  const trans = await getDictionary(lang);
  return <ProjectPageView trans={trans} />;
};

export default ProjectPage;
