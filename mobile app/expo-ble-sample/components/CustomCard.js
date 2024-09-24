import { View, Text } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

export default function CustomCard() {
  return (
    <View style={{
        padding:10,
        margin:10,
        borderRadius:15,
        backgroundColor:'#fff',
        display: 'flex',
        flexDirection: 'row',
        gap:10
      }}
      >
        <Image
          source="https://picsum.photos/seed/696/3000/2000"
          style={{
            width:120,
            height:120,
            borderRadius:15
          }}
        />
        <Text>Nice</Text>
    </View>
  )
}