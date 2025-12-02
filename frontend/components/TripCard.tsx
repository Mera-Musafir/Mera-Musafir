import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Users, Calendar, MapPin } from 'lucide-react-native';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface TripCardProps {
  id: string;
  title: string;
  location: string;
  dates: string;
  imageUrl: string;
  participants: number;
  maxParticipants: number;
  onClick: () => void;
}

export function TripCard({
  title,
  location,
  dates,
  imageUrl,
  participants,
  maxParticipants,
  onClick,
}: TripCardProps) {
  return (
    <TouchableOpacity
      onPress={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-transform"
    >
      <View className="relative h-48">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          className="w-full h-full rounded-t-2xl"
         
        />
        <View className="absolute top-3 right-3 bg-white/90 px-3 py-1.5 rounded-full flex-row items-center gap-1.5">
          <Users size={16} color="#8E486A" />
          <Text className="text-sm">{participants}/{maxParticipants}</Text>
        </View>
      </View>

      <View className="p-4">
        <Text className="mb-2 text-base font-semibold">{title}</Text>

        <View className="flex-col gap-2">
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#8E486A" />
            <Text className="text-sm text-gray-600">{location}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <Calendar size={16} color="#8E486A" />
            <Text className="text-sm text-gray-600">{dates}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
