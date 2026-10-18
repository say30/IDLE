import { notFound, redirect } from "next/navigation";
import { ensureProfile } from "@/lib/coins";
import { features } from "@/lib/config";
import { getSession } from "@/lib/session";
import { store } from "@/lib/store";
import { studioStatus } from "@/lib/studio";
import { templateById } from "@/lib/templates";
import { Workspace } from "@/components/Workspace";

export const dynamic = "force-dynamic";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const project = await store.getProject((await params).id);
  if (!project || project.owner !== session.uid) notFound();
  const profile = await ensureProfile(session);
  const template = templateById(project.template);

  return (
    <Workspace
      initialProject={project}
      initialStudio={await studioStatus(project)}
      initialCoins={profile.coins}
      template={template}
      aiReady={features.ai}
    />
  );
}
