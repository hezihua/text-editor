import { Suspense } from "react";

import { ReaderApp } from "@/components/reader-app";

type PageProps = {
  params: Promise<{ containerId: string }>;
};

async function ReaderWithContainer({ params }: PageProps) {
  const { containerId } = await params;
  return <ReaderApp containerId={containerId} />;
}

function ReaderFallback() {
  return (
    <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
      加载中…
    </div>
  );
}

export const metadata = {
  title: "阅读器 — 笔耕",
  description: "阅读已保存的改稿文章",
};

export default function ReaderContainerPage(props: PageProps) {
  return (
    <Suspense fallback={<ReaderFallback />}>
      <ReaderWithContainer params={props.params} />
    </Suspense>
  );
}
