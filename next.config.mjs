/** @type {import('next').NextConfig} */
const nextConfig = {
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    watchOptions: {
        ignored: ['**/.vs/**'],
    },
}

export default nextConfig
