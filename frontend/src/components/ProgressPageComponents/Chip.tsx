const Chip: React.FC<React.PropsWithChildren<{ color?: string }>> = ({ color = "bg-gray-100 text-gray-700", children }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>{children}</span>
);

export default Chip;