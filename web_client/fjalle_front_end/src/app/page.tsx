import Main_layout from "@/components/Main_layout";


export default function Home() {
  return (
    <main className="bg-white min-h-screen flex items-center justify-center py-6">
      {/* Mobile frame for small screens */}
      <div className="md:hidden relative mx-auto my-4 bg-white">
        {/* App content */}
        <div className="bg-white h-full w-full overflow-y-auto">
          <Main_layout />
        </div>
      </div>
      
      {/* No frame for desktop view */}
      <div className="hidden md:block w-full h-full">
        <Main_layout/>
      </div>
    </main>
  );
}
