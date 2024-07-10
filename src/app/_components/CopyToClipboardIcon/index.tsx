'use client'
import React from 'react'
import Image from 'next/image'

import classes from './index.module.scss'

const CopyToClipboardIcon: React.FC<{ text: string }> = ({ text }) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {}
  }

  return (
    <Image
      src="/assets/icons/copy.svg"
      alt="copy"
      width={24}
      height={24}
      className={classes.copyIcon}
      onClick={handleCopy}
    />
  )
}

export default CopyToClipboardIcon
