type IconProps = { size?: number; color?: string };

export function IconFood({ size = 18, color = "#8a6a3f" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M7 9c-1.4 0-2.5-1.1-2.5-2.5S5.6 4 7 4s2.5 1.1 2.5 2.5c0 .5-.2 1-.4 1.4h5.8c-.2-.4-.4-.9-.4-1.4C14.5 5.1 15.6 4 17 4s2.5 1.1 2.5 2.5S18.4 9 17 9c-.3 0-.6-.1-.9-.2-.6 1.7-1.2 3.8-1.2 5.2 0 1.4.6 3.5 1.2 5.2.3-.1.6-.2.9-.2 1.4 0 2.5 1.1 2.5 2.5S18.4 24 17 24s-2.5-1.1-2.5-2.5c0-.5.2-1 .4-1.4H9.1c.2.4.4.9.4 1.4C9.5 22.9 8.4 24 7 24s-2.5-1.1-2.5-2.5S5.6 19 7 19c.3 0 .6.1.9.2.6-1.7 1.2-3.8 1.2-5.2 0-1.4-.6-3.5-1.2-5.2-.3.1-.6.2-.9.2Z"
        fill={color}
      />
    </svg>
  );
}

export function IconShelter({ size = 18, color = "#8a6a3f" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3 2 11h3v10h5v-6h4v6h5V11h3L12 3Z" fill={color} />
    </svg>
  );
}

export function IconTools({ size = 18, color = "#8a6a3f" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M21.7 17.3 15 10.6c.7-1.6.4-3.5-.9-4.8-1.4-1.4-3.5-1.7-5.2-.9l3 3-2.1 2.1-3-3c-.9 1.7-.5 3.8.9 5.2 1.3 1.3 3.2 1.6 4.8.9l6.7 6.7c.4.4 1 .4 1.4 0l1.1-1.1c.4-.4.4-1.1 0-1.4Z"
        fill={color}
      />
    </svg>
  );
}

export function IconTropy({ size = 18, color = "#a9762f" }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <g fill={color} opacity="0.9">
        <ellipse cx="17" cy="18" rx="3.4" ry="2.8" />
        <ellipse cx="18.6" cy="13.5" rx="1.4" ry="1.7" transform="rotate(-18 18.6 13.5)" />
        <ellipse cx="15.3" cy="12.2" rx="1.5" ry="1.8" transform="rotate(-6 15.3 12.2)" />
        <ellipse cx="12.6" cy="13" rx="1.5" ry="1.8" transform="rotate(8 12.6 13)" />
        <ellipse cx="14.3" cy="8.5" rx="3.4" ry="2.8" opacity="0.35" />
        <ellipse cx="15.9" cy="4" rx="1.4" ry="1.7" transform="rotate(-18 15.9 4)" opacity="0.35" />
        <ellipse cx="12.6" cy="2.7" rx="1.5" ry="1.8" transform="rotate(-6 12.6 2.7)" opacity="0.35" />
        <ellipse cx="9.9" cy="3.5" rx="1.5" ry="1.8" transform="rotate(8 9.9 3.5)" opacity="0.35" />
      </g>
    </svg>
  );
}
