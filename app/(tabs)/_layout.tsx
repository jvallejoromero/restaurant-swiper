import {Tabs} from "expo-router";
import {Image, ImageSourcePropType} from 'react-native';
import {IMAGES} from "@/constants/images";
import {COLORS} from "@/constants/colors";

const TabIcon= ({ focused, iconSrc }: { focused: boolean, iconSrc: ImageSourcePropType }) => {
    return (
        <>
            {focused ? (
                <Image
                    source={iconSrc}
                    style={{
                        width:30,
                        height:30,
                        tintColor: COLORS.primary,
                    }}
                />

            ) : (
                <Image
                    source={iconSrc}
                    style={{
                        width:30,
                        height:30,
                        tintColor: "black",
                    }}
                />
            )}
        </>
    );
}


const _layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    height: 100,
                    paddingBottom: 10,
                    paddingTop: 10,
                    width: '100%',
                    alignSelf: 'center',
                    flexDirection: 'row',
                    justifyContent: "space-between",
                },
                sceneStyle: {
                    backgroundColor: COLORS.background_color,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} iconSrc={IMAGES.plate}/>
                    )
                }}
            />
            <Tabs.Screen
                name="attractions"
                options={{
                    title: 'Attractions',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} iconSrc={IMAGES.traveler_icon}/>
                    )
                }}
            />
            <Tabs.Screen
                name="matches"
                options={{
                    title: 'Likes',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} iconSrc={IMAGES.heart}/>
                    )
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon
                            focused={focused}
                            iconSrc={IMAGES.user2}
                        />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout;