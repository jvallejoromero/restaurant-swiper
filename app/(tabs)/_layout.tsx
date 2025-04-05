import React from 'react'
import {Tabs} from "expo-router";
import {Image} from 'react-native';
import {IMAGES} from "@/constants/images";
import {COLORS} from "@/constants/colors";

const TabIcon= ({focused, icon}:{focused:any; icon:any}) => {
    if (focused) {
        return (
            <Image
                source={icon}
                style={{
                    width:30,
                    height:30,
                    tintColor: COLORS.primary,
                }}
            />
        )
    } else {
        return (
            <Image
                source={icon}
                style={{
                    width:30,
                    height:30,
                    tintColor: "black",
                }}
            />
        )
    }
}


const _layout = () => {
    return (
        <Tabs screenOptions={{
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
        }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={IMAGES.home}/>
                    )
                }}
            />
            <Tabs.Screen
                name="restaurants"
                options={{
                    title: 'Restaurants',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={IMAGES.restaurant}/>
                    )
                }}
            />
            <Tabs.Screen
                name="restaurants/{id}"
                options={{
                    title: 'Restaurants',
                    headerShown: false,
                    tabBarShowLabel: false,
                }}
            />
            <Tabs.Screen
                name="matches"
                options={{
                    title: 'Likes',
                    headerShown: false,
                    tabBarShowLabel: false,
                    tabBarIcon: ({focused}) => (
                        <TabIcon focused={focused} icon={IMAGES.like}/>
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
                            icon={IMAGES.user}
                        />
                    )
                }}
            />
        </Tabs>
    )
}

export default _layout