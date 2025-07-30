import React from "react";
import SwipingScreenLayout from "@/components/layouts/SwipingScreenLayout";
import PlaceView from "@/components/screens/PlaceView";

const placeType = "restaurant";

const Index = () => {
    return (
        <SwipingScreenLayout placeType={placeType}>
            <PlaceView type={placeType} />
        </SwipingScreenLayout>
    );
}

export default Index;