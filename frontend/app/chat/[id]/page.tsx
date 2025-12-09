"use client";
import { useParams, useRouter } from "next/navigation";
import GroupChat from "@/app/components/GroupChat";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = parseInt(params.id as string);

  return (
    <GroupChat 
      chatId={chatId} 
      tripId={null}
      onBack={() => router.back()} 
    />
  );
}