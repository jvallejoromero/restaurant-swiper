import LottieView from "lottie-react-native";
import {View} from "react-native";

export const ForkAnimation = () => {
    const animationPath = require('../../assets/animations/red-fork-animation.json');

    return (
        <View className="flex-1 justify-center items-center bg-background">
            <LottieView
                source={animationPath}
                autoPlay
                loop
                style={{ width: 200, height: 200 }}
            />
        </View>
    );
}

export const CardsSwipeAnimation = ({ width = 200, height = 200 }: { width?: number, height?: number }) => {
    const animationPath = require('../../assets/animations/cards-animation-red.json');

    return (
        <View className="flex-1 justify-center items-center">
            <LottieView
                source={animationPath}
                autoPlay
                loop
                style={{ width: width, height: height }}
            />
        </View>
    );
}