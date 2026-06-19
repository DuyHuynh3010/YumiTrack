import { SessionDetailView } from "@/components/SessionDetailView";

type SessionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;

  return <SessionDetailView sessionId={id} />;
}
