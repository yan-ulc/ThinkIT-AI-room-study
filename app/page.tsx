import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F5F4F0] p-6 text-center">
      {/* Label Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEF2FF] border border-[#818CF8] text-[#4F46E5] text-xs font-medium mb-6">
        <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5]" />
        AI-native collaborative learning
      </div>

      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-[#1C1B18]">
        Think together,
        <br />
        <span className="text-[#4F46E5]">learn smarter</span>
      </h1>

      <p className="text-[#6B6860] max-w-lg mb-8 text-lg font-light leading-relaxed">
        Bring your team, your documents, and your curiosity. An AI that actually
        reads what you've uploaded.
      </p>

      <div className="flex gap-4 justify-center">
        {!userId ? (
          <>
            <SignInButton mode="modal">
              <button className="px-6 py-3 rounded-xl bg-[#4F46E5] text-white font-medium hover:opacity-90 transition-all">
                Get Started Free
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-6 py-3 rounded-xl bg-white border border-gray-200 text-[#1C1B18] font-medium hover:bg-gray-50 transition-all">
                Sign Up
              </button>
            </SignUpButton>
          </>
        ) : (
          <Link href="/dashboard">
            <button className="px-8 py-3 rounded-xl bg-[#4F46E5] text-white font-medium hover:opacity-90 transition-all shadow-md">
              Enter Dashboard →
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
