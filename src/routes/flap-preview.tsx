import { createFileRoute } from "@tanstack/react-router";
import { FlapMiniApp } from "@/flap/FlapMiniApp";
export const Route = createFileRoute("/flap-preview")({ component: () => <FlapMiniApp /> });
