import React from "react";
import {BusinessStatus, PlaceOpeningHours} from "@/types/GoogleResponse.types";
import StatusMessage from "./StatusMessage";


const BusinessStatusMessage = ({ openingHours, status }: { openingHours?: PlaceOpeningHours, status: BusinessStatus}) => {
    const openNow = openingHours?.open_now;

    if (status === "CLOSED_PERMANENTLY") {
        return <StatusMessage text="This place is permanently closed" status="warning" />;
    }
    if (status === "CLOSED_TEMPORARILY") {
        return <StatusMessage text="This place is temporarily closed" status="warning" />;
    }

    if (status === "OPERATIONAL") {
        if (openNow === true) return <StatusMessage text="This place is currently open" status="success" />;
        if (openNow === false) return <StatusMessage text="This place is currently closed" status="error" />;
        return null;
    }
    return null;
};

export default BusinessStatusMessage;