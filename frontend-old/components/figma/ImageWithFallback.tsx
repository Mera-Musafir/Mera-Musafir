import React, { useState } from "react";
import { View, Text, Image, StyleProp, ImageStyle, ViewStyle } from "react-native";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4K";

interface ImageWithFallbackProps {
  src: string;
  alt?: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
}

export function ImageWithFallback({ src, alt, style, containerStyle }: ImageWithFallbackProps) {
  const [didError, setDidError] = useState(false);

  return (
    <View style={containerStyle}>
      {didError ? (
        <View style={{ justifyContent: "center", alignItems: "center", backgroundColor: "#eee" }}>
          <Image source={{ uri: ERROR_IMG_SRC }} style={style} />
          {alt && <Text>{alt}</Text>}
        </View>
      ) : (
        <Image source={{ uri: src }} style={style} onError={() => setDidError(true)} />
      )}
    </View>
  );
}
