'use client'

import React, { Fragment, useState } from 'react'

import { Category, Product } from '../../../payload/payload-types'
import { AddToCartButton } from '../../_components/AddToCartButton'
import { Gutter } from '../../_components/Gutter'
import { Media } from '../../_components/Media'
import { Price } from '../../_components/Price'
import { useAuth } from '../../_providers/Auth'

import classes from './index.module.scss'

const SizeOptions: React.FC<{
  TotalSizes: string[]
  AvailableSizes: string[]
  selectedSize: string
  setSelectedSize: (size: string) => void
}> = ({ TotalSizes, AvailableSizes, selectedSize, setSelectedSize }) => {
  return (
    <div className={classes.sizeOptions}>
      {TotalSizes.map((option, index) => {
        const isAvailable = AvailableSizes.includes(option)
        return (
          <div
            key={index}
            className={`${classes.sizeOption} ${option === selectedSize ? classes.selected : ''} ${
              !isAvailable ? classes.unselectable : ''
            }`}
            onClick={() => isAvailable && setSelectedSize(option)}
          >
            {option}
          </div>
        )
      })}
    </div>
  )
}

const DotIndicator: React.FC<{ currentImageIndex: number }> = ({ currentImageIndex }) => {
  return (
    <div className={classes.dotContainer}>
      {[0, 1].map(index => (
        <div
          key={index}
          className={`${classes.dot} ${currentImageIndex === index ? classes.activeDot : ''}`}
        />
      ))}
    </div>
  )
}

export const ProductHero: React.FC<{
  product: Product
}> = ({ product }) => {
  const {
    title,
    categories,
    moreSizes,
    media,
    meta: { image: metaImage, description } = {},
  } = product

  const [size, setSize] = useState('null') // assuming sizes are in an array
  const TotalSizes: string[] = ['S', 'M', 'L', 'XL']
  let AvailableSizes: string[] = moreSizes || []

  const anySizesAvailable = TotalSizes.some((size: string) => AvailableSizes.includes(size))

  // Add state for the current image
  const [currentImage, setCurrentImage] = useState(metaImage)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Function to switch to the next image
  const switchImage = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      if (currentImageIndex === 0) {
        setCurrentImage(media)
        setCurrentImageIndex(1)
      } else {
        setCurrentImage(metaImage)
        setCurrentImageIndex(0)
      }
      setIsTransitioning(false)
    }, 500) // Duration should match the transition time
  }

  const { user } = useAuth()

  return (
    <Gutter className={classes.productHero}>
      <div className={classes.mediaWrapper} onClick={switchImage}>
        {!currentImage && <div className={classes.placeholder}>No image</div>}
        {currentImage && typeof currentImage !== 'string' && (
          <Media
            imgClassName={`${classes.image} ${
              isTransitioning ? classes.imageHidden : classes.imageVisible
            }`}
            resource={currentImage}
            fill
          />
        )}
        <DotIndicator currentImageIndex={currentImageIndex} />
      </div>

      <div className={classes.details}>
        <h3 className={classes.title}>{title}</h3>

        <div className={classes.categoryWrapper}>
          <div className={classes.categories}>
            {categories?.map((category, index) => {
              const { title: categoryTitle } = category as Category

              const titleToUse = categoryTitle || 'Generic'
              const isLast = index === categories.length - 1

              return (
                <p key={index} className={classes.category}>
                  {titleToUse} {!isLast && <Fragment>, &nbsp;</Fragment>}
                  <span className={classes.separator}>|</span>
                </p>
              )
            })}
          </div>
          <p className={classes.stock}>{anySizesAvailable ? 'In stock' : 'Out of stock'}</p>
        </div>

        <Price product={product} button={false} />

        <div className={classes.description}>
          <h6>Description</h6>
          <p>{description}</p>
        </div>

        {anySizesAvailable ? (
          <>
            <div className={classes.description}>
              <h6>
                Sizes{' '}
                <a href="/size-chart" className={classes.sizeChartLink}>
                  Size Chart
                </a>
              </h6>
            </div>
            <SizeOptions
              TotalSizes={TotalSizes}
              AvailableSizes={AvailableSizes}
              selectedSize={size}
              setSelectedSize={setSize}
            />
            {size !== 'null' ? (
              <AddToCartButton product={product} className={classes.addToCartButton} size={size} />
            ) : (
              <p className={classes.selectSizeMessage}>Please select a size</p>
            )}
          </>
        ) : (
          <p className={classes.outOfStockMessage}>This item is currently out of stock</p>
        )}

        {!user && <p className={classes.loginMessage}>Please log in to save your cart</p>}
      </div>
    </Gutter>
  )
}
