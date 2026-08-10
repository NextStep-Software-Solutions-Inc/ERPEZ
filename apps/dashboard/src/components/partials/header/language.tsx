import { useState } from "react";
import { Check } from "lucide-react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn } from "~/lib/utils";
import { useThemeStore } from "~/store";

const languages = [
  {
    name: "en",
    flag: "/images/all-img/flag-1.png",
  },
  {
    name: "bn",
    flag: "/images/all-img/flag-2.png",
  },
  {
    name: "ar",
    flag: "/images/all-img/flag-3.png",
  },
];
const Language = () => {
  type Language = {
    name: string;
    flag: any;
    language?: string;
  };

  const router = useNavigate();
  const pathname = useLocation().pathname;
  const { isRtl, setRtl } = useThemeStore();
  const found = pathname ? languages.find((lang) => pathname.includes(lang.name)) : null;
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(
    found ?? languages[0]
  );

  const handleSelected = (lang: string) => {
    setSelectedLanguage({
      ...selectedLanguage,
      name: lang,
      language: lang === "en" ? "En" : "Bn",
    });
    setRtl(lang === "ar");
    if (pathname) {
      router({ to: `/${lang}/${pathname.split("/")[2]}` });
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="bg-transparent hover:bg-transparent">
          <span className="w-6 h-6 rounded-full me-1.5">
            <img
              src={selectedLanguage ? selectedLanguage.flag : languages[0].flag}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
          </span>
          <span className="text-sm text-default-600 capitalize">
            {selectedLanguage ? selectedLanguage.name : "En"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-2">
        {languages.map((item, index) => (
          <DropdownMenuItem
            key={`flag-${index}`}
            className={cn(
              "py-1.5 px-2 cursor-pointer dark:hover:bg-background mb-0.5 last:mb-0",
              {
                "bg-primary-100 ":
                  selectedLanguage && selectedLanguage.name === item.name,
              }
            )}
            onClick={() => handleSelected(item.name)}
          >
            <span className="w-6 h-6 rounded-full me-1.5">
              <img
                src={item.flag}
                alt=""
                className="w-full h-full object-cover rounded-full"
              />
            </span>
            <span className="text-sm text-default-600 capitalize">
              {item.name}
            </span>
            {selectedLanguage && selectedLanguage.name === item.name && (
              <Check className="w-4 h-4 flex-none ltr:ml-auto rtl:mr-auto text-default-700" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Language;
