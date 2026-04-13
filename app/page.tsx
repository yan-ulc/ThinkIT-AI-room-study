import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="p-8">
      <h1>ThinkIT Foundation Ready</h1>
      <UserButton />
    </div>
  );
}   