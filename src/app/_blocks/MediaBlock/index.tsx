import React from 'react'
import { StaticImageData } from 'next/image'

import { Page } from '../../../payload/payload-types'
import { Gutter } from '../../_components/Gutter'
import { Media } from '../../_components/Media'
import { Video } from '../../_components/Media/Video'
import RichText from '../../_components/RichText'

import classes from './index.module.scss'

type Props = Extract<Page['layout'][0], { blockType: 'mediaBlock' }> & {
  staticImage?: StaticImageData
  id?: string
}
export const MediaBlock: React.FC<Props> = props => {
  const { media, position = 'default', staticImage } = props

  let caption: string | undefined

  const isVideo =
    media && typeof media === 'object' && media.mimeType && media.mimeType.startsWith('video/')

  return (
    <div className={classes.mediaBlock}>
      {position === 'fullscreen' && (
        <div className={classes.fullscreen}>
          {isVideo ? (
            <Video resource={typeof media === 'object' ? media : undefined} />
          ) : (
            <Media resource={media} src={staticImage} />
          )}
        </div>
      )}
      {position === 'default' && (
        <Gutter>
          {isVideo ? (
            <Video resource={typeof media === 'object' ? media : undefined} />
          ) : (
            <Media resource={media} src={staticImage} />
          )}
        </Gutter>
      )}
      {caption && (
        <Gutter className={classes.caption}>
          <RichText content={caption} />
        </Gutter>
      )}
    </div>
  )
}
