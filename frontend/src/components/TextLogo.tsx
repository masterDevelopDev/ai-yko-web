export function TextLogo(props: { blueBackground?: boolean }) {
    return (
        <span className="font-bold text-2xl" aria-label="Home">
            <span className="w-auto">AI-</span><span
            className={props.blueBackground ? "text-gray-50" : "text-blue-600"}>YKO</span>
        </span>
    );
}