// Helper function to check if URL is an image
export const isImageUrl = (url: string): boolean => {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
        return imageExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}

// Helper function to check if URL is a video
export const isVideoUrl = (url: string): boolean => {
    try {
        const pathname = new URL(url).pathname.toLowerCase();
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
        return videoExtensions.some(ext => pathname.endsWith(ext));
    } catch {
        return false;
    }
}
