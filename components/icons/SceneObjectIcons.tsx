
import React from 'react';

// Define a type for lighting info to be passed to icons
interface LightingInfo {
    shadowAngle: number;
    shadowOpacity: number;
    highlightOpacity: number;
    lightColor: string;
}
interface IconProps extends React.SVGProps<SVGSVGElement> {
    lighting: LightingInfo;
}


export const CubeIcon: React.FC<IconProps> = ({ lighting, ...props }) => (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="cube-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.3)'}} />
                <stop offset="100%" style={{stopColor: 'rgba(0,0,0,0.3)'}} />
            </linearGradient>
        </defs>
        <g style={{ transform: 'rotateX(-30deg) rotateY(45deg) translateZ(10px) translateX(-10px) translateY(10px)' }}>
            {/* Top face */}
            <path d="M50 0 L100 25 L50 50 L0 25 Z" fillOpacity="0.8" />
            {/* Left face */}
            <path d="M0 25 L50 50 L50 100 L0 75 Z" fillOpacity="0.6" />
            {/* Right face */}
            <path d="M50 50 L100 25 L100 75 L50 100 Z" fillOpacity="0.9" />
             <path d="M50 0 L100 25 L50 50 L0 25 Z" fill="url(#cube-grad)" />
        </g>
    </svg>
);


export const ViewPortIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

export const LightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

export const PointLightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v.01M12 6v.01M6 12h.01M18 12h.01M19.07 19.07l-.007-.007M4.93 4.93l-.007-.007M19.07 4.93l-.007.007M4.93 19.07l-.007.007" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

export const PlayerIcon: React.FC<IconProps> = ({ lighting, ...props }) => (
    <svg viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <radialGradient id="playerHead" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor={lighting.lightColor} stopOpacity={lighting.highlightOpacity * 2} />
                <stop offset="100%" stopColor={lighting.lightColor} stopOpacity="0" />
            </radialGradient>
             <linearGradient id="playerBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.7"/>
                <stop offset="50%" stopColor="currentColor" stopOpacity="1"/>
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.7"/>
            </linearGradient>
        </defs>
        <g>
            {/* Body */}
            <path d="M8,20 C8,22 10,24 20,24 C30,24 32,22 32,20 L30,58 L10,58 L8,20 Z" fill="url(#playerBody)"/>
            {/* Head */}
            <circle cx="20" cy="12" r="12" fill="currentColor" />
            {/* Highlight */}
            <circle cx="20" cy="12" r="12" fill="url(#playerHead)" />
        </g>
    </svg>
);

export const WedgeIcon: React.FC<IconProps> = ({ lighting, ...props }) => (
    <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <linearGradient id="wedge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: 'rgba(255,255,255,0.2)'}} />
                <stop offset="100%" style={{stopColor: 'rgba(0,0,0,0.2)'}} />
            </linearGradient>
        </defs>
         <g style={{ transform: 'rotateX(-20deg) rotateY(35deg)' }}>
            {/* Top Face */}
            <path d="M0 0 L100 0 L0 100 Z" fillOpacity="0.9" />
            {/* Side Face */}
            <path d="M100 0 L100 100 L0 100 Z" fillOpacity="0.6" />
             <path d="M0 0 L100 0 L0 100 Z" fill="url(#wedge-grad)" />
        </g>
    </svg>
);

export const ConeIcon: React.FC<IconProps> = ({ lighting, ...props }) => (
     <svg viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <defs>
            <radialGradient id="cone-grad" cx="0.5" cy="0.8" r="0.7">
                <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
            </radialGradient>
        </defs>
        <g style={{ transform: 'translateY(10px)' }}>
            <ellipse cx="50" cy="85" rx="50" ry="15" fillOpacity="0.7" />
            <path d="M0 85 L50 0 L100 85 Z" />
            <path d="M0 85 L50 0 L100 85 Z" fill="url(#cone-grad)" />
        </g>
    </svg>
);