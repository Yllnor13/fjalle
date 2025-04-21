import Main_Layout from "@/components/Main_layout";


export default function Home() {
  return (
    <main className="bg-[var(--background)] min-h-screen flex items-center justify-center">
      {/* No frame for desktop view */}
      <div className="w-full h-full">
        <Main_Layout/>
      </div>
    </main>
  );
}
