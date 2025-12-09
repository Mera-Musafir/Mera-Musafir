import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Keyboard,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Image as ImageIcon,
  Plus,
  X,
} from "lucide-react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";

import { ImageWithFallback } from "./figma/ImageWithFallback";
import Toast from "react-native-toast-message";
import api from '../api/api'

interface CreateTripProps {
  onBack: () => void;
  onCreateTrip: (tripData: any) => void;
}

const imageOptions = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1721908919568-4003760b6c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMGJlYWNofGVufDF8fHx8MTc2MjUzMjAyNXww&ixlib=rb-4.1.0&q=80&w=1080",
    label: "Beach",
  },
  // {
  //   id: "2",
  //   url: "https://images.unsplash.com/photo-1603741614953-4187ed84cc50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGhpa2luZyUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NjI1MzkwNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
  //   label: "Mountain",
  // },
  // {
  //   id: "3",
  //   url: "https://images.unsplash.com/photo-1750810908078-a4729905bf4b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFufGVufDF8fHx8MTc2MjYyMDgzMXww&ixlib=rb-4.1.0&q=80&w=1080",
  //   label: "City",
  // },
  // {
  //   id: "4",
  //   url: "https://images.unsplash.com/photo-1660289647786-bfa5e9e8ba16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGlzbGFuZCUyMHBhcmFkaXNlfGVufDF8fHx8MTc2MjU5OTAxMnww&ixlib=rb-4.1.0&q=80&w=1080",
  //   label: "Island",
  // },
];

const tripTypes = [
  "Cultural",
  "Adventure",
  "Relaxation",
  "City Break",
  "Nature",
  "Food & Wine",
];

