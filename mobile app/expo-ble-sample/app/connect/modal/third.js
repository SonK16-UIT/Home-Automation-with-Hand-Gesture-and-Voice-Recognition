import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAuth } from '../../../context/authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';

const INDETERMINATE_WIDTH_FACTOR = 0.3;
const BAR_WIDTH_ZERO_POSITION = INDETERMINATE_WIDTH_FACTOR / (1 + INDETERMINATE_WIDTH_FACTOR);

const ProgressBar = ({
  animated = true,
  borderColor,
  borderRadius = 4,
  borderWidth = 1,
  children,
  color = 'rgba(0, 122, 255, 1)',
  height = 6,
  indeterminate = false,
  indeterminateAnimationDuration = 1000,
  onLayout,
  progress = 0,
  style,
  unfilledColor,
  width = 150,
  useNativeDriver = false,
  animationConfig = { bounciness: 0 },
  animationType = 'spring',
}) => {
  const [barWidth, setBarWidth] = useState(0);
  const [progressValue] = useState(new Animated.Value(indeterminate ? INDETERMINATE_WIDTH_FACTOR : progress));
  const [animationValue] = useState(new Animated.Value(BAR_WIDTH_ZERO_POSITION));

  useEffect(() => {
    if (indeterminate) {
      animate();
    }
  }, []);

  useEffect(() => {
    if (indeterminate) {
      animate();
    } else {
      Animated.spring(animationValue, {
        toValue: BAR_WIDTH_ZERO_POSITION,
        useNativeDriver,
      }).start();
    }
  }, [indeterminate]);

  useEffect(() => {
    const targetProgress = indeterminate ? INDETERMINATE_WIDTH_FACTOR : Math.min(Math.max(progress, 0), 1);

    if (animated) {
      Animated[animationType](progressValue, {
        ...animationConfig,
        toValue: targetProgress,
        useNativeDriver,
      }).start();
    } else {
      progressValue.setValue(targetProgress);
    }
  }, [progress]);

  const handleLayout = event => {
    if (!width) {
      setBarWidth(event.nativeEvent.layout.width);
    }
    if (onLayout) {
      onLayout(event);
    }
  };

  const animate = () => {
    animationValue.setValue(0);
    Animated.timing(animationValue, {
      toValue: 1,
      duration: indeterminateAnimationDuration,
      easing: Easing.linear,
      isInteraction: false,
      useNativeDriver,
    }).start(endState => {
      if (endState.finished) {
        animate();
      }
    });
  };

  const innerWidth = Math.max(0, width || barWidth) - borderWidth * 2;
  const containerStyle = {
    width,
    borderWidth,
    borderColor: borderColor || color,
    borderRadius,
    overflow: 'hidden',
    backgroundColor: unfilledColor,
  };
  const progressStyle = {
    backgroundColor: color,
    height,
    transform: [
      {
        translateX: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [innerWidth * -INDETERMINATE_WIDTH_FACTOR, innerWidth],
        }),
      },
      {
        translateX: progressValue.interpolate({
          inputRange: [0, 1],
          outputRange: [innerWidth / -2, 0],
        }),
      },
      {
        scaleX: progressValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.0001, 1],
        }),
      },
    ],
  };

  return (
    <View style={[containerStyle, style]} onLayout={handleLayout}>
      <Animated.View style={progressStyle} />
      {children}
    </View>
  );
};

export default function Third() {
  const { fetchCommand } = useAuth();
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [completed, setCompleted] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const route = useRoute();
  const { id } = route.params;
  const router = useRouter();
  useEffect(() => {
    console.log("third id", id);

    const animateProgress = () => {
      progress.setValue(0);
      Animated.loop(
        Animated.timing(progress, {
          toValue: 1,
          duration: 2000, // 2 seconds for a full loop
          easing: Easing.linear,
          useNativeDriver: false,
        }),
      ).start();
    };

    animateProgress();

    const checkCommand = async () => {
      const interval = setInterval(async () => {
        const result = await fetchCommand(id);
        const command = result.command; // Extract the command property from the result object
        console.log('Fetched command:', command);

        if (command === 'idle') {
          clearInterval(interval);
          progress.stopAnimation(() => {
            router.replace({ pathname: "/connect/modal/fourth", params: { id } });
          });
        }
      }, 2000); // Check every 2 seconds
    };

    checkCommand();

    return () => {
      progress.stopAnimation();
    };
  }, [fetchCommand, id, progress]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Establishing connection...</Text>
      <Text style={styles.subtitle}>Please keep your device on while pairing</Text>
      <View style={styles.progressContainer}>
        <MaterialIcons name="devices" size={60} color="white" style={styles.iconLeft} />
        <ProgressBar 
          progress={progress}
          width={wp(40)} 
          height={10}
          color="white" 
          unfilledColor="transparent" 
          borderColor="white" 
          borderWidth={2} 
          borderRadius={5} 
          indeterminate={indeterminate}
          indeterminateAnimationDuration={1000}
          style={styles.progressBar}
          useNativeDriver={true}
          animationType="timing"
        />
        <MaterialIcons name="smartphone" size={60} color="white" style={styles.iconRight} />
      </View>
      {completed && (
        <Link href={{ pathname: "/connect/modal/fourth", params: { id } }} asChild>
          <Text style={styles.linkText}>Go to fourth</Text>
        </Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F233A',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: hp(3.5),
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(1),
  },
  subtitle: {
    fontSize: hp(2),
    color: 'gray',
    textAlign: 'center',
    marginBottom: hp(4),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp(2),
  },
  iconLeft: {
    marginRight: wp(2),
  },
  iconRight: {
    marginLeft: wp(2),
  },
  progressBar: {
    marginHorizontal: wp(2),
  },
  linkText: {
    marginTop: hp(2),
    color: 'white',
    fontSize: hp(2.5),
    textDecorationLine: 'underline',
  },
});
