import Main_Layout from "@/components/Main_layout";

export default function Home() {
  return (
    <main className="bg-[var(--background)] min-h-screen overflow-hidden">
      {/* No frame for desktop view */}
      <div className="">
        <Main_Layout/>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Fjala e Dites",
  description: "luaj çdo ditë!",
}