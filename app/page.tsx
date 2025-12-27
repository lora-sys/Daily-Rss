"use client";

import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import Card from "@/app/components/Card";
import { useState } from "react";
import { toast } from "sonner";
export default function Home() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = () => {
    // Add your subscription logic here
    fetch("/api/subscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        } else {
          setIsSubscribed(true);
          toast.success("Subscribed successfully!");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while subscribing.", error);
      })
      .finally(() => {
        setEmail("");
      });
  };

  return (
    <div className="min-h-screen bg-white">
      {/** Header */}
      <header className=" flex items-center justify-between px-8 py-6 max-w-7xl mx-auto ">
        <div className="flex items-center gap-3">
          <BookOpenCheck />
          <h1 className="text-2xl font-bold leading-none">Daily News</h1>
        </div>
        <nav className="flex items-center gap-6">
          <Link className="hover:text-blue-500" href="/">
            Home
          </Link>
          <Link className="hover:text-blue-500" href="/about">
            About
          </Link>
          <Link className="hover:text-blue-500" href="/contact">
            Contact
          </Link>
        </nav>
      </header>
      {/*main content */}
      <div className="max-h-7xl mx-auto px-8 py-12">
        {/* title */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 ">Daily Briefs of AI</h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed ">
            Stay updated with the latest news and insights on AI.
          </p>
        </div>
      </div>

      {/*input and subcribe button*/}
      <div className="flex items-center text-center justify-center gap-4 ">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border border-gray-300 rounded-md px-4 py-2"
        />
        <button
          className="bg-black text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={handleSubscribe}
        >
          Subscribe
        </button>
      </div>

      {/*Card max-w-7xl 限制最大宽度，水平居中，内容上方的容器，左右各自添加32px的padding*/}
      <div className="max-w-7xl mx-auto px-8 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16 ">
          <Card
            title="AI"
            description="How AI is transforming industries"
          ></Card>
          <Card title="Startups" description="Top AI startups to watch"></Card>
          <Card title="Tech" description="Latest tech trends in AI"></Card>
        </div>
      </div>
    </div>
  );
}
