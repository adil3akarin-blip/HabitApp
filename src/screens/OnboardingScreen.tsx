import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedPressable from '../components/ui/AnimatedPressable';
import * as appMetaRepo from '../db/appMetaRepo';
import { spring, timing } from '../motion/tokens';
import { colors, gradients, radii } from '../theme/tokens';
import { hapticSuccess, hapticTap } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: () => void;
}

const PAGES = [
  {
    icon: 'grid-outline' as const,
    title: 'Track habits\nvisually',
    subtitle: 'A year-at-a-glance grid makes progress obvious.',
    accentColor: colors.accentA,
    gradient: gradients.onboardingAmber,
  },
  {
    icon: 'calendar-outline' as const,
    title: 'Tap to log',
    subtitle: 'Mark today or any past day in the calendar.',
    accentColor: colors.accentB,
    gradient: gradients.onboardingCopper,
  },
  {
    icon: 'flame-outline' as const,
    title: 'Build streaks',
    subtitle: 'Set daily, weekly, or monthly goals and grow consistency.',
    accentColor: colors.success,
    gradient: gradients.onboardingForest,
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const dotPosition = useSharedValue(0);

  const bgOpacity = useSharedValue(1);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (page !== currentPage) {
      dotPosition.value = withSpring(page, spring.tight);
      // Subtle bg transition
      bgOpacity.value = 0.6;
      bgOpacity.value = withTiming(1, timing.standard);
    }
    setCurrentPage(page);
  };

  const activeDotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotPosition.value * (6 + 8) }],
  }));

  const handleNext = () => {
    hapticTap();
    if (currentPage < PAGES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentPage + 1) * SCREEN_WIDTH, animated: true });
    }
  };

  const handleComplete = async () => {
    hapticSuccess();
    await appMetaRepo.setBool('onboardingCompleted', true);
    onComplete();
  };

  const handleSkip = async () => {
    hapticTap();
    await appMetaRepo.setBool('onboardingCompleted', true);
    onComplete();
  };

  const isLastPage = currentPage === PAGES.length - 1;

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, bgAnimatedStyle]}>
        <LinearGradient
          colors={PAGES[currentPage].gradient as [string, string]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <AnimatedPressable onPress={handleSkip} scaleValue={0.95}>
          <Text style={styles.skipText}>Skip</Text>
        </AnimatedPressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {PAGES.map((page, index) => (
          <View key={index} style={styles.page}>
            <View style={[styles.iconCircle, { backgroundColor: page.accentColor + '18' }]}>
              <Ionicons name={page.icon} size={48} color={page.accentColor} />
            </View>
            <Text style={styles.title}>{page.title}</Text>
            <Text style={styles.subtitle}>{page.subtitle}</Text>
            <Text style={styles.pageNumber}>{index + 1}/{PAGES.length}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.dots}>
          {PAGES.map((_, index) => (
            <View
              key={index}
              style={styles.dot}
            />
          ))}
          <Animated.View style={[styles.dotActiveOverlay, activeDotStyle]} />
        </View>

        <AnimatedPressable
          style={styles.primaryButton}
          onPress={isLastPage ? handleComplete : handleNext}
          scaleValue={0.98}
        >
          <Text style={styles.primaryButtonText}>
            {isLastPage ? 'Get started' : 'Next'}
          </Text>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.8,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pageNumber: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textFaint,
    marginTop: 32,
    letterSpacing: 1,
  },
  footer: {
    paddingHorizontal: 24,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.glassStrong,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: colors.accentA,
    width: 20,
  },
  dotActiveOverlay: {
    position: 'absolute',
    left: 0,
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentA,
  },
  primaryButton: {
    borderRadius: radii.button,
    backgroundColor: colors.accentA,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
