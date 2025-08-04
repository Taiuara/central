interface PingDeskLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function PingDeskLogo({ className = '', width = 200, height = 80 }: PingDeskLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 320 80" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="max-w-full h-auto"
      >
        {/* Ícone WiFi + P */}
        <g transform="translate(10, 10)">
          {/* Ondas WiFi */}
          <path 
            d="M35 45 Q20 30, 5 45" 
            stroke="#3B82F6" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M40 45 Q22.5 22.5, 5 45" 
            stroke="#3B82F6" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          <path 
            d="M45 45 Q25 15, 5 45" 
            stroke="#3B82F6" 
            strokeWidth="4" 
            fill="none" 
            strokeLinecap="round"
          />
          
          {/* Letra P estilizada como ícone de localização */}
          <circle cx="25" cy="35" r="15" fill="#6366F1" />
          <circle cx="25" cy="35" r="6" fill="white" />
        </g>
        
        {/* Texto PingDesk */}
        <text 
          x="70" 
          y="45" 
          className="font-bold" 
          fill="#3B82F6"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '24px' }}
        >
          Ping
        </text>
        <text 
          x="140" 
          y="45" 
          className="font-bold" 
          fill="#6366F1"
          style={{ fontFamily: 'Inter, system-ui, sans-serif', fontSize: '24px' }}
        >
          Desk
        </text>
      </svg>
    </div>
  );
}
