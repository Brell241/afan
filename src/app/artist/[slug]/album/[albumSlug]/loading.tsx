export default function Loading() {
  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
        <p className="text-white/20 text-xs uppercase tracking-widest">Chargement</p>
      </div>
    </div>
  );
}
