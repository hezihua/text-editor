import { Suspense } from "react";

import { ReaderArticlePageClient } from "@/components/reader-article-page-client";

type PageProps = {
  params: Promise<{ articleId: string }>;
};

async function ReaderArticleWithParams({ params }: PageProps) {
  const { articleId } = await params;
  return <ReaderArticlePageClient articleId={articleId} />;
}

function ReaderArticleFallback() {
  return (
    <div className="flex h-dvh items-center justify-center text-sm text-stone-500">
      加载中…
    </div>
  );
}

export default function ReaderArticlePage(props: PageProps) {
  return (
    <Suspense fallback={<ReaderArticleFallback />}>
      <ReaderArticleWithParams params={props.params} />
    </Suspense>
  );
}
