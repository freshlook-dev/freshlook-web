import { Suspense } from "react";
import BookPageClient from "./BookPageClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookPageClient />
    </Suspense>
  );
}