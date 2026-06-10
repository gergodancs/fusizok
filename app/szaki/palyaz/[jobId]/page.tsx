import { redirect } from "next/navigation";

type PalyazRedirectProps = {
  params: Promise<{ jobId: string }>;
};

/** Régi útvonal – átirányítás a publikus hirdetés oldalra. */
export default async function PalyazRedirectPage({ params }: PalyazRedirectProps) {
  const { jobId } = await params;
  redirect(`/hirdetes/${jobId}`);
}
