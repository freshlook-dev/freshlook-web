"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessClient() {
  const searchParams = useSearchParams();

  const name = searchParams.get("name");

  return (
    <div>
      <h1>Booking Confirmed</h1>
      <p>Thank you {name}</p>
    </div>
  );
}
