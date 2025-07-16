export default {
  expo: {
    name: "Forked",
    slug: "forked-swiper-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/forked-icon.png",
    scheme: "restoswiper",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.jvallejoromero.forked",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY
      }
    },
    android: {
      package: "com.jvallejoromero.forked",
      adaptiveIcon: {
        foregroundImage: "./assets/images/forked-icon.png",
        backgroundColor: "#ffffff"
      },
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_API_KEY
        }
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/forked-icon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    owner: "jvallejoromero",
    extra: {
      router: {
        origin: false
      },
      eas: {
        projectId: "d75168a3-44a2-4f4b-b4a5-053a6309ff56"
      }
    }
  }
};
