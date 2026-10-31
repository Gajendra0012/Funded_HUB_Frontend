import { notFound } from "next/navigation";
import { ComponentGallery } from "@/components/component-gallery";
import { dashboard, gallery } from "@/mocks/admin";
export default function Page(){if(process.env.NODE_ENV!=="development") notFound();return <ComponentGallery data={dashboard} fixtures={gallery}/>;}
