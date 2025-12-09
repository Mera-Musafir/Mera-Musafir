"use client";
import { useParams } from "next/navigation";
import TripDetailPage from "@/app/components/TripDetailPage";

export default function TripDetail() {
  const params = useParams();
  const tripId = params.id;

  return <TripDetailPage tripId={parseInt(tripId as string)} onBack={() => window.history.back()} />;
}