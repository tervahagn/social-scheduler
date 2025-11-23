// Platform configuration with icons and colors
import {
    Linkedin,
    Facebook,
    Instagram,
    Twitter,
    Youtube,
    MessageSquare,
    MapPin,
    FileText
} from 'lucide-react';

export const PLATFORM_CONFIG = {
    'linkedin': {
        name: 'LinkedIn (Company)',
        color: '#0077B5',
        icon: Linkedin
    },
    'linkedin-personal': {
        name: 'LinkedIn (Personal)',
        color: '#0A66C2',
        icon: Linkedin
    },
    'facebook': {
        name: 'Facebook',
        color: '#1877F2',
        icon: Facebook
    },
    'instagram': {
        name: 'Instagram',
        color: '#E4405F',
        icon: Instagram
    },
    'twitter': {
        name: 'X (Twitter)',
        color: '#000000',
        icon: Twitter
    },
    'google-business': {
        name: 'Google Business',
        color: '#4285F4',
        icon: MapPin
    },
    'blog': {
        name: 'Blog',
        color: '#FF6B6B',
        icon: FileText
    },
    'reddit': {
        name: 'Reddit',
        color: '#FF4500',
        icon: MessageSquare
    },
    'youtube-posts': {
        name: 'YouTube Community',
        color: '#FF0000',
        icon: Youtube
    }
};

export const getPlatformConfig = (platformId) => {
    return PLATFORM_CONFIG[platformId] || {
        name: platformId,
        color: '#6366f1',
        icon: FileText
    };
};
