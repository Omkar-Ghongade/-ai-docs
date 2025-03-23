const productionUrl = 'https://ai-docs-five.vercel.app/'
const developmentUrl = 'http://localhost:3000'

const baseUrl = process.env.NODE_ENV === 'production' ? productionUrl : developmentUrl

export const authConfig = {
  callbacks: {
    redirect({ url, baseUrl }) {
      return baseUrl
    },
  },
} 