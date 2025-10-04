const Card: React.FC<
  React.PropsWithChildren<{
    title?: string;
    className?: string;
    bgcolor?: string;
  }>
> = ({ title, className = "", bgcolor = "", children }) => (
  <div
    className={`${
      bgcolor ? bgcolor : "bg-white"
    } rounded-[20px] shadow-sm border border-gray-200 p-5 ${className}`}
  >
    {/* {title && <div className="text-lg font-semibold mb-3">{title}</div>} */}
    {children}
  </div>
);

export default Card;
