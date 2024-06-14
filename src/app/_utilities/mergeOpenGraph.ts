import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  siteName: 'Merph',
  title: 'Merph',
  description: 'A great ecommerce platform for all your fashion needs.',
  images: [
    {
      url: '/logo-black.svg',
      alt: 'logo',
      width: 170,
      height: 50,
    },
  ],
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
