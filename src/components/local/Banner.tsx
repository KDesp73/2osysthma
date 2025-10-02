export default function Banner({ title }: { title: string }) {
  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg mb-8">
      <img
        src="/banner.jpg"
        alt="Banner"
        className="object-cover w-full h-full"
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white">{title}</h1>
      </div>
    </div>
  );
}
