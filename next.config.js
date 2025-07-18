const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // votre configuration Next.js existante
  images: {
    domains: ['res.cloudinary.com'],
  },
}) 