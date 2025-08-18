export default function Anchor({href, name, target}: {href: string, name: string, target?: string}) {
    return (
        <a
            href={href}
            target={target != null ? target : ""}
            className="hover:text-[#f08e7f] transition-colors"
        >
            {name}
        </a> 
    );
}
