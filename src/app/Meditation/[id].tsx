import { Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { meditations } from "@/data";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from "@react-native-community/slider";
import React, { useState, useEffect } from "react";
import { Audio } from "expo-av";
import { useFocusEffect } from '@react-navigation/native';

// Convert seconds to MM:SS format
const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
};

export default function MeditationDetails() {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioFile = require("@assets/meditations/audio1.mp3");

    useEffect(() => {
        const loadAudio = async () => {
            try {
                // Set the audio mode to allow playback even when the phone is on silent mode
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    allowsRecordingIOS: false,
                    staysActiveInBackground: true,
                });

                const { sound } = await Audio.Sound.createAsync(audioFile);
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded) {
                        setCurrentTime(status.positionMillis ? status.positionMillis / 1000 : 0); // in seconds
                        setDuration(status.durationMillis ? status.durationMillis / 1000 : 0); // in seconds
                    }
                });
                setSound(sound);
            } catch (error) {
                console.error("Error loading audio:", error);
            }
        };

        loadAudio();

        // Cleanup the sound object when the component unmounts
        return () => {
            if (sound) {
                sound.unloadAsync();
                setIsPlaying(false); // Ensure audio is stopped when going back
            }
        };
    }, []);

    const togglePlayPause = async () => {
        if (sound) {
            try {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                    console.log("Audio paused.");
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                    console.log("Audio playing.");
                }
            } catch (error) {
                console.error("Error during audio playback:", error);
            }
        }
    };

    const onSliderValueChange = async (value: number) => {
        if (sound) {
            const positionMillis = value * 1000; // Convert to milliseconds
            await sound.setPositionAsync(positionMillis); // Seek to the position
        }
    };

    const meditation = meditations.find((m) => m.id === Number(id));
    if (!meditation) {
        return <Text>Not found!</Text>;
    }

    // Pause and reset audio when the user navigates away from the screen
    useFocusEffect(
        React.useCallback(() => {
            // This is triggered when the screen gains focus
            return () => {
                // This is triggered when the screen loses focus (goes back)
                if (sound) {
                    sound.pauseAsync();
                    sound.setPositionAsync(0); // Reset audio to the beginning
                    setIsPlaying(false);
                    console.log("Audio stopped and reset.");
                }
            };
        }, [sound])
    );

    return (
        <SafeAreaView className="bg-orange-400 flex-1 p-2">
            <View className="flex-1">
                <View className="flex-1">
                    <View className="flex-row justify-between p-10 items-center">
                        <AntDesign name="infocirlceo" size={30} color="black" />
                        <AntDesign
                            onPress={() => router.back()}
                            name="close"
                            size={30}
                            color="black"
                        />
                    </View>
                    <Text className="text-3xl mt-10 text-center text-zinc-800 font-semibold">
                        {meditation?.title}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center ">
                    <Pressable
                        onPress={togglePlayPause}
                        className="bg-zinc-700 self-center w-24 aspect-square items-center justify-center rounded-full"
                    >
                        <FontAwesome6
                            name={isPlaying ? "pause" : "play"}
                            size={26}
                            color="snow"
                        />
                    </Pressable>
                </View>

                <View className="flex-1">
                    <View className="p-5 mt-auto">
                        <View className="flex-row justify-between">
                            <MaterialCommunityIcons name="cog-outline" size={24} color='#3A3937'/>
                            <MaterialIcons name="airplay" size={24} color='#3A3937'/>
                        </View>

                        <View>
                            <Slider
                                style={{ width: '100%', height: 40 }}
                                minimumValue={0}
                                maximumValue={duration}
                                minimumTrackTintColor="#3A3937"
                                maximumTrackTintColor="#3A393755"
                                thumbTintColor="#3A3937"
                                value={currentTime}
                                onValueChange={onSliderValueChange}
                            />
                            <View className="flex-row justify-between mt-2">
                                <Text className="text-xs text-zinc-600">{formatTime(currentTime)}</Text>
                                <Text className="text-xs text-zinc-600">{formatTime(duration)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
