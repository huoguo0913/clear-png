import { LandingPage } from "@/components/LandingPage";
import { metadataForPage, pages } from "@/lib/pages";

export const metadata = metadataForPage(pages.product);

export default function Page() {
  return <LandingPage page={pages.product} />;
}
