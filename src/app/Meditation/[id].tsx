import { Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { meditations } from "@/data";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import AntDesign from '@expo/vector-icons/AntDesign';
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Slider from "@react-native-community/slider";
import audio from '@assets/meditations/audio1.mp3';
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";

export default function MeditationDetails(){
    const {id} = useLocalSearchParams <{id : string }>();

    const player = useAudioPlayer('@assets/meditations/audio1.mp3');
    const status= useAudioPlayerStatus(player);

    const meditation = meditations.find((m)=> m.id === Number(id));
     if(!meditation){
        return <text>Not found!</text>
     }
     return(
     <SafeAreaView className="bg-orange-400 flex-1 p-2">
      <View className="flex-1">
        <View className="flex-1">
            <View className="flex-row justify-between p-10 items-center">
            <AntDesign name="infocirlceo" size={30} color="black"/>
            <AntDesign
              onPress={()=>router.back()}
              name="close"
              size={30}
              color="black"
              />
            </View>
            <Text className="text-3xl mt-10 text-center text-zinc-800 font-semibold">{meditation?.title}</Text>
        </View>

        <Pressable 
         onPress={()=>player.playing ?player.pause() : player.play()}
         className="bg-zinc-700 self-center w-24 aspect-square items-center justify-center rounded-full">
        <FontAwesome6 name={status.playing ? 'pause' : 'play'} size={26} color="snow"/>
        </Pressable>

        <View className="flex-1">
          <View className="p-5 mt-auto">
            <View className="flex-row justify-between">
              <MaterialCommunityIcons name="cog-outline" size={24} color='#3A3937'/>
              <MaterialIcons name="airplay" size={24} color='#3A3937'/>
            </View>

            <View>
            <Slider
              style={{width: '100%', height: 40}}
              minimumValue={0}
              maximumValue={1}
              minimumTrackTintColor="#3A3937"
              maximumTrackTintColor="#3A393755"
              thumbTintColor="#3A3937"
            />
            </View>
          </View>
        </View>
       </View>
     </SafeAreaView>
     )
}