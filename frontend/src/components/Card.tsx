const Card: React.FC<React.PropsWithChildren<{ title?: string; className?: string }>> = ({ title, className = "", children }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 ${className}`}>
    {title && <div className="text-lg font-semibold mb-3">{title}</div>}
    {children}
  </div>
);

export default Card;