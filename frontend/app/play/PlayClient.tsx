"use client"
import React, { useEffect } from 'react'
import { server } from '@/utils/backend/server'

type PlayClientProps = {
  mapData: any,
  username: string,
  access_token: string,
  realmId: string,
  uid: string,
  shareId: string,
  initialSkin: string,
  name: string,
}

const PlayClient:React.FC<PlayClientProps> = (props) => {
  useEffect(() => {
    let guestName = props.username
    let guestId = props.uid
    if (!props.access_token) {
      // Populate guest identity from local storage if exists
      const storedId = localStorage.getItem('guestId')
      const storedName = localStorage.getItem('guestName')
      if (storedId) guestId = storedId
      if (storedName) guestName = storedName
      if (!storedId) localStorage.setItem('guestId', guestId)
      if (!storedName) localStorage.setItem('guestName', guestName)
    }

    server.connect(props.realmId, guestId, props.shareId, props.access_token, guestName)

    return () => {
      server.disconnect()
    }
  }, [props.realmId, props.uid, props.shareId, props.access_token])

  return null
}

export default PlayClient