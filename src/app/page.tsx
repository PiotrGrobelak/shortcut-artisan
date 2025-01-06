"use client";

import { Button } from "@/components/ui/button"


export default function Main() {

  const onHandleClick = () => {
    alert("This is a native popup for test shadcn/ui!");
  }


  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center">
        <p>Application is under construction 👷‍♀️🚧</p>
        <p>Stay tuned for more updates! 🔃</p>
        <Button onClick={onHandleClick}>Click and check: shadcn/ui</Button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <p>Powered by Tauri 🏗️</p>
      </footer>
    </div>
  );
}
