import { GraduationCap } from 'lucide-react';
import { useState } from 'react';

/**
 * Logo Component
 * Displays Skillatics logo image with fallback to icon if image fails to load
 */

export default function Logo({ className = "h-8 w-auto" }) {
    const [imageError, setImageError] = useState(false);

    // Fallback to icon if image doesn't load
    if (imageError) {
        return (
            <div className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 ${className.includes('h-') ? className.replace('w-auto', 'w-8') : 'h-8 w-8'}`}>
                <GraduationCap className="h-5 w-5 text-white" />
            </div>
        );
    }

    return (
        <img
            src="/skillatics-logo.png"
            alt="Skillatics.io"
            className={className}
            onError={() => setImageError(true)}
            loading="lazy"
        />
    );
}
