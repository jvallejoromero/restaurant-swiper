import {StyleSheet, View} from "react-native";
import React from "react";
import MapView, {Marker} from "react-native-maps";

export type PlaceDetailsMapProps = {
    latitude: number;
    longitude: number;
    title: string;
}

const PlaceDetailsMap = ({latitude, longitude, title}: PlaceDetailsMapProps) => {
    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                region={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
                pitchEnabled={false}
                rotateEnabled={true}
            >
                <Marker coordinate={{ latitude, longitude }} title={title} />
            </MapView>
        </View>
    );
}

export default PlaceDetailsMap;

const styles = StyleSheet.create({
    mapContainer: {
        height: 250,
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 3,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});