export function CreateTrip({ onBack, onCreateTrip }: CreateTripProps) {
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    budget: "",
    maxParticipants: "",
    tripType: "",
    description: "",
    imageUrl: "",
    activities: [] as string[],
  });

  const [activityInput, setActivityInput] = useState("");
  const [pickerValue, setPickerValue] = useState(formData.tripType);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addActivity = () => {
    if (activityInput.trim() && formData.activities.length < 8) {
      setFormData((prev) => ({
        ...prev,
        activities: [...prev.activities, activityInput.trim()],
      }));
      setActivityInput("");
      Keyboard.dismiss();
    }
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.title || !formData.location) {
        Toast.show({
          type: "error",
          text1: "Please fill in all required fields",
        });

        return;
      }
    } else if (step === 2) {
      if (
        !formData.startDate ||
        !formData.endDate ||
        !formData.maxParticipants
      ) {
        Toast.show({
          type: "error",
          text1: "Please fill in all required fields",
        });

        return;
      }
    } else if (step === 3) {
      if (!formData.tripType || !formData.description) {
        Toast.show({
          type: "error",
          text1: "Please fill in all required fields",
        });

        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    if (!formData.imageUrl) {
      Toast.show({
        type: "error",
        text1: "Please select an image",
      });
      return;
    }

    // --- Format backend fields correctly ---
    const payload = {
      title: formData.title,
      location: formData.location,
      dates: `${formData.startDate} to ${formData.endDate}`,
      imageurl: formData.imageUrl,
      maxparticipants: Number(formData.maxParticipants),
      description: formData.description,
      budget: formData.budget,
      triptype: formData.tripType,
      activities: formData.activities,

      // Calculate duration in days
      duration:
        Math.ceil(
          (new Date(formData.endDate).getTime() -
            new Date(formData.startDate).getTime()) /
            (1000 * 60 * 60 * 24)
        ) || 1,
    };

    try {
      const res = await api.post("/trips/", payload);

      Toast.show({
        type: "success",
        text1: "Trip created!",
      });

      onCreateTrip(res.data);
    } catch (error) {
      console.log("Error creating trip:", error);
      Toast.show({
        type: "error",
        text1: "Failed to create trip",
        text2: error.response?.data?.detail || "Unknown error",
      });
    }
  };

  return (
    <View className="min-h-screen  bg-gray-50">
      {/* Header */}
      <View className="px-5 pt-12 pb-6 bg-[#763E59]">
        <View className="flex-row items-center gap-4 mb-4">
          <Pressable
            onPress={onBack}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center active:scale-95"
            style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Pressable>
          <Text className="text-white text-lg font-semibold">
            Create New Trip
          </Text>
        </View>

        {/* Progress Steps */}
        <View className="flex-row items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              className="flex-1 h-1.5 rounded-full"
              style={{
                backgroundColor:
                  step >= s ? "white" : "rgba(255, 255, 255, 0.3)",
              }}
            />
          ))}
        </View>
      </View>

      {/* Form Content */}
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 }}
        className="px-5 py-6"
      >
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <View className="space-y-5">
            <View>
              <Text className="text-lg font-semibold mb-1">
                Basic Information
              </Text>
              <Text className="text-sm text-gray-500">
                Tell us about your trip destination
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="mb-1 font-medium">Trip Title *</Text>
                <TextInput
                  value={formData.title}
                  onChangeText={(v) => updateFormData("title", v)}
                  placeholder="e.g., Paris Adventure"
                  className="mt-1.5 h-12 border rounded-md px-3 bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="mb-1 font-medium">Location *</Text>
                <View className="relative mt-1.5">
                  <View className="absolute left-3 top-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </View>
                  <TextInput
                    value={formData.location}
                    onChangeText={(v) => updateFormData("location", v)}
                    placeholder="e.g., Paris, France"
                    className="pl-10 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View>
                <Text className="mb-1 font-medium">
                  Estimated Budget (per person)
                </Text>
                <View className="relative mt-1.5">
                  <View className="absolute left-3 top-3">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </View>
                  <TextInput
                    value={formData.budget}
                    onChangeText={(v) => updateFormData("budget", v)}
                    placeholder="e.g., $1,200-1,800"
                    className="pl-10 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Step 2: Dates & Group Size */}
        {step === 2 && (
          <View className="space-y-5">
            <View>
              <Text className="text-lg font-semibold mb-1">Trip Details</Text>
              <Text className="text-sm text-gray-500">
                When are you planning to go?
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="mb-1 font-medium">Start Date *</Text>
                <View className="relative mt-1.5">
                  <View className="absolute left-3 top-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </View>
                  <TextInput
                    value={formData.startDate}
                    onChangeText={(v) => updateFormData("startDate", v)}
                    placeholder="YYYY-MM-DD"
                    className="pl-10 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View>
                <Text className="mb-1 font-medium">End Date *</Text>
                <View className="relative mt-1.5">
                  <View className="absolute left-3 top-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </View>
                  <TextInput
                    value={formData.endDate}
                    onChangeText={(v) => updateFormData("endDate", v)}
                    placeholder="YYYY-MM-DD"
                    className="pl-10 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              <View>
                <Text className="mb-1 font-medium">Maximum Travelers *</Text>
                <View className="relative mt-1.5">
                  <View className="absolute left-3 top-3">
                    <Users className="w-5 h-5 text-gray-400" />
                  </View>
                  <TextInput
                    value={String(formData.maxParticipants)}
                    onChangeText={(v) => updateFormData("maxParticipants", v)}
                    placeholder="e.g., 8"
                    keyboardType="numeric"
                    className="pl-10 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                <Text className="text-xs text-gray-500 mt-1.5">
                  Choose between 2-20 travelers
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Step 3: Description & Type */}
        {step === 3 && (
          <View className="space-y-5">
            <View>
              <Text className="text-lg font-semibold mb-1">Trip Character</Text>
              <Text className="text-sm text-gray-500">
                Describe your trip experience
              </Text>
            </View>

            <View className="space-y-4">
              <View>
                <Text className="mb-1 font-medium">Trip Type *</Text>
                <View className="mt-1.5 border rounded-md bg-white">
                  <Picker
                    selectedValue={formData.tripType}
                    onValueChange={(value) => updateFormData("tripType", value)}
                  >
                    <Picker.Item label="Select trip type" value="" />
                    {tripTypes.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View>
                <Text className="mb-1 font-medium">Description *</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(v) => updateFormData("description", v)}
                  placeholder="Describe what makes this trip special..."
                  multiline
                  className="mt-1.5 min-h-32 border rounded-md px-3 py-2 bg-white"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View>
                <Text className="mb-1 font-medium">
                  Planned Activities (Optional)
                </Text>
                <View className="flex-row gap-2 mt-1.5">
                  <TextInput
                    value={activityInput}
                    onChangeText={setActivityInput}
                    onSubmitEditing={() => addActivity()}
                    placeholder="e.g., Eiffel Tower"
                    className="flex-1 h-12 border rounded-md px-3 bg-white"
                    placeholderTextColor="#9CA3AF"
                    returnKeyType="done"
                  />
                  <Pressable
                    onPress={addActivity}
                    className="h-12 px-4 rounded-md items-center justify-center"
                    style={{ backgroundColor: "#8E486A" }}
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </Pressable>
                </View>

                {formData.activities.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mt-3">
                    {formData.activities.map((activity, index) => (
                      <View
                        key={index}
                        className="px-3 py-1.5 rounded-full flex-row items-center gap-2"
                        style={{ backgroundColor: "#763E5920" }}
                      >
                        <Text style={{ color: "#763E59" }}>{activity}</Text>
                        <Pressable
                          onPress={() => removeActivity(index)}
                          className="pl-2"
                          style={({ pressed }) => [
                            { opacity: pressed ? 0.7 : 1 },
                          ]}
                        >
                          <X className="w-4 h-4" />
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Step 4: Image Selection */}
        {step === 4 && (
          <View className="space-y-5">
            <View>
              <Text className="text-lg font-semibold mb-1">Trip Image</Text>
              <Text className="text-sm text-gray-500">
                Choose a cover photo for your trip
              </Text>
            </View>

            <View className="grid grid-cols-2 gap-3">
              {imageOptions.map((image) => {
                const selected = formData.imageUrl === image.url;
                return (
                  <Pressable
                    key={image.id}
                    onPress={() => updateFormData("imageUrl", image.url)}
                    className={`relative aspect-[4/3] rounded-xl overflow-hidden`}
                    style={[
                      { borderWidth: 4 },
                      selected
                        ? {
                            borderColor: "#8E486A",
                            transform: [{ scale: 0.98 }],
                          }
                        : { borderColor: "transparent" },
                    ]}
                  >
                    <ImageWithFallback
                      src={image.url}
                      alt={image.label}
                      className="w-full h-full object-cover"
                    />
                    {selected && (
                      <View className="absolute inset-0 bg-[#8E486A]/20 items-center justify-center">
                        <View className="w-8 h-8 rounded-full bg-white items-center justify-center">
                          <View
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: "#8E486A" }}
                          />
                        </View>
                      </View>
                    )}
                    <View
                      className="absolute bottom-0 left-0 right-0 p-2"
                      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
                    >
                      <Text className="text-white text-sm">{image.label}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300">
              <View className="flex-col items-center gap-2 py-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <Text className="text-sm text-gray-600">
                  Or upload your own image
                </Text>
                <Text className="text-xs text-gray-400">Coming soon</Text>
              </View>
            </View>
          </View>
        )}
        <View className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-200">
          <View className="flex-row gap-3">
            {step > 1 && (
              <Pressable
                onPress={() => setStep((prev) => prev - 1)}
                className="flex-1 h-14 rounded-xl items-center justify-center"
                style={({ pressed }) => [
                  {
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    backgroundColor: "transparent",
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text className="text-black">Back</Text>
              </Pressable>
            )}

            {step < 4 ? (
              <Pressable
                onPress={handleNext}
                className="flex-1 h-14 rounded-xl items-center justify-center"
                style={{ backgroundColor: "#8E486A" }}
              >
                <Text className="text-white font-semibold">Next</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleSubmit}
                className="flex-1 h-14 rounded-xl items-center justify-center"
                style={{ backgroundColor: "#8E486A" }}
              >
                <Text className="text-white font-semibold">Create Trip</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
    </View>
  );
}
