import { LandingPage } from "@/components/LandingPage";
import { metadataForPage, pages } from "@/lib/pages";

export const metadata = metadataForPage(pages.signature);

export default function Page() {
  return <LandingPage page={pages.signature} />;
}
