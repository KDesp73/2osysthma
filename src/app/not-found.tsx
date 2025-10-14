import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl mt-4 mb-4">Δεν μπορούσαμε να βρούμε την σελίδα που ψάχνεις. Μάλλον είναι μαζί με την μπεπανθόλ</p>
      <Image
        src={"/bepanthol.jpg"}
        alt="bepanthol"
        width={800}
        height={600}
      >
      </Image>
      <Link href="/" className="mt-6 text-blue-600 underline">
        Επέστρεψε στην Αρχική
      </Link>
    </div>
  );
}
