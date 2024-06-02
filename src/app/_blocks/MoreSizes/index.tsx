import React from 'react'

import { Product } from '../../../payload/payload-types'
import { Card } from '../../_components/Card'
import { Gutter } from '../../_components/Gutter'
import RichText from '../../_components/RichText'

import classes from './index.module.scss'

export type MoreSizesProps = {
  blockType: 'moreSizes'
  blockName: string
  introContent?: any
  docs?: (string | Product)[]
  relationTo: 'products'
}

export const MoreSizes: React.FC<MoreSizesProps> = props => {
  const { docs, relationTo } = props

  return (
    <div className={classes.moreSizes}>
      <Gutter>
        <h3 className={classes.title}>More Sizes</h3>
        <div className={classes.grid}>
          {docs?.map(doc => {
            if (typeof doc === 'string') return null

            return <Card key={doc.id} relationTo={relationTo} doc={doc} showCategories />
          })}
        </div>
      </Gutter>
    </div>
  )
}
