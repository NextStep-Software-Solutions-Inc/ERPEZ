import { useKeycloak } from "@/providers/KeycloakProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings } from "@/components/svg";

const FooterMenu = () => {
  const { userName, firstName } = useKeycloak();
  return (
    <div className="space-y-5 flex flex-col items-center justify-center pb-6">
      <button className="w-11 h-11  mx-auto text-default-500 flex items-center justify-center  rounded-md transition-all duration-200 hover:bg-primary hover:text-primary-foreground">
        <Settings />
      </button>
      <div>
        <Avatar className="w-9 h-9">
          <AvatarFallback className="bg-primary text-primary-foreground">
            {firstName?.[0] || userName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};
export default FooterMenu;
