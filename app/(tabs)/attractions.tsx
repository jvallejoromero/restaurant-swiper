import React from "react";
import SwipingScreenLayout from "@/components/screens/SwipingScreenLayout";
import PlaceView from "@/components/screens/PlaceView";

const placeType = "tourist_attraction";

const Attractions = () => {
    return (
        <SwipingScreenLayout placeType={placeType}>
            <PlaceView type={placeType} />
        </SwipingScreenLayout>
    );
}

export default Attractions;