import {StyleSheet, Text, View} from "react-native";
import React from "react";
import {BusinessStatus, PlaceDetails, PlaceOpeningHours} from "@/utils/GoogleResponseTypes";
import Subheader from "@/components/headers/Subheader";

const BusinessOpeningHours = ({ details }: { details: PlaceDetails }) => {
    if (!details.opening_hours || details.business_status !== "OPERATIONAL") {
        return null;
    }

    if (!details.opening_hours.weekday_text ) {
        return (
            <View className="gap-2">
                <Subheader text={"Opening Hours"} />
                <View>
                    <Text style={{fontSize: 16}}>
                        We couldn't find any information about this business's opening hours.
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={{
            gap: 2,
        }}>
            <Subheader text={"Opening Hours"} />
            <View>
                {details.opening_hours.weekday_text.map((hours, index) => (
                    <Text key={index} style={{fontSize: 16}}>{hours}</Text>
                ))}
            </View>
        </View>
    );
}

export default BusinessOpeningHours;