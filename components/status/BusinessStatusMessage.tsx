import React from "react";
import {BusinessStatus, PlaceOpeningHours} from "@/types/GoogleResponse.types";
import StatusMessage from "./StatusMessage";


const BusinessStatusMessage = ({ openingHours, status }: { openingHours?: PlaceOpeningHours, status: BusinessStatus}) => {
    return (
        <>
            {openingHours?.open_now && (
                <StatusMessage text={"This place is currently open"} status={"success"} />
            )}
            {!openingHours?.open_now && status === "OPERATIONAL" && (
                <StatusMessage text={"This place is currently closed"} status={"error"} />
            )}
            {status === "CLOSED_TEMPORARILY" && (
                <StatusMessage text={"This place is temporarily closed"} status={"warning"} />
            )}
            {status === "CLOSED_PERMANENTLY" && (
                <StatusMessage text={"This place is permanently closed"} status={"warning"} />
            )}
        </>
    );
}

export default BusinessStatusMessage;