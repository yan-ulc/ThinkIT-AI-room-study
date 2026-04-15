import { redirect } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function DashboardPage() {
  redirect("/dashboard");
}

const joinRoom = useMutation(api.rooms.joinById);

const handleJoin = async () => {
  const roomId = prompt("Tempel Room ID di sini, Ngab:");
  if (!roomId) return;
  
  try {
    await joinRoom({ roomId });
    alert("Berhasil masuk room!");
  } catch (err: any) {
    alert(err.message);
  }
};