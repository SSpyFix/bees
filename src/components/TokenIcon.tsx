import { tokenIconMarkup } from "../game/data/tokenIcons";
export default function TokenIcon({
  kind,
  size = 28,
}: {
  kind: string;
  size?: number;
}) {
  return (
    <svg
      className="ability-token-icon"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: tokenIconMarkup(kind) }}
    />
  );
}
