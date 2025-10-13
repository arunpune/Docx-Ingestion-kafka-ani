import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
          Document Ingestion Dashboard
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 mb-12 leading-relaxed">
          Welcome to your intelligent document processing workspace.
        </p>

        {/* CTA Button */}
        <Link href="/dashboard">
          <button className="group bg-white text-black px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-3 mx-auto transition-all duration-300 hover:bg-gray-200">
            Continue to Dashboard
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}
