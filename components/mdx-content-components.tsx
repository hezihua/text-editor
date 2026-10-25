import type { ComponentPropsWithoutRef } from "react";

/** 阅读器 MDX 自定义组件（RSC 与 Client 共用） */
export const mdxContentComponents = {
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="table-wrap">
      <table {...props} />
    </div>
  ),
};
