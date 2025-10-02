import { Facebook, Instagram, Mail, Phone, Pin } from "lucide-react";
import Link from "next/link";

export default function ContactLinks() {
  return (
    <ul className="space-y-3 text-gray-700">
      <li className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-gray-500" />
        <Link href="mailto:2p_kilkis@sep.org.gr" className="hover:underline">
          2p_kilkis@sep.org.gr
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Pin className="h-5 w-5 text-gray-500" />
        <Link
          href="https://maps.app.goo.gl/riqzmUYBYEczAer39"
          className="hover:underline"
        >
          Παπαγιαννάκου 1, Κιλκίς, 61100
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Phone className="h-5 w-5 text-gray-500" />
        <Link href="tel:+306981927806" className="hover:underline">
          +30 698 192 7806 (Στάθης Ιορδανίδης)
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Facebook className="h-5 w-5 text-gray-500" />
        <Link
          href="https://www.facebook.com/profile.php?id=61577586039297"
          target="_blank"
          className="hover:underline"
        >
          Facebook
        </Link>
      </li>
      <li className="flex items-center gap-2">
        <Instagram className="h-5 w-5 text-gray-500" />
        <Link
          href="https://www.instagram.com/2osystimakilkis"
          target="_blank"
          className="hover:underline"
        >
          Instagram
        </Link>
      </li>
    </ul>
  );
}
