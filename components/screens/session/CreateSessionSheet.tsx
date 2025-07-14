import BottomSheet, {BottomSheetScrollView} from "@gorhom/bottom-sheet";
import React, {useContext, useEffect, useMemo, useState} from "react";
import {UserLocationContext} from "@/context/UserLocationContext";
import {Pressable, StyleSheet, Text, TextInput, View} from "react-native";
import Slider from "@react-native-community/slider";
import MapView, {Marker} from "react-native-maps";
import { LocationObject } from "expo-location";
import * as Location from "expo-location";

export type CreateSessionOptions = {
    title: string;
    description: string;
    radius: number;
    filters: string[];
    participants: string[];
    location: LocationObject;
}

type CreateSessionSheetProps = {
    sheetRef: React.RefObject<BottomSheet | null>;
    index?: number;
    onChange?: (index: number) => void;
    onCreate: (selectedOptions: CreateSessionOptions) => void;
}

const LocationMap = ({ title, location }: {title: string, location: LocationObject }) => {
    return (
        <View className="w-full h-[150px] rounded-lg shadow shadow-accent-grey">
            <MapView
                region={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                style={{...StyleSheet.absoluteFillObject, borderRadius: 12}}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
            >
                <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title={title} />
            </MapView>
        </View>
    );
}

const snapPoints = useMemo(() => ["10%", "20%", "50%", "90%"], []);
const availableFilters = ["coming-soon"];

export default function CreateSessionSheet({ sheetRef, index, onChange, onCreate }: CreateSessionSheetProps) {
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [radius, setRadius] = useState<number>(10_000);
    const [filters, setFilters] = useState<string[]>([]);
    const [locationName, setLocationName] = useState<string>("your area");

    const { fetchingLocation, userLocation } = useContext(UserLocationContext);

    useEffect(() => {
        (async () => {
            if (fetchingLocation || userLocation === null) {
                return;
            }
            const geoInfo = await Location.reverseGeocodeAsync(userLocation.coords);
            if (geoInfo.length) {
                const { city, region, country } = geoInfo[0];
                const locationName = city || region || country || "your area";
                setLocationName(locationName);

                const defaultTitle = `Explore ${locationName}`;
                const defaultDesc = `Swipe around ${locationName} for great spots!`;
                setTitle(defaultTitle);
                setDescription(defaultDesc);
            }
        })();
    }, [fetchingLocation, userLocation]);

    if (fetchingLocation) {
        return null;
    }

    if (!userLocation) {
        return null;
    }

    const handleCreatePress = () => {
        onCreate({ title, description, radius, filters, participants: [], location: userLocation });
    }

    const toggleFilter = (f: string) => {
        setFilters((curr) =>
            curr.includes(f) ? curr.filter((x) => x !== f) : [...curr, f]
        );
    }

    const FilterOptions = () => {
        return (
            <View className="gap-2">
                <Text className="text-lg font-semibold">Filters</Text>
                <View className="flex-row flex-wrap gap-2">
                    {availableFilters.map((filterName) => (
                        <Pressable
                            key={filterName}
                            onPress={() => toggleFilter(filterName)}
                            className={`px-3 py-2 rounded-full ${
                                filters.includes(filterName)
                                    ? "bg-primary"
                                    : "bg-accent-grey/20"
                            }`}
                        >
                            <Text
                                className={`${
                                    filters.includes(filterName) ? "text-white" : "text-accent-grey"
                                }`}
                            >
                                {filterName}
                            </Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        );
    }


    return (
        <BottomSheet
            ref={sheetRef}
            index={index ?? -1}
            onChange={onChange}
            animateOnMount={false}
            snapPoints={snapPoints}
            enablePanDownToClose
            backgroundStyle={{ borderRadius: 20, backgroundColor: "#fff" }}
            handleIndicatorStyle={{
                marginTop: 5,
                backgroundColor: "#d52e4c",
                width: 35,
            }}
        >
            <BottomSheetScrollView className="py-4 px-6">
                <View className="gap-2">
                    <View className="gap-2">
                        <Text className="text-lg font-semibold">Location</Text>
                        <LocationMap location={userLocation} title={locationName} />
                    </View>
                    <View className="gap-2">
                        <Text className="text-lg font-semibold">Title</Text>
                        <TextInput
                            placeholder="Title"
                            placeholderTextColor={"#ccc"}
                            value={title}
                            onChangeText={setTitle}
                            className="border border-accent-grey rounded-lg p-2"
                        />
                    </View>
                    <View className="gap-2">
                        <Text className="text-lg font-semibold">Description</Text>
                        <TextInput
                            placeholder="Description"
                            placeholderTextColor={"#ccc"}
                            value={description}
                            onChangeText={setDescription}
                            className="border border-accent-grey rounded-lg p-2 h-20"
                            multiline
                        />
                    </View>
                    <FilterOptions />
                    <View className="gap-1">
                        <Text className="text-lg font-semibold">Radius: {radius} km</Text>
                        <Slider
                            minimumValue={1}
                            maximumValue={10_000}
                            step={1}
                            value={radius}
                            onValueChange={setRadius}
                            minimumTrackTintColor={"#d52e4c"}
                        />
                    </View>
                    <Pressable
                        onPress={handleCreatePress}
                        className="bg-primary py-4 rounded-lg items-center"
                    >
                        <Text className="text-white text-lg font-semibold">Create Session 🚀</Text>
                    </Pressable>
                </View>
            </BottomSheetScrollView>
        </BottomSheet>
    );

}