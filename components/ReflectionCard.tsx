interface ReflectionCardProps {
  text: string;
  index: number;
}

export function ReflectionCard({ text, index }: ReflectionCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 mb-4 border border-secondary/30 shadow-sm">
      <p className="text-subtext text-sm mb-2">Reflection {index + 1}</p>
      <p className="text-ink text-base leading-relaxed" style={{ lineHeight: '26px' }}>
        {text}
      </p>
    </div>
  );
}
