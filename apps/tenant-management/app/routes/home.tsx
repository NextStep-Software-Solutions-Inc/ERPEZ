import type { Route } from "./+types/home";
import Welcome from "~/components/layout/Welcome";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ERPEZ" },
    { name: "description", content: "Welcome to ERPEZ!" },
  ];
}

export default function Home() {
  return <Welcome />;
}